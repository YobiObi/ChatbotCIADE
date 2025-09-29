import prisma from "../config/prisma.js";

// Obtener cita por ID
export const findById = (id, select) =>
  prisma.cita.findUnique({
    where: { id },
    ...(select && { select }),
  });

// Obtener todas las citas, opcionalmente filtradas
export const findAll = (filter = {}, include) =>
  prisma.cita.findMany({
    where: filter,
    ...(include && { include }),
    orderBy: { createdAt: "desc" },
  });

// Crear nueva cita
export const createCita = (data) =>
  prisma.cita.create({ data });

// Actualizar cita por ID
export const updateById = (id, data) =>
  prisma.cita.update({
    where: { id },
    data,
  });

// Eliminar cita por ID
export const deleteById = (id) =>
  prisma.cita.delete({
    where: { id },
  });
