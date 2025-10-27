import admin from '../config/firebase.js';

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("Token no proporcionado");

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email }; // <- aquí se agrega uid, email, etc.
    next();
  } catch (error) {
    console.error("Error en middleware verificarToken:", error);
    res.status(401).json({ error: error.message });
  }
};
