import admin from "../config/firebase.js";
import * as adminRepo from "../repositories/admin.repository.js";
import * as userRepo from "../repositories/user.repository.js";
import { v4 as uuidv4 } from "uuid";

// Validar rol Admin
const validarAdmin = async (token) => {
  const decoded = await admin.auth().verifyIdToken(token);
  const uid = decoded.uid;

  const usuario = await userRepo.findByUid(uid);
  if (!usuario || usuario.role !== "ADMIN") {
    const error = new Error("Acceso denegado: rol no autorizado");
    error.status = 403;
    throw error;
  }

  return uid;
};

// Usuarios
export const crearUsuario = async (token, usuarioData) => {
  await validarAdmin(token);

  if (!usuarioData.uid) {
    usuarioData.uid = uuidv4();
  }

  const existente = await userRepo.findByEmail(usuarioData.email);
  if (existente) {
    const error = new Error("Ya existe un usuario con ese correo");
    error.status = 409;
    throw error;
  }

  // Validación condicional por rol
  const { role, rut, firstName, lastName, email, sede, campus, carrera, facultad } = usuarioData;

  if (!rut || !firstName || !lastName || !email || !role) {
    const error = new Error("Faltan datos básicos obligatorios");
    error.status = 400;
    throw error;
  }

  if (role === "ALUMNO") {
    if (!sede || !campus || !carrera || !facultad) {
      const error = new Error("Faltan datos académicos para el rol ALUMNO");
      error.status = 400;
      throw error;
    }
  }

  if (role === "COORDINACION") {
    if (!sede || !campus) {
      const error = new Error("Faltan datos de sede/campus para el rol COORDINACION");
      error.status = 400;
      throw error;
    }
  }

  return adminRepo.createUser(usuarioData);
};

export const obtenerUsuarios = async (token) => {
  await validarAdmin(token);
  return adminRepo.findAllUsers();
};

export const actualizarUsuario = async (token, uidTarget, data) => {
  await validarAdmin(token);
  return adminRepo.updateUserByUid(uidTarget, data);
};

export const eliminarUsuario = async (token, uidTarget) => {
  await validarAdmin(token);

  // Eliminar en Firebase
  try {
    await admin.auth().deleteUser(uidTarget);
  } catch (error) {
    console.warn(`⚠️ No se pudo eliminar en Firebase UID ${uidTarget}:`, error.message);
  }

  // Eliminar en Neon
  return adminRepo.deleteUserByUid(uidTarget);
};

export const eliminarUsuarios = async (token, uids) => {
  await validarAdmin(token);

  // Eliminar en Firebase en paralelo
  const resultados = await Promise.allSettled(
    uids.map((uid) => admin.auth().deleteUser(uid))
  );

  resultados.forEach((r, i) => {
    if (r.status === "rejected") {
      console.warn(`⚠️ No se pudo eliminar en Firebase UID ${uids[i]}:`, r.reason.message);
    }
  });

  // Eliminar en Neon
  return adminRepo.deleteUsersByUids(uids);
};

// Citas
export const obtenerCitas = async (token) => {
  await validarAdmin(token);
  return adminRepo.findAllCitas();
};

export const actualizarCita = async (token, citaId, data) => {
  await validarAdmin(token);
  return adminRepo.updateCitaById(citaId, data);
};

export const eliminarCita = async (token, citaId) => {
  await validarAdmin(token);
  return adminRepo.deleteCitaById(citaId);
};

// Eliminar varias citas
export const eliminarCitas = async (token, ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("No se proporcionaron IDs de citas para eliminar");
  }
  await validarAdmin(token);
  return adminRepo.deleteCitasByIds(ids);
};