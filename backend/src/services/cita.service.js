import admin from "../config/firebase.js";
import * as citaRepo from "../repositories/cita.repository.js";
import * as userRepo from "../repositories/user.repository.js";

// Crear nueva cita (solo alumnos)
export const crearCita = async ({ token, coordinadorId, modalidad, descripcion }) => {
  const decoded = await admin.auth().verifyIdToken(token);
  const uid = decoded.uid;

  const usuario = await userRepo.findByUid(uid);
  if (!usuario || usuario.role !== "ALUMNO") {
    const error = new Error("Solo los estudiantes pueden solicitar citas");
    error.status = 403;
    throw error;
  }

  if (!coordinadorId || !modalidad || !descripcion || descripcion.length > 500) {
    const error = new Error("Datos inválidos");
    error.status = 400;
    throw error;
  }

  return citaRepo.createCita({
    estudianteId: uid,
    coordinadorId,
    modalidad,
    descripcion,
  });
};

// Obtener citas de un coordinador
export const obtenerCitasCoordinador = async (token) => {
  const decoded = await admin.auth().verifyIdToken(token);
  const uid = decoded.uid;

  const usuario = await userRepo.findByUid(uid);
  if (!usuario || usuario.role !== "COORDINACION") {
    const error = new Error("Acceso restringido");
    error.status = 403;
    throw error;
  }

  return citaRepo.findAll({ coordinadorId: uid }, {
    estudiante: { select: { firstName: true, lastName: true, email: true, carrera: true, campus: true, facultad: true, rut: true } }
  });
};

// Actualizar estado de cita (solo coordinadores)
export const actualizarEstadoCita = async ({ token, citaId, estado }) => {
  const decoded = await admin.auth().verifyIdToken(token);
  const uid = decoded.uid;

  const usuario = await userRepo.findByUid(uid);
  if (!usuario || usuario.role !== "COORDINACION") {
    const error = new Error("Acceso restringido");
    error.status = 403;
    throw error;
  }

  const cita = await citaRepo.findById(citaId);
  if (!cita || cita.coordinadorId !== uid) {
    const error = new Error("Cita no encontrada o no autorizada");
    error.status = 404;
    throw error;
  }

  return citaRepo.updateById(citaId, { estado });
};

