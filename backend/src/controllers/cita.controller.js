import * as citaService from "../services/cita.service.js";

export const crearCita = async (req, res) => {
  try {
    const { coordinadorId, modalidad, descripcion } = req.body;
    const token = req.headers.authorization?.split(" ")[1]; // tu token del frontend

    const cita = await citaService.crearCita({ token, coordinadorId, modalidad, descripcion });
    res.status(201).json({ cita });
  } catch (error) {
    console.error("Error en crearCita:", error);
    res.status(400).json({ error: error.message });
  }
};

export const obtenerCitasCoordinador = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const citas = await citaService.obtenerCitasCoordinador(token);
    res.status(200).json({ citas });
  } catch (error) {
    console.error("Error en obtenerCitasCoordinador:", error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const actualizarEstadoCita = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const citaId = parseInt(req.params.id);
  const { estado } = req.body;

  try {
    const cita = await citaService.actualizarEstadoCita({ token, citaId, estado });
    res.status(200).json({ message: "Estado actualizado", cita });
  } catch (error) {
    console.error("Error en actualizarEstadoCita:", error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

