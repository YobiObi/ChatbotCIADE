const API = import.meta.env.VITE_BACKEND_URL;

export async function fetchMisNotificaciones(token, limit = 50) {
  const res = await fetch(`${API}/api/notificaciones?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("No se pudieron cargar las notificaciones");
  return res.json(); // { items, unread }
}

export async function marcarNotificacionLeida(id, token) {
  const res = await fetch(`${API}/api/notificaciones/${id}/read`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("No se pudo marcar como leída");
}

export async function marcarTodasLeidas(token) {
  const res = await fetch(`${API}/api/notificaciones/read-all`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("No se pudieron marcar todas como leídas");
}
