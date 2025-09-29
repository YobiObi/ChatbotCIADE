import * as userRepo from "../repositories/user.repository.js";
import admin from "../config/firebase.js";
import prisma from "../config/prisma.js";

export const obtenerUsuario = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("Token no proporcionado");

    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    const usuario = await userRepo.findByUid(uid);
    if (!usuario) throw new Error("Usuario no encontrado");

    res.json({
      email: usuario.email,
      firstName: usuario.firstName,
      lastName: usuario.lastName,
      campus: usuario.campus,
      role: usuario.role,
    });
  } catch (error) {
    console.error("Error en obtenerUsuario:", error);
    res.status(401).json({ error: error.message });
  }
};

export const obtenerCitasAlumno = async (req, res) => {
  try {
    const { uid } = req.user; // uid del alumno logueado

    const citas = await prisma.cita.findMany({
      where: { estudianteId: uid },
      include: { coordinador: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(citas);
  } catch (error) {
    console.error("Error al obtener citas alumno:", error);
    res.status(500).json({ error: "Error interno al obtener citas" });
  }
};
