import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import citaRoutes from "./routes/cita.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import institucionalRoutes from "./routes/institucional.routes.js";

import prisma from './config/prisma.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// montar rutas
app.use('/api', authRoutes);
app.use("/api", citaRoutes);
app.use("/api", adminRoutes);
app.use("/api", institucionalRoutes);

// más rutas: app.use('/api/citas', citasRoutes) — las iremos separando igual

app.post("/api/webhook", (req, res) => {
  console.log("Petición de Dialogflow:", req.body);
  res.json({ fulfillmentText: "Conexión exitosa con el backend Render ✅" });
});

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});

// shutdown ordenado (cierra Prisma)
const shutdown = async () => {
  console.log('Cerrando servidor...');
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
