const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getCitasCoordinador(token) {
  const res = await fetch(`${API}/api/citas-coordinador`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al cargar citas");
  return data; // { citas }
}

export async function aceptarCita(id, { enlaceVirtual, ubicacion, fechaISO  }, token) {
  const res = await fetch(`${API}/api/actualizar-estado-cita/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ estado: "aceptada", enlaceVirtual, ubicacion, fechaISO }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al aceptar cita");
  return data; // { message, cita }
}

export async function rechazarCita(id, { motivo }, token) {
  const res = await fetch(`${API}/api/actualizar-estado-cita/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ estado: "rechazada", observacion: motivo }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al rechazar cita");
  return data;
}

export async function reagendarCita(id, payload, token) {
  // payload: { nuevaFechaISO, nuevaModalidad, nuevaUbicacion, nuevaUrl, motivoReagendo }
  const res = await fetch(`${API}/api/${id}/reagendar`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al reagendar cita");
  return data;
}
