import prisma from "../config/prisma.js";

export const findByUid = (uid, select) =>
  prisma.user.findUnique({
    where: { uid },
    ...(select && { select }),
  });

export const findByEmail = (email, select) =>
  prisma.user.findUnique({
    where: { email },
    ...(select && { select }),
  });

export const createUser = (data) =>
  prisma.user.create({ data });

export const updateByUid = (uid, data) =>
  prisma.user.update({ where: { uid }, data });

export const deleteByUid = (uid) =>
  prisma.user.delete({ where: { uid } });
