import prisma from "../config/prisma.js";

// Usuarios
export const createUser = (data) =>
  prisma.user.create({
    data: {
      uid: data.uid,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      rut: data.rut,
      campus: data.campus,
      carrera: data.carrera,
      facultad: data.facultad,
      sede: data.sede,
      role: data.role,
    },
  });

export const findAllUsers = () =>
  prisma.user.findMany({
    select: {
      uid: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      campus: true,
      rut: true,
      carrera: true,
      sede: true,
      facultad: true,
    },
  });

export const updateUserByUid = (uid, data) =>
  prisma.user.update({
    where: { uid },
    data,
  });

export const deleteUserByUid = (uid) =>
  prisma.user.delete({
    where: { uid },
  });

  export const deleteUsersByUids = (uids) =>
  prisma.user.deleteMany({
    where: { uid: { in: uids } },
  });

// Citas
export const findAllCitas = () =>
  prisma.cita.findMany({
    include: {
      estudiante: { select: { firstName: true, lastName: true, email: true } },
      coordinador: { select: { firstName: true, lastName: true } },
    },
  });

export const updateCitaById = (id, data) =>
  prisma.cita.update({
    where: { id },
    data,
  });

// Eliminar cita individual
export const deleteCitaById = (id) =>
  prisma.cita.delete({
    where: { id: Number(id) },
  });

// Eliminar varias citas (ids: array de strings)
export const deleteCitasByIds = (ids) =>
  prisma.cita.deleteMany({
    where: { id: { in: ids } },
  });