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
    res.status(error.status || 500).json({ error: error.message });
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
