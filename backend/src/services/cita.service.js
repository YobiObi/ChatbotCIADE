// backend/src/services/cita.service.js
import admin from "../config/firebase.js";
import prisma from "../config/prisma.js";
import * as citaRepo from "../repositories/cita.repository.js";
import * as userRepo from "../repositories/user.repository.js";
import { enviarSiHabilitado } from "./email-helpers.js";
import { tplCitaAceptada, tplCitaReagendada, tplCitaRechazada } from "./emailTemplates.js";
import { notificarCoordinadorNuevaCita } from "./notificacion.service.js";

// Crear nueva cita (solo alumnos con cobertura válida)
export const crearCita = async ({ token, coordinadorId, modalidad, descripcion }) => {
  const decoded = await admin.auth().verifyIdToken(token);
  const uid = decoded.uid;

  const estudiante = await userRepo.findByUid(uid, { include: { role: true } });
  if (!estudiante || estudiante?.role?.name !== "Alumno") {
    const error = new Error("Solo los estudiantes pueden solicitar citas");
    error.status = 403;
    throw error;
  }

  if (!coordinadorId || !modalidad || !descripcion || descripcion.length > 500) {
    const error = new Error("Datos inválidos");
    error.status = 400;
    throw error;
  }

  const coordinador = await userRepo.findById(coordinadorId, { include: { role: true } });
  if (!coordinador || coordinador?.role?.name !== "Coordinacion") {
    const error = new Error("Coordinador inválido");
    error.status = 400;
    throw error;
  }

  const cobertura = await prisma.coordinacion.findUnique({
    where: {
      userId_campusId_carreraId: {
        userId: coordinador.id,
        campusId: estudiante.campusId,
        carreraId: estudiante.carreraId,
      },
    },
  });
  if (!cobertura) {
    const error = new Error("El coordinador no tiene cobertura para esta carrera y campus");
    error.status = 403;
    throw error;
  }

  // Crear la cita
  const nuevaCita = await citaRepo.createCita({
    estudianteId: estudiante.id,
    coordinadorId: coordinador.id,
    modalidad,
    descripcion,
    estado: "pendiente",
    fecha: new Date(),
  });

  // Notificar al coordinador (no bloquea la respuesta si falla)
  notificarCoordinadorNuevaCita(nuevaCita.id).catch((e) =>
    console.error("Error al notificar al coordinador:", e)
  );

  return nuevaCita;
};

// Obtener citas de un coordinador
export const obtenerCitasCoordinador = async (token) => {
  const decoded = await admin.auth().verifyIdToken(token);
  const uid = decoded.uid;

  const usuario = await userRepo.findByUid(uid, { include: { role: true } });
  if (!usuario || usuario.role.name !== "Coordinacion") {
    const error = new Error("Acceso restringido");
    error.status = 403;
    throw error;
  }

  return citaRepo.findAll(
    { coordinadorId: usuario.id },
    {
      estudiante: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          rut: true,
          carrera: {
            select: {
              nombre: true,
              facultad: {                // <= AQUÍ
                select: { nombre: true }
              }
            }
          },
          campus: {
            select: {
              nombre: true,
              sede: {                    // opcional si lo usas
                select: { nombre: true }
              }
            }
          }
        }
      }
    }
  );
};

// Actualizar estado de cita (solo coordinadores) + envío de correos
export const actualizarEstadoCita = async ({
  token,
  citaId,
  estado,
  observacion, // motivo de rechazo (si aplica)
  enlaceVirtual, // si modalidad = virtual (al aceptar)
  ubicacion, // si modalidad = presencial (al aceptar)
  fechaISO, // fecha de la cita ingresada por coordinación
}) => {
  const decoded = await admin.auth().verifyIdToken(token);
  const uid = decoded.uid;

  const usuario = await userRepo.findByUid(uid, { include: { role: true } });
  if (!usuario || usuario.role.name !== "Coordinacion") {
    const error = new Error("Acceso restringido");
    error.status = 403;
    throw error;
  }

  const cita = await citaRepo.findById(citaId);
  if (!cita || cita.coordinadorId !== usuario.id) {
    const error = new Error("Cita no encontrada o no autorizada");
    error.status = 404;
    throw error;
  }

  // Si acepta, validar y setear fecha si viene
  const dataUpdate = { estado, observacion };
  if (estado === "aceptada" && fechaISO) {
    const nuevaFecha = new Date(fechaISO);
    if (Number.isNaN(nuevaFecha.getTime())) {
      const err = new Error("fechaISO inválida");
      err.status = 400;
      throw err;
    }
    dataUpdate.fecha = nuevaFecha;
  }

  if (estado === "aceptada" || estado === "rechazada") {
    dataUpdate.gestionadaEn = new Date();
  }

  const citaActualizada = await citaRepo.updateById(citaId, dataUpdate);

  // Envío de correos electrónicos
  try {
    const alumno = await userRepo.findById(cita.estudianteId);

    if (estado === "aceptada") {
      const { subject, html } = tplCitaAceptada({
        alumno,
        cita: { ...cita, fecha: citaActualizada.fecha || cita.fecha },
        enlaceVirtual,
        ubicacion,
      });
      await enviarSiHabilitado({ to: alumno.email, subject, html });
    } else if (estado === "rechazada") {
      const { subject, html } = tplCitaRechazada({ alumno, cita, observacion });
      await enviarSiHabilitado({ to: alumno.email, subject, html });
    }
  } catch (e) {
    console.error("[email] actualizarEstadoCita fallo:", e);
  }

  return citaActualizada;
};

// Obtener coordinación asignada para un alumno
export const obtenerCoordinadorAsignado = async (token) => {
  const decoded = await admin.auth().verifyIdToken(token);
  const uid = decoded.uid;

  const alumno = await userRepo.findByUid(uid, {
    include: { role: true, campus: true, carrera: true },
  });

  if (!alumno || alumno.role?.name !== "Alumno") {
    const error = new Error("Solo los alumnos pueden consultar coordinación asignada");
    error.status = 403;
    throw error;
  }

  const cobertura = await prisma.coordinacion.findFirst({
    where: {
      campusId: alumno.campusId,
      carreraId: alumno.carreraId,
      user: { role: { name: "Coordinacion" } },
    },
    include: {
      user: { include: { role: true, campus: true, carrera: true } },
    },
  });

  if (!cobertura || !cobertura.user) {
    const error = new Error("No hay coordinación CIADE asignada para tu carrera y campus");
    error.status = 404;
    throw error;
  }

  const coordinador = cobertura.user;

  return {
    id: coordinador.id,
    uid: coordinador.uid,
    firstName: coordinador.firstName,
    lastName: coordinador.lastName,
    email: coordinador.email,
    role: { name: coordinador.role?.name || "Sin rol" },
    campus: { nombre: coordinador.campus?.nombre || "Sin campus" },
    carrera: { nombre: coordinador.carrera?.nombre || "Sin carrera" },
  };
};

// Reagendar cita (solo coordinadores) + correo simple
export const reagendarCita = async ({
  token,
  citaId,
  nuevaFechaISO,
  nuevaModalidad,
  nuevaUbicacion,
  nuevaUrl,
  motivoReagendo,
}) => {
  const decoded = await admin.auth().verifyIdToken(token);
  const uid = decoded.uid;

  const usuario = await userRepo.findByUid(uid, { include: { role: true } });
  if (!usuario || usuario.role.name !== "Coordinacion") {
    const error = new Error("Acceso restringido");
    error.status = 403;
    throw error;
  }

  const cita = await citaRepo.findById(citaId);
  if (!cita || cita.coordinadorId !== usuario.id) {
    const error = new Error("Cita no encontrada o no autorizada");
    error.status = 404;
    throw error;
  }

  if (!nuevaFechaISO) {
    const error = new Error("Nueva fecha requerida");
    error.status = 400;
    throw error;
  }

  const nuevaFecha = new Date(nuevaFechaISO);
  if (Number.isNaN(nuevaFecha.getTime())) {
    const error = new Error("Formato de fecha inválido");
    error.status = 400;
    throw error;
  }

  // ✅ Transacción: solo operaciones de BD
  const citaActualizada = await prisma.$transaction(async (tx) => {
    const dataUpdate = {
      fecha: nuevaFecha,
      reagendadaEn: new Date(),
    };
    if (nuevaModalidad) dataUpdate.modalidad = nuevaModalidad;
    if (motivoReagendo) dataUpdate.observacion = motivoReagendo;

    return tx.cita.update({
      where: { id: cita.id },
      data: dataUpdate,
    });
  });

  // ✅ Envío de correo fuera de la transacción (no bloquea ni causa timeout)
  (async () => {
    try {
      const alumno = await userRepo.findById(cita.estudianteId);
      const { subject, html } = tplCitaReagendada({
        alumno,
        cita: {
          ...cita,
          fecha: nuevaFecha,
          modalidad: nuevaModalidad || cita.modalidad,
        },
        fechaAnteriorISO: cita.fecha?.toISOString?.() || cita.fecha,
        nuevaFechaISO: nuevaFecha.toISOString(),
        nuevaModalidad,
        nuevaUbicacion,
        nuevaUrl,
        motivoReagendo,
      });

      await enviarSiHabilitado({ to: alumno.email, subject, html });
      console.log(`📧 Correo de reagendo enviado a ${alumno.email}`);
    } catch (e) {
      console.warn("[email] reagendarCita fallo:", e.message);
    }
  })();

  return citaActualizada;
};