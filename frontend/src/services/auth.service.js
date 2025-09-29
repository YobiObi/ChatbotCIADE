// src/services/auth.service.js

// Registrar usuario
export const register = async (payload, token) => {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Error al registrar usuario");
  }

  return await res.json();
};

// Obtener información completa del usuario (nombre, correo, rol, campus)
export const getUsuarioInfo = async (token) => {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Error al obtener información del usuario" }));
    throw new Error(errorData.error || "Error al obtener información del usuario");
  }

  return await res.json();
};