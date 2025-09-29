import * as adminService from "../services/admin.service.js";
import admin from "../config/firebase.js";

// Usuarios
export const crearUsuario = async (req, res) => {

  try {
    const token = req.headers.authorization?.split(" ")[1];

    const { firstName, lastName, email, password, rut, campus, carrera, facultad, sede, role } = req.body;

    const camposObligatorios = [firstName, lastName, email, password, rut, campus, carrera, facultad, sede, role];
    const camposFaltantes = camposObligatorios.filter(c => typeof c !== "string" || c.trim() === "");

    if (camposFaltantes.length > 0) {
      console.warn("⚠️ Faltan campos:", camposFaltantes);
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const rolesValidos = ["ADMIN", "ALUMNO", "COORDINACION"];
    if (!rolesValidos.includes(role)) {
      console.warn("⚠️ Rol inválido:", role);
      return res.status(400).json({ error: "Rol inválido" });
    }

    const userFirebase = await admin.auth().createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    const nuevoUsuario = await adminService.crearUsuario(token, {
      uid: userFirebase.uid,
      firstName,
      lastName,
      email,
      rut,
      campus,
      carrera,
      facultad,
      sede,
      role,
    });

    res.status(201).json(nuevoUsuario);
  } catch (error) {
    console.error("❌ Error en crearUsuario:", error);
    res.status(error.status || 500).json({ error: error.message || "Error interno" });
  }
};

export const obtenerUsuarios = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const usuarios = await adminService.obtenerUsuarios(token);
    res.status(200).json(usuarios);
  } catch (error) {
    console.error("Error en obtenerUsuarios:", error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const actualizarUsuario = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const uidTarget = req.params.uid;
  const data = req.body;

  try {
    const usuario = await adminService.actualizarUsuario(token, uidTarget, data);
    res.status(200).json(usuario);
  } catch (error) {
    console.error("Error en actualizarUsuario:", error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const eliminarUsuario = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const uidTarget = req.params.uid;

  try {
    await adminService.eliminarUsuario(token, uidTarget);
    res.status(200).json({ mensaje: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error en eliminarUsuario:", error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const eliminarUsuarios = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { uids } = req.body; // array de uids a eliminar

    if (!uids || !Array.isArray(uids) || uids.length === 0) {
      return res.status(400).json({ error: "No se proporcionaron usuarios a eliminar" });
    }

    await adminService.eliminarUsuarios(token, uids);

    res.json({ message: `${uids.length} usuario(s) eliminado(s) correctamente` });
  } catch (error) {
    console.error("Error en eliminarUsuarios:", error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

// Citas
export const obtenerCitas = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  try {
    const citas = await adminService.obtenerCitas(token);
    res.status(200).json(citas);
  } catch (error) {
    console.error("Error en obtenerCitas:", error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const actualizarCita = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const citaId = parseInt(req.params.id);
  const data = req.body;

  try {
    const cita = await adminService.actualizarCita(token, citaId, data);
    res.status(200).json(cita);
  } catch (error) {
    console.error("Error en actualizarCita:", error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

// Eliminar cita individual
export const eliminarCita = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("Token no proporcionado");

    const { id } = req.params;
    await adminService.eliminarCita(token, id);

    res.json({ message: "Cita eliminada con éxito" });
  } catch (error) {
    console.error("Error al eliminar cita:", error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

// Eliminar múltiples citas
export const eliminarCitas = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("Token no proporcionado");

    const { ids } = req.body; // se espera un array de IDs
    await adminService.eliminarCitas(token, ids);

    res.json({ message: "Citas eliminadas con éxito" });
  } catch (error) {
    console.error("Error al eliminar citas:", error);
    res.status(error.status || 500).json({ error: error.message });
  }
};