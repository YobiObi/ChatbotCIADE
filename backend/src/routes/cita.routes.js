import express from "express";
import { crearCita, obtenerCitasCoordinador, actualizarEstadoCita } from "../controllers/cita.controller.js";
import { obtenerCitasAlumno } from "../controllers/user.controller.js";
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Endpoints citas
router.post("/crear-cita", verifyToken, crearCita);
router.get("/alumno/citas", verifyToken, obtenerCitasAlumno);
router.get("/citas-coordinador", obtenerCitasCoordinador);
router.put("/actualizar-estado-cita/:id", actualizarEstadoCita);

export default router;
