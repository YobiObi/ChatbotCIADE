// backend/src/services/notificacion.service.js
import prisma from "../config/prisma.js";
import { sendMail } from "./mail.service.js";

/**
 * Envía correo al coordinador CIADE cuando un alumno crea una nueva solicitud de cita.
 * Busca al coordinador por coincidencia exacta de campusId + carreraId del estudiante.
 */
export async function notificarCoordinadorNuevaCita(citaId) {
  const cita = await prisma.cita.findUnique({
    where: { id: Number(citaId) },
    include: {
      estudiante: {
        include: {
          campus: { include: { sede: true } },
          carrera: { include: { facultad: true } },
        },
      },
    },
  });

  if (!cita || !cita.estudiante) return;

  const campusId = cita.estudiante.campusId;
  const carreraId = cita.estudiante.carreraId;

  // Buscar coordinador con cobertura exacta
  const cobertura = await prisma.coordinacion.findFirst({
    where: { campusId, carreraId },
    include: {
      user: true, // el coordinador
      campus: { include: { sede: true } },
      carrera: { include: { facultad: true } },
    },
  });

  if (!cobertura || !cobertura.user?.email) {
    console.warn("⚠️ No se encontró coordinador para cobertura:", { campusId, carreraId });
    return;
  }

  const { user: coordinador } = cobertura;
  const alumno = cita.estudiante;

  const subject = `Nueva solicitud de cita — ${alumno.firstName} ${alumno.lastName}`;
  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; line-height:1.5">
      <h2 style="margin:0 0 8px">Nueva solicitud de cita</h2>
      <p>Hola ${coordinador.firstName ?? "Coordinación"},</p>
      <p>Se ha registrado una nueva solicitud de cita de:</p>
      <ul>
        <li><b>Alumno(a):</b> ${alumno.firstName} ${alumno.lastName}</li>
        <li><b>RUT:</b> ${alumno.rut ?? "—"}</li>
        <li><b>Email:</b> ${alumno.email}</li>
        <li><b>Sede:</b> ${alumno.campus?.sede?.nombre ?? "—"}</li>
        <li><b>Campus:</b> ${alumno.campus?.nombre ?? "—"}</li>
        <li><b>Facultad:</b> ${alumno.carrera?.facultad?.nombre ?? "—"}</li>
        <li><b>Carrera:</b> ${alumno.carrera?.nombre ?? "—"}</li>
        <li><b>Estado:</b> ${cita.estado ?? "pendiente"}</li>
      </ul>
      <p>Puedes gestionar esta solicitud desde tu panel de coordinación.</p>
      <p style="color:#777; font-size:12px">Mensaje automático · CIADE</p>
    </div>
  `;

  try {
    await sendMail({
      to: coordinador.email,
      subject,
      html,
    });
    console.log(`📧 Notificación enviada a coordinador ${coordinador.email}`);
  } catch (err) {
    console.error("❌ Error enviando correo a coordinador:", err);
  }
}
