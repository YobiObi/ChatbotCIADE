import * as authService from "../services/auth.service.js";
import prisma from '../config/prisma.js';

// Registro de usuario
export const registerUser = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  try {
    const user = await authService.register({ ...req.body, token });
    res.status(201).json({ message: "Usuario registrado", usuario: user });
  } catch (error) {
    console.error("Error en registerUser:", error);
    // Prisma unique violation como red de seguridad
    if (error.code === "P2002") {
      const target = Array.isArray(error.meta?.target) ? error.meta.target[0] : error.meta?.target;
      const msg = `El ${target === "rut" ? "RUT" : "correo"} ya está registrado`;
      return res.status(409).json({ error: msg, field: target || "unknown" });
    }
    res.status(error.status || 500).json({ error: error.message, field: error.field });
  }
};

// Obtener información del usuario
export const getUsuarioInfo = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });

    const usuario = await authService.getUsuarioInfo(token);
    res.json(usuario);
  } catch (error) {
    console.error("Error en getUsuario:", error);
    res.status(error.status || 500).json({ error: error.message });
  }
};
