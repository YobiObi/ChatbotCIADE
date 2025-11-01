import prisma from "../config/prisma.js";
import { sendMail } from "./mail.service.js";

function wrapTemplate(title, contentHtml) {
  return `
  <div style="font-family:'Segoe UI',Arial,sans-serif;background:#f6f8fb;padding:20px;">
    <div style="max-width:600px;margin:auto;background:white;border-radius:8px;overflow:hidden;box-shadow:0 3px 8px rgba(0,0,0,0.1);">
      <div style="background:#003366;color:white;text-align:center;padding:20px 10px;">
        <h2 style="margin:0;">${title}</h2>
      </div>
      <div style="padding:25px;color:#333;line-height:1.6;font-size:15px;">
        ${contentHtml}
      </div>
      <div style="background:#003366;color:white;text-align:center;padding:10px;font-size:13px;">
        <p style="margin:0;">© ${new Date().getFullYear()} CIADE — Universidad Andrés Bello</p>
      </div>
    </div>
  </div>`;
}

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

  const { campusId, carreraId } = cita.estudiante;
  const cobertura = await prisma.coordinacion.findFirst({
    where: { campusId, carreraId },
    include: { user: true, campus: { include: { sede: true } }, carrera: true },
  });

  if (!cobertura?.user?.email) {
    console.warn("⚠️ No se encontró coordinador para cobertura:", { campusId, carreraId });
    return;
  }

  const alumno = cita.estudiante;
  const coordinador = cobertura.user;

  const subject = `Nueva solicitud de cita — ${alumno.firstName} ${alumno.lastName}`;

  const content = `
    <p>Hola <strong>${coordinador.firstName || "Coordinador/a"}</strong>,</p>
    <p>Se ha registrado una nueva solicitud de cita de:</p>
    <ul style="list-style:none;padding:0;">
      <li><b>Alumno(a):</b> ${alumno.firstName} ${alumno.lastName}</li>
      <li><b>RUT:</b> ${alumno.rut}</li>
      <li><b>Email:</b> ${alumno.email}</li>
      <li><b>Sede:</b> ${alumno.campus?.sede?.nombre}</li>
      <li><b>Campus:</b> ${alumno.campus?.nombre}</li>
      <li><b>Facultad:</b> ${alumno.carrera?.facultad?.nombre}</li>
      <li><b>Carrera:</b> ${alumno.carrera?.nombre}</li>
      <li><b>Estado:</b> ${cita.estado}</li>
    </ul>
    <p>Puedes gestionar esta solicitud desde tu panel de coordinación CIADE.</p>
  `;

  try {
    await sendMail({ to: coordinador.email, subject, html: wrapTemplate("Nueva Solicitud de Cita", content) });
    console.log(`📧 Notificación enviada a coordinador ${coordinador.email}`);
  } catch (err) {
    console.error("❌ Error enviando correo a coordinador:", err);
  }
}
