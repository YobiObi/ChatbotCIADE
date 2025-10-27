// src/services/admin.service.js
import admin from "../config/firebase.js";
import prisma from "../config/prisma.js";
import * as adminRepo from "../repositories/admin.repository.js";
import * as userRepo from "../repositories/user.repository.js";
import { v4 as uuidv4 } from "uuid";

const validarAdmin = async (token) => {
  const decoded = await admin.auth().verifyIdToken(token);
  const uid = decoded.uid;
  const usuario = await userRepo.findByUid(uid, { include: { role: true } });
  if (!usuario || usuario?.role?.name !== "Admin") {
    const error = new Error("Acceso denegado: rol no autorizado");
    error.status = 403;
    throw error;
  }
  return uid;
};

// === Catálogos ===
export const obtenerCatalogos = async (token) => {
  await validarAdmin(token);
  // usando los helpers individuales
  const [sedes, campus, facultades, carreras] = await Promise.all([
    adminRepo.findAllSedes(),
    adminRepo.findAllCampus(),
    adminRepo.findAllFacultades(),
    adminRepo.findAllCarreras(),
  ]);
  return { sedes, campus, facultades, carreras };
};

// === Usuarios ===
export const crearUsuario = async (token, usuarioData) => {
  await validarAdmin(token);
  if (!usuarioData.uid) usuarioData.uid = uuidv4();

  const existente = await userRepo.findByEmail(usuarioData.email);
  if (existente) {
    const error = new Error("Ya existe un usuario con ese correo");
    error.status = 409;
    throw error;
  }

  const { role, rut, firstName, lastName, email, campus, carrera } = usuarioData;
  if (!rut || !firstName || !lastName || !email || !role || !campus || !carrera) {
    const error = new Error("Faltan datos obligatorios");
    error.status = 400;
    throw error;
  }

  const roleObj = await prisma.role.findUnique({ where: { name: role } });
  const campusObj = await prisma.campus.findUnique({ where: { nombre: campus } });
  const carreraObj = await prisma.carrera.findUnique({ where: { nombre: carrera } });
  if (!roleObj || !campusObj || !carreraObj) {
    const error = new Error("Datos institucionales inválidos");
    error.status = 400;
    throw error;
  }

  const nuevoUsuario = await adminRepo.createUser({
    uid: usuarioData.uid,
    email, rut, firstName, lastName,
    roleId: roleObj.id,
    campusId: campusObj.id,
    carreraId: carreraObj.id,
  });

  if (role === "Coordinacion") {
    await prisma.coordinacion.create({
      data: { userId: nuevoUsuario.id, campusId: campusObj.id, carreraId: carreraObj.id },
    });
  }

  return nuevoUsuario;
};

export const obtenerUsuarios = async (token) => {
  await validarAdmin(token);
  return adminRepo.findAllUsers();
};

// ——— NUEVOS por ID ———
export const obtenerUsuarioPorId = async (token, id) => {
  await validarAdmin(token);
  const usuario = await adminRepo.findUserByIdWithRels(id);
  if (!usuario) {
    const err = new Error("Usuario no encontrado");
    err.status = 404;
    throw err;
  }
  return usuario;
};

export const actualizarUsuarioPorId = async (token, id, data) => {
  await validarAdmin(token);
  const actualizaciones = { ...data };

  if (data.role) {
    const roleObj = await prisma.role.findUnique({ where: { name: data.role } });
    if (!roleObj) throw new Error("Rol inválido");
    actualizaciones.roleId = roleObj.id;
    delete actualizaciones.role;
  }
  if (data.campus) {
    const campusObj = await prisma.campus.findUnique({ where: { nombre: data.campus } });
    if (!campusObj) throw new Error("Campus inválido");
    actualizaciones.campusId = campusObj.id;
    delete actualizaciones.campus;
  }
  if (data.carrera) {
    const carreraObj = await prisma.carrera.findUnique({ where: { nombre: data.carrera } });
    if (!carreraObj) throw new Error("Carrera inválida");
    actualizaciones.carreraId = carreraObj.id;
    delete actualizaciones.carrera;
  }

  return adminRepo.updateUserByIdWithRels(id, actualizaciones);
};

export const eliminarUsuarioPorId = async (token, id) => {
  await validarAdmin(token);

  // buscamos el uid para intentar limpiar en Firebase (si quieres mantener esta lógica)
  const user = await adminRepo.findUserByIdWithRels(id);
  if (user?.uid) {
    try { await admin.auth().deleteUser(user.uid); } 
    catch (e) { console.warn(`⚠️ No se pudo eliminar en Firebase UID ${user.uid}:`, e.message); }
  }
  return adminRepo.deleteUserById(id);
};

// Eliminar múltiples usuarios por UID (borra en Firebase y luego en BD)
export const eliminarUsuarios = async (token, uids) => {
  await validarAdmin(token);

  if (!Array.isArray(uids) || uids.length === 0) {
    const err = new Error("No se proporcionaron UIDs para eliminar");
    err.status = 400;
    throw err;
  }

  // 1) Intentar borrado masivo en Firebase (mejor rendimiento que uno por uno)
  try {
    const result = await admin.auth().deleteUsers(uids);
    // result.successCount / result.failureCount disponibles si quieres loguear
    if (result.failureCount > 0) {
      console.warn("⚠️ Algunos UIDs no se pudieron borrar en Firebase:", result.errors);
      // No detenemos el flujo: igual seguimos con la BD para mantener consistencia
    }
  } catch (e) {
    console.warn("⚠️ No se pudo eliminar en Firebase (deleteUsers):", e.message);
    // No hacemos throw aquí para no bloquear la limpieza de la BD
  }

  // 2) Borrar en BD
  return adminRepo.deleteUsersByUids(uids);
};

// === (compat por UID si aún la usas en alguna parte del front) ===
export const actualizarUsuario = async (token, uidTarget, data) => {
  await validarAdmin(token);
  const actualizaciones = { ...data };

  if (data.role) {
    const roleObj = await prisma.role.findUnique({ where: { name: data.role } });
    if (!roleObj) throw new Error("Rol inválido");
    actualizaciones.roleId = roleObj.id;
    delete actualizaciones.role;
  }
  if (data.campus) {
    const campusObj = await prisma.campus.findUnique({ where: { nombre: data.campus } });
    if (!campusObj) throw new Error("Campus inválido");
    actualizaciones.campusId = campusObj.id;
    delete actualizaciones.campus;
  }
  if (data.carrera) {
    const carreraObj = await prisma.carrera.findUnique({ where: { nombre: data.carrera } });
    if (!carreraObj) throw new Error("Carrera inválida");
    actualizaciones.carreraId = carreraObj.id;
    delete actualizaciones.carrera;
  }

  return adminRepo.updateUserByUidWithRels(uidTarget, actualizaciones);
};

export const obtenerUsuarioPorUid = async (token, uidTarget) => {
  await validarAdmin(token);
  const usuario = await adminRepo.findUserByUidWithRels(uidTarget);
  if (!usuario) {
    const err = new Error("Usuario no encontrado");
    err.status = 404;
    throw err;
  }
  return usuario;
};

// === Coordinaciones (POR ID) ===
export const obtenerCoordinacionesUsuarioPorId = async (token, userId) => {
  await validarAdmin(token);
  return adminRepo.findCoordinacionesByUserId(userId);
};

export const agregarCoordinacionPorId = async (token, userId, campusId, carreraId) => {
  await validarAdmin(token);
  userId   = Number(userId);
  campusId = Number(campusId);
  carreraId= Number(carreraId);

  if (!Number.isInteger(userId) || !Number.isInteger(campusId) || !Number.isInteger(carreraId)) {
    const err = new Error("IDs inválidos (userId/campusId/carreraId)");
    err.status = 400;
    throw err;
  }

  // 1) Validar que la carrera se dicte en el campus
  const vinc = await prisma.carreraCampus.findFirst({
    where: { campusId, carreraId },
    select: { id: true },
  });
  if (!vinc) {
    const err = new Error("La carrera seleccionada no se imparte en ese campus.");
    err.status = 400;
    throw err;
  }

  // 2) Obtener la facultad de la carrera seleccionada
  const carrera = await prisma.carrera.findUnique({
    where: { id: carreraId },
    select: { id: true, nombre: true, facultadId: true, facultad: { select: { nombre: true } } },
  });
  if (!carrera) {
    const err = new Error("Carrera inválida.");
    err.status = 400;
    throw err;
  }

  // 3) ¿Ya hay un coordinador en ESTE campus para ESTA FACULTAD (aunque sea otra carrera)?
  const conflicto = await prisma.coordinacion.findFirst({
    where: {
      campusId,
      // cualquier cobertura cuya carrera pertenezca a la misma facultad
      carrera: { facultadId: carrera.facultadId },
      NOT: { userId }, // de otro usuario
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
      carrera: { select: { id: true, nombre: true } },
    },
  });

  if (conflicto) {
    const err = new Error(
      `Ya existe una cobertura asignada en ${carrera.facultad?.nombre} para este campus ` +
      `(coordinador/a: ${conflicto.user.firstName} ${conflicto.user.lastName}).`
    );
    err.status = 409;
    throw err;
  }

  // 4) Crear la cobertura (tu repo ya maneja P2002 si el mismo usuario la repite)
  return adminRepo.addCoordinacionByUserId(userId, campusId, carreraId);
};

export const eliminarCoordinacionPorId = async (token, userId, campusId, carreraId) => {
  await validarAdmin(token);
  userId   = Number(userId);
  campusId = Number(campusId);
  carreraId= Number(carreraId);

  if (!Number.isInteger(userId) || !Number.isInteger(campusId) || !Number.isInteger(carreraId)) {
    const err = new Error("IDs inválidos (userId/campusId/carreraId)");
    err.status = 400;
    throw err;
  }
  return adminRepo.removeCoordinacionByUserId(userId, campusId, carreraId);
};

// === Citas ===
export const obtenerCitas = async (token) => {
  await validarAdmin(token);
  return adminRepo.findAllCitas();
};

export const actualizarCita = async (token, citaId, data) => {
  await validarAdmin(token);
  if (data.estado && !["pendiente", "aceptada", "rechazada"].includes(data.estado)) {
    throw new Error("Estado de cita inválido");
  }
  return adminRepo.updateCitaById(citaId, data);
};

export const eliminarCita = async (token, citaId) => {
  await validarAdmin(token);
  return adminRepo.deleteCitaById(citaId);
};

export const eliminarCitas = async (token, ids) => {
  if (!Array.isArray(ids) || ids.length === 0)
    throw new Error("No se proporcionaron IDs de citas para eliminar");
  await validarAdmin(token);
  return adminRepo.deleteCitasByIds(ids);
};
