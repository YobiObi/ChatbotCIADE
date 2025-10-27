// admin.repository.js
import prisma from "../config/prisma.js";

// === Catálogos (helpers individuales usados por el service) ===
export const findAllSedes = () =>
  prisma.sede.findMany({ orderBy: { nombre: "asc" } });

export const findAllCampus = () =>
  prisma.campus.findMany({ orderBy: { nombre: "asc" } }); // incluye sedeId

export const findAllFacultades = () =>
  prisma.facultad.findMany({ orderBy: { nombre: "asc" } });

export const findAllCarreras = () =>
  prisma.carrera.findMany({ orderBy: { nombre: "asc" } }); // incluye facultadId

// (si quieres conservar la versión agregada)
export const getCatalogos = async () => {
  const [sedes, campus, facultades, carreras] = await Promise.all([
    findAllSedes(),
    findAllCampus(),
    findAllFacultades(),
    findAllCarreras(),
  ]);
  return { sedes, campus, facultades, carreras };
};

// === Usuarios ===
export const createUser = (data) =>
  prisma.user.create({
    data: {
      uid: data.uid,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      rut: data.rut,
      roleId: data.roleId,
      campusId: data.campusId,
      carreraId: data.carreraId,
    },
  });

export const findAllUsers = () =>
  prisma.user.findMany({
    include: {
      role: true,
      campus: { include: { sede: true } },
      carrera: { include: { facultad: true } },
      coordinaciones: {
        include: {
          campus: { include: { sede: true } },
          carrera: { include: { facultad: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

// ——— por UID (compat) ———
export const findUserByUidWithRels = (uid) =>
  prisma.user.findUnique({
    where: { uid },
    include: {
      role: true,
      campus: { include: { sede: true } },
      carrera: { include: { facultad: true } },
      coordinaciones: {
        include: {
          campus: { include: { sede: true } },
          carrera: { include: { facultad: true } },
        },
      },
    },
  });

export const updateUserByUid = (uid, data) =>
  prisma.user.update({
    where: { uid },
    data,
    include: {
      role: true,
      campus: { include: { sede: true } },
      carrera: { include: { facultad: true } },
      coordinaciones: {
        include: {
          campus: { include: { sede: true } },
          carrera: { include: { facultad: true } },
        },
      },
    },
  });

export const updateUserByUidWithRels = (uid, data) => updateUserByUid(uid, data);

export const deleteUserByUid = (uid) =>
  prisma.user.delete({ where: { uid } });

export const deleteUsersByUids = (uids) =>
  prisma.user.deleteMany({ where: { uid: { in: uids } } });

// ——— por ID (nuevo flujo principal) ———
export const findUserByIdWithRels = (id) =>
  prisma.user.findUnique({
    where: { id },
    include: {
      role: true,
      campus: { include: { sede: true } },
      carrera: { include: { facultad: true } },
      coordinaciones: {
        include: {
          campus: { include: { sede: true } },
          carrera: { include: { facultad: true } },
        },
      },
    },
  });

export const updateUserByIdWithRels = (id, data) =>
  prisma.user.update({
    where: { id },
    data,
    include: {
      role: true,
      campus: { include: { sede: true } },
      carrera: { include: { facultad: true } },
      coordinaciones: {
        include: {
          campus: { include: { sede: true } },
          carrera: { include: { facultad: true } },
        },
      },
    },
  });

export const deleteUserById = (id) =>
  prisma.user.delete({ where: { id } });

// === Coordinaciones ===
// (Compat por UID si aún lo usas)
export const findCoordinacionesByUserUid = async (uid) => {
  const user = await prisma.user.findUnique({ where: { uid } });
  if (!user) return [];
  return prisma.coordinacion.findMany({
    where: { userId: user.id },
    include: {
      campus: { include: { sede: true } },
      carrera: { include: { facultad: true } },
    },
    orderBy: [{ campusId: "asc" }, { carreraId: "asc" }],
  });
};

export const addCoordinacion = async ({ uid, campusId, carreraId }) => {
  const user = await prisma.user.findUnique({ where: { uid } });
  if (!user) throw new Error("Usuario no encontrado");
  try {
    return await prisma.coordinacion.create({
      data: { userId: user.id, campusId, carreraId },
      include: {
        campus: { include: { sede: true } },
        carrera: { include: { facultad: true } },
      },
    });
  } catch (err) {
    if (err.code === "P2002") {
      throw new Error("Esta cobertura ya existe para este coordinador.");
    }
    throw err;
  }
};

export const removeCoordinacion = async ({ uid, campusId, carreraId }) => {
  const user = await prisma.user.findUnique({ where: { uid } });
  if (!user) throw new Error("Usuario no encontrado");
  return prisma.coordinacion.delete({
    where: {
      userId_campusId_carreraId: { userId: user.id, campusId, carreraId },
    },
  });
};

// ——— nuevas por ID ———
export const findCoordinacionesByUserId = async (userId) =>
  prisma.coordinacion.findMany({
    where: { userId: Number(userId) },
    include: {
      campus: { include: { sede: true } },
      carrera: { include: { facultad: true } },
    },
    orderBy: [{ campusId: "asc" }, { carreraId: "asc" }],
  });

export const addCoordinacionByUserId = async (userId, campusId, carreraId) => {
  try {
    return await prisma.coordinacion.create({
      data: { userId: Number(userId), campusId: Number(campusId), carreraId: Number(carreraId) },
      include: {
        campus: { include: { sede: true } },
        carrera: { include: { facultad: true } },
      },
    });
  } catch (err) {
    if (err.code === "P2002") {
      throw new Error("Esta cobertura ya existe para este coordinador.");
    }
    throw err;
  }
};

export const removeCoordinacionByUserId = async (userId, campusId, carreraId) =>
  prisma.coordinacion.delete({
    where: { userId_campusId_carreraId: { 
        userId: Number(userId),
        campusId: Number(campusId),
        carreraId: Number(carreraId), 
      },
    },
  });

// === Citas ===
export const findAllCitas = () =>
  prisma.cita.findMany({
    include: {
      estudiante: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          carrera: { select: { nombre: true } },
          campus: { select: { nombre: true } },
          rut: true,
        },
      },
      coordinador: { select: { firstName: true, lastName: true, email: true } },
    },
    orderBy: { fecha: "desc" },
  });

export const updateCitaById = (id, data) =>
  prisma.cita.update({ where: { id }, data });

export const deleteCitaById = (id) =>
  prisma.cita.delete({ where: { id: Number(id) } });

export const deleteCitasByIds = (ids) =>
  prisma.cita.deleteMany({ where: { id: { in: ids.map(Number) } } });
