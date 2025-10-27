import express from "express";
import { crearCita, obtenerCitasCoordinador, actualizarEstadoCita, obtenerCoordinadorAsignado, postReagendarCita, patchEstadoCita } from "../controllers/cita.controller.js";
import { obtenerCitasAlumno } from "../controllers/user.controller.js";
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Endpoints citas
router.post("/crear-cita", verifyToken, crearCita);
router.get("/alumno/citas", verifyToken, obtenerCitasAlumno);
router.get("/citas-coordinador", obtenerCitasCoordinador);
router.put("/actualizar-estado-cita/:id", verifyToken, actualizarEstadoCita);
router.get("/coordinador-asignado", verifyToken, obtenerCoordinadorAsignado);
router.post("/:id/reagendar", verifyToken, postReagendarCita);
router.patch("/:id/estado", verifyToken, patchEstadoCita);

export default router;
