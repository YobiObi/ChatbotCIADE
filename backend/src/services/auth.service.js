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

 // 🔎 Validaciones de duplicado más claras
 const byUid = await userRepo.findByUid(uid);
 if (byUid) {
   const e = new Error("El usuario ya está registrado");
   e.status = 409;
   e.field = "uid";
    throw e;
 }

 const byEmail = await userRepo.findByEmail(email, { id: true });
 if (byEmail) {
   const e = new Error("El correo ya está registrado");
   e.status = 409;
   e.field = "email";
   throw e;
  }

  const byRut = await userRepo.findByRut(rut, { id: true });
  if (byRut) {
   const e = new Error("El RUT ya está registrado");
   e.status = 409;
   e.field = "rut";
   throw e;
 }

 let user;
 try {
   user = await userRepo.createUser({
     uid,
     email,
     firstName,
     lastName,
     rut,
     roleId: roleObj.id,
     campusId: campusObj.id,
     carreraId: carreraObj.id
   });
  } catch (err) {
   // 🛡️ Respaldo: por si la condición de carrera ocurre por condición de carrera en paralelo
   if (err.code === "P2002") { // unique constraint
     const target = Array.isArray(err.meta?.target) ? err.meta.target[0] : err.meta?.target;
     const e = new Error(`El ${target === "rut" ? "RUT" : "correo"} ya está registrado`);
     e.status = 409;
     e.field = target || "unknown";
     throw e;
   }
   throw err;
 }

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
