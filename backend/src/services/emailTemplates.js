// backend/src/services/emailTemplates.js
function fechaCL(iso) {
  try {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleString("es-CL", { dateStyle: "full", timeStyle: "short", timeZone: "America/Santiago" });
  } catch { return String(iso || "-"); }
}

export function tplCitaAceptada({ alumno, cita, enlaceVirtual, ubicacion }) {
  const subject = "Confirmación de Cita - CIADE";
  const fecha = (cita?.fecha?.toISOString?.() || cita?.fecha);
  const inicio = fecha ? new Date(fecha).toLocaleString("es-CL",{dateStyle:"full",timeStyle:"short",timeZone:"America/Santiago"}) : "-";
  const esVirtual = (cita?.modalidad === "virtual");

  const html = `
    <p>${alumno?.firstName ? `Hola ${alumno.firstName},` : "Hola,"}</p>
    <p>Tu cita ha sido <b>aceptada</b>.</p>
    <p><b>Fecha/Hora:</b> ${inicio}</p>
    <p><b>Modalidad:</b> ${cita?.modalidad || "-"}</p>
   ${esVirtual
      ? `<p><b>Enlace de reunión:</b> ${enlaceVirtual ? `<a href="${enlaceVirtual}">${enlaceVirtual}</a>` : "(pendiente)"} </p>`
      : `<p><b>Ubicación:</b> ${ubicacion || `CIADE - ${alumno?.campus?.nombre || "Campus"}`}</p>`
    }
   ${cita?.descripcion ? `<p><b>Descripción:</b> ${cita.descripcion}</p>` : ""}
    <p>¡Te esperamos!</p>
  `;
  return { subject, html };
}

export function tplCitaRechazada({ alumno, cita, observacion }) {
  const subject = "Cancelación de Cita - CIADE";
  const html = `
    <p>${alumno?.firstName ? `Hola ${alumno.firstName},` : "Hola,"}</p>
    <p>Tu cita ha sido <b>rechazada</b>.</p>
    ${observacion ? `<p><b>Motivo:</b> ${observacion}</p>` : ""}
    <p>Si deseas, puedes solicitar una nueva cita desde tu panel.</p>
  `;
  return { subject, html };
}

export function tplCitaReagendada({ alumno, cita, fechaAnteriorISO, nuevaFechaISO, nuevaModalidad, nuevaUbicacion, nuevaUrl, motivoReagendo }) {
  const subject = "Reagendamiento de Cita - CIADE";
  const anterior = fechaAnteriorISO ? new Date(fechaAnteriorISO).toLocaleString("es-CL",{dateStyle:"full",timeStyle:"short",timeZone:"America/Santiago"}) : "-";
  const nueva = nuevaFechaISO ? new Date(nuevaFechaISO).toLocaleString("es-CL",{dateStyle:"full",timeStyle:"short",timeZone:"America/Santiago"}) : "-";
  const esVirtual = (nuevaModalidad || cita?.modalidad) === "virtual";

  const html = `
    <p>${alumno?.firstName ? `Hola ${alumno.firstName},` : "Hola,"}</p>
    <p>Tu cita ha sido <b>reagendada</b>.</p>
    <p><b>Fecha anterior:</b> ${anterior}</p>
    <p><b>Nueva fecha:</b> ${nueva}</p>
    <p><b>Modalidad:</b> ${nuevaModalidad || cita?.modalidad || "-"}</p>
   ${motivoReagendo ? `<p><b>Motivo:</b> ${motivoReagendo}</p>` : ""}
   ${esVirtual
      ? `<p><b>Enlace de reunión:</b> ${nuevaUrl ? `<a href="${nuevaUrl}">${nuevaUrl}</a>` : "(pendiente)"}</p>`
      : `<p><b>Ubicación:</b> ${nuevaUbicacion || `CIADE - ${alumno?.campus?.nombre || "Campus"}`}</p>`
    }
    ${cita?.descripcion ? `<p><b>Descripción:</b> ${cita.descripcion}</p>` : ""}
  `;
  return { subject, html };
}

