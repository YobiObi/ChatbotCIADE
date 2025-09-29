import express from "express";
import { crearUsuario, obtenerUsuarios, actualizarUsuario, eliminarUsuario, eliminarUsuarios, obtenerCitas, actualizarCita, eliminarCita, eliminarCitas
} from "../controllers/admin.controller.js";

const router = express.Router();

// Usuarios
router.post("/admin/usuarios", crearUsuario);
router.get("/admin/usuarios", obtenerUsuarios);
router.put("/admin/usuarios/:uid", actualizarUsuario);
router.delete("/admin/usuarios/:uid", eliminarUsuario);
router.delete("/admin/usuarios", eliminarUsuarios); 

// Citas
router.get("/admin/citas", obtenerCitas);
router.put("/admin/citas/:id", actualizarCita);
router.delete("/admin/cita/:id", eliminarCita);
router.delete("/admin/citas", eliminarCitas);

export default router;
