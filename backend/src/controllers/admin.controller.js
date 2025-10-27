import * as adminService from "../services/admin.service.js";
import admin from "../config/firebase.js";

// === Usuarios ===
export const crearUsuario = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { firstName, lastName, email, password, rut, campus, carrera, facultad, sede, role } = req.body;

    const camposObligatorios = [firstName, lastName, email, password, rut, campus, carrera, facultad, sede, role];
    const camposFaltantes = camposObligatorios.filter(c => typeof c !== "string" || c.trim() === "");
    if (camposFaltantes.length > 0) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const rolesValidos = ["Admin", "Alumno", "Coordinacion"];
    if (!rolesValidos.includes(role)) {
      return res.status(400).json({ error: "Rol inválido" });
    }

    const userFirebase = await admin.auth().createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    const nuevoUsuario = await adminService.crearUsuario(token, {
      uid: userFirebase.uid,
      firstName, lastName, email, rut, campus, carrera, facultad, sede, role,
    });

    res.status(201).json(nuevoUsuario);
  } catch (error) {
     const msg = (error?.errorInfo?.code === "app/invalid-credential" || String(error?.message || "").includes("invalid_grant"))
      ? "No se pudo conectar con la plataforma de autenticación. Revisa la llave del Service Account (Admin SDK) y la hora del servidor."
      : (error?.message || "Error interno");
    console.error("❌ Error en crearUsuario:", error);

  // Errores típicos de credenciales admin
  if (msg.includes("invalid_grant") || msg.includes("invalid-credential")) {
    return res.status(500).json({
      error: "No se pudo conectar con la plataforma. Revisa las credenciales del servidor."
    });
  }

  return res.status(error.status || 500).json({
    error: "No se pudo crear el usuario. Intenta nuevamente."
  });
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

export const obtenerUsuarioPorId = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "ID inválido obtenerUsuarioPorId" });

    const usuario = await adminService.obtenerUsuarioPorId(token, id);
    res.status(200).json(usuario);
  } catch (error) {
    console.error("Error en obtenerUsuarioPorId:", error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const actualizarUsuario = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "ID inválido actualizarUsuario" });

  try {
    const usuario = await adminService.actualizarUsuarioPorId(token, id, req.body);
    res.status(200).json(usuario);
  } catch (error) {
    console.error("Error en actualizarUsuario:", error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const eliminarUsuario = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "ID inválido eliminarUsuario" });

  try {
    await adminService.eliminarUsuarioPorId(token, id);
    res.status(200).json({ mensaje: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error en eliminarUsuario:", error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const eliminarUsuarios = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { uids } = req.body;
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

// === Citas ===
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

export const eliminarCitas = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("Token no proporcionado");
    const { ids } = req.body;
    await adminService.eliminarCitas(token, ids);
    res.json({ message: "Citas eliminadas con éxito" });
  } catch (error) {
    console.error("Error al eliminar citas:", error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

// === Coordinaciones (POR ID) ===
export const obtenerCoordinacionesUsuario = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "ID inválido obtenerCoordinacionesUsuario" });
    const rows = await adminService.obtenerCoordinacionesUsuarioPorId(token, id);
    res.json(rows);
  } catch (error) {
    console.error("Error en obtenerCoordinacionesUsuario:", error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const agregarCoordinacion = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const id = Number(req.params.id);
    const campusId = Number(req.body.campusId);
    const carreraId = Number(req.body.carreraId);
    if (!Number.isInteger(id)|| !Number.isInteger(campusId) || !Number.isInteger(carreraId)) 
      return res.status(400).json({ error: "IDs inválidos (id/campusId/carreraId deben ser enteros) agregarCoordinacion" });

    const row = await adminService.agregarCoordinacionPorId(token, id, campusId, carreraId);
    res.status(201).json(row);
  } catch (error) {
    console.error("Error en agregarCoordinacion:", error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const eliminarCoordinacion = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const id = Number(req.params.id);
    const campusId = Number(req.body.campusId);
    const carreraId = Number(req.body.carreraId);
    if (!Number.isInteger(id) || !Number.isInteger(campusId) || !Number.isInteger(carreraId)) 
      return res.status(400).json({ error: "IDs inválidos (id/campusId/carreraId deben ser enteros) eliminarCoordinacion" });

    await adminService.eliminarCoordinacionPorId(token, id, campusId, carreraId);
    res.json({ ok: true });
  } catch (error) {
    console.error("Error en eliminarCoordinacion:", error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

// === Catálogos ===
export const obtenerCatalogos = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const data = await adminService.obtenerCatalogos(token);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error en obtenerCatalogos:", error);
    res.status(error.status || 500).json({ error: error.message });
  }
};
