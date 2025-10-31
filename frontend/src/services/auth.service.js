// src/services/auth.service.js

// Registrar usuario en tu backend (ya creado en Firebase y con token listo)
export const register = async (payload, token) => {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data?.error || "Error al registrar usuario");
    err.field = data?.field;       // "rut" | "email" | undefined
    err.status = res.status;
    throw err;
  }

  return data; // { message, usuario }
};

// Obtener información completa del usuario (nombre, correo, rol, campus)
export const getUsuarioInfo = async (token) => {
  const url = `${import.meta.env.VITE_BACKEND_URL}/api/auth/me`;

  // Intento 1: GET
  let res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  // Si la ruta real está en POST y el GET devolvió 404, reintenta con POST
  if (res.status === 404) {
    res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data?.error || "Error al obtener información del usuario");
    err.status = res.status;
    throw err;
  }

  return data;
};