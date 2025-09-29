import admin from '../config/firebase.js';
import * as userRepo from '../repositories/user.repository.js';

// Registro de usuario
export const register = async ({ token, firstName, lastName, rut, role, sede, campus, carrera, facultad }) => {
  if (!token) {
    const e = new Error("Token no proporcionado");
    e.status = 401;
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
    role,
    sede,
    campus,
    carrera,
    facultad,
  });

  return user;
};

// Obtener información completa del usuario (incluye rol)
export const getUsuarioInfo = async (token) => {
  if (!token) throw new Error("Token no proporcionado");

  const decoded = await admin.auth().verifyIdToken(token);
  const uid = decoded.uid;

  const user = await userRepo.findByUid(uid, {
    firstName: true,
    lastName: true,
    campus: true,
    carrera: true,
    role: true,
    email: true,
  });

  if (!user) {
    const error = new Error("Usuario no registrado");
    error.status = 404;
    throw error;
  }

  return user;
};
