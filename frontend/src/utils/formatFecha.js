// src/utils/formatFecha.js
export function formatFechaCL(fechaISO, options = {}) {
  if (!fechaISO) return "—";
  try {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString("es-CL", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Santiago",
      ...options, // permite personalizar si lo necesitas
    });
  } catch {
    return "—";
  }
}
