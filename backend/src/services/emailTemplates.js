// backend/src/services/emailTemplates.js
// backend/src/services/emailTemplates.js

function wrapTemplate(title, contentHtml) {
  return `
  <div style="font-family:'Segoe UI',Arial,sans-serif;background:#f6f8fb;padding:20px;">
    <div style="max-width:600px;margin:auto;background:white;border-radius:8px;overflow:hidden;box-shadow:0 3px 8px rgba(0,0,0,0.1);">
      
      <div style="background:#003366;color:white;text-align:center;padding:20px 10px;">
        <img src="https://upload.wikimedia.org/wikipedia/commons/9/9b/Logo_UNAB.png" alt="Logo CIADE" width="80" style="margin-bottom:8px;">
        <h2 style="margin:0;font-size:20px;">${title}</h2>
      </div>

      <div style="padding:25px;color:#333;line-height:1.6;font-size:15px;">
        ${contentHtml}
      </div>

      <div style="background:#003366;color:white;text-align:center;padding:10px;font-size:13px;">
        <p style="margin:0;">© ${new Date().getFullYear()} CIADE · Universidad Andrés Bello</p>
        <p style="margin:4px 0 0;opacity:0.8;">Este es un mensaje automático, por favor no responder.</p>
      </div>
    </div>
  </div>`;
}

function fechaCL(iso) {
  try {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleString("es-CL", { dateStyle: "full", timeStyle: "short", timeZone: "America/Santiago" });
  } catch { return String(iso || "-"); }
}

export function tplCitaAceptada({ alumno, cita, enlaceVirtual, ubicacion }) {
  const fecha = cita?.fecha
    ? new Date(cita.fecha).toLocaleString("es-CL", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: "America/Santiago",
      })
    : "-";

  const esVirtual = cita?.modalidad === "virtual";

  const content = `
    <p>Hola <strong>${alumno?.firstName || "Alumno/a"}</strong>,</p>
    <p>Tu cita con CIADE ha sido <b>aceptada</b>.</p>
    <ul style="list-style:none;padding:0;">
      <li><b>Fecha y hora:</b> ${fecha}</li>
      <li><b>Modalidad:</b> ${cita?.modalidad || "-"}</li>
      ${
        esVirtual
          ? `<li><b>Enlace de reunión:</b> <a href="${enlaceVirtual}" target="_blank">${enlaceVirtual}</a></li>`
          : `<li><b>Ubicación:</b> ${ubicacion || "CIADE - Campus correspondiente"}</li>`
      }
    </ul>
    <p style="margin-top:20px;">¡Te esperamos!</p>
  `;

  return {
    subject: "📅 Cita Aceptada — CIADE",
    html: wrapTemplate("Cita Aceptada", content),
  };
}

export function tplCitaRechazada({ alumno, cita, observacion }) {
  const content = `
    <p>Hola <strong>${alumno?.firstName || "Alumno/a"}</strong>,</p>
    <p>Tu cita ha sido <b>rechazada</b>.</p>
    ${
      observacion
        ? `<p><b>Motivo:</b> ${observacion}</p>`
        : `<p>No se indicó un motivo específico.</p>`
    }
    <p>Puedes solicitar una nueva cita desde tu panel estudiantil CIADE.</p>
  `;

  return {
    subject: "❌ Cita Rechazada — CIADE",
    html: wrapTemplate("Cita Rechazada", content),
  };
}

export function tplCitaReagendada({
  alumno,
  cita,
  fechaAnteriorISO,
  nuevaFechaISO,
  nuevaModalidad,
  nuevaUbicacion,
  nuevaUrl,
  motivoReagendo,
}) {
  const anterior = fechaAnteriorISO
    ? new Date(fechaAnteriorISO).toLocaleString("es-CL", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: "America/Santiago",
      })
    : "-";

  const nueva = nuevaFechaISO
    ? new Date(nuevaFechaISO).toLocaleString("es-CL", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: "America/Santiago",
      })
    : "-";

  const esVirtual = (nuevaModalidad || cita?.modalidad) === "virtual";

  const content = `
    <p>Hola <strong>${alumno?.firstName || "Alumno/a"}</strong>,</p>
    <p>Tu cita ha sido <b>reagendada</b>.</p>
    <ul style="list-style:none;padding:0;">
      <li><b>Fecha anterior:</b> ${anterior}</li>
      <li><b>Nueva fecha:</b> ${nueva}</li>
      <li><b>Modalidad:</b> ${nuevaModalidad || cita?.modalidad || "-"}</li>
      ${
        motivoReagendo ? `<li><b>Motivo:</b> ${motivoReagendo}</li>` : ""
      }
      ${
        esVirtual
          ? `<li><b>Nuevo enlace:</b> <a href="${nuevaUrl}" target="_blank">${nuevaUrl}</a></li>`
          : `<li><b>Ubicación:</b> ${nuevaUbicacion || "CIADE - Campus correspondiente"}</li>`
      }
    </ul>
    <p style="margin-top:20px;">Por favor, confirma tu disponibilidad en la nueva fecha.</p>
  `;

  return {
    subject: "🔁 Cita Reagendada — CIADE",
    html: wrapTemplate("Cita Reagendada", content),
  };
}
