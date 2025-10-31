import prisma from "../config/prisma.js";

export const findByUid = (uid, options = {}) =>
  prisma.user.findUnique({
    where: { uid },
    ...options
  });

export const findById = (id, options = {}) =>
  prisma.user.findUnique({
    where: { id },
    ...options
  });

export const findByEmail = (email, select) =>
  prisma.user.findUnique({
    where: { email },
    ...(select && { select }),
  });

export const findByRut = (rut, select) =>
  prisma.user.findUnique({
    where: { rut },
    ...(select && { select }),
  });

export const createUser = (data) =>
  prisma.user.create({ data });

export const updateByUid = (uid, data) =>
  prisma.user.update({ where: { uid }, data });

export const deleteByUid = (uid) =>
  prisma.user.delete({ where: { uid } });
