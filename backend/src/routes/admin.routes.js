import express from "express";
import {
  crearUsuario,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
  eliminarUsuarios,

  obtenerCitas,
  actualizarCita,
  eliminarCita,
  eliminarCitas,

  obtenerCatalogos,

  // coordinaciones
  obtenerCoordinacionesUsuario,
  agregarCoordinacion,
  eliminarCoordinacion,
} from "../controllers/admin.controller.js";

const router = express.Router();

// Catálogos
router.get("/admin/catalogos", obtenerCatalogos);

// Usuarios
router.post("/admin/usuarios", crearUsuario);
router.get("/admin/usuarios", obtenerUsuarios);
router.get("/admin/usuarios/:id", obtenerUsuarioPorId); // ← por ID
router.put("/admin/usuarios/:id", actualizarUsuario);   // ← por ID
router.delete("/admin/usuarios/:id", eliminarUsuario);  // ← por ID
router.delete("/admin/usuarios", eliminarUsuarios);

// Coordinaciones por usuario (POR ID)
router.get("/admin/usuarios/:id/coordinaciones", obtenerCoordinacionesUsuario);
router.post("/admin/usuarios/:id/coordinaciones", agregarCoordinacion);
router.delete("/admin/usuarios/:id/coordinaciones", eliminarCoordinacion);

// Citas
router.get("/admin/citas", obtenerCitas);
router.put("/admin/citas/:id", actualizarCita);
router.delete("/admin/cita/:id", eliminarCita);
router.delete("/admin/citas", eliminarCitas);

export default router;
