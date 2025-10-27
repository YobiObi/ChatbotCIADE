import admin from '../config/firebase.js';
import prisma from '../config/prisma.js';
import * as userRepo from '../repositories/user.repository.js';

// Registro de usuario
export const register = async ({ token, firstName, lastName, rut, role, campus, carrera }) => {
  if (!token) {
    const e = new Error("Token no proporcionado");
    e.status = 401;
    throw e;
  }

  const roleObj = await prisma.role.findUnique({ where: { name: role } });
  const campusObj = await prisma.campus.findUnique({ where: { nombre: campus } });
  const carreraObj = await prisma.carrera.findUnique({ where: { nombre: carrera } });

  if (!roleObj || !campusObj || !carreraObj) {
    const e = new Error("Datos institucionales inválidos");
    e.status = 400;
    throw e;
  }

  const decoded = await admin.auth().verifyIdToken(token);
  const { uid, email } = decoded;

  const existing = await userRepo.findByUid(uid);
  if (existing) {
    const e = new Error("El usuario ya está registrado");
    e.status = 409;
    throw e;
  }

  const user = await userRepo.createUser({
    uid,
    email,
    firstName,
    lastName,
    rut,
    roleId: roleObj.id,
    campusId: campusObj.id,
    carreraId: carreraObj.id
  });

  return user;
};

// Obtener información completa del usuario (incluye rol)
export const getUsuarioInfo = async (token) => {
  if (!token) throw new Error("Token no proporcionado");

  const decoded = await admin.auth().verifyIdToken(token);
  const uid = decoded.uid;

  const user = await prisma.user.findUnique({
    where: { uid },
    include: {
      role: true,
      campus: true,
      carrera: true
    }
  });

  if (!user) {
    const error = new Error("Usuario no registrado");
    error.status = 404;
    throw error;
  }
  
  return user;
};
