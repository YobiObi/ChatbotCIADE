import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import * as userController from "../controllers/user.controller.js";
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Público
router.post('/auth/register', authController.registerUser);

// Protegidos (usar Authorization: Bearer <idToken>)
router.post('/auth/me', verifyToken, authController.getUsuarioInfo);
router.get("/usuario/:id", verifyToken, userController.obtenerUsuario);

export default router;
