import express from "express";
import { obtenerCampus, obtenerCarreras, obtenerFacultades } from "../controllers/institucional.controller.js";

const router = express.Router();

router.get("/institucional/campus", obtenerCampus);
router.get("/institucional/carreras", obtenerCarreras);
router.get("/institucional/facultades", obtenerFacultades);


export default router;
