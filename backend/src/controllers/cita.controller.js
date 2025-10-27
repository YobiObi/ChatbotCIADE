import * as citaService from "../services/cita.service.js";

export const crearCita = async (req, res) => {
  try {
    const { coordinadorId, modalidad, descripcion } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

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

// PUT /actualizar-estado-cita/:id
export const actualizarEstadoCita = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const citaId = Number(req.params.id);
  const { estado, observacion, enlaceVirtual, ubicacion, fechaISO  } = req.body || {};

  try {
    if (!Number.isFinite(citaId)) return res.status(400).json({ error: "ID de cita inválido" });
    if (!estado) return res.status(400).json({ error: "estado es requerido" });

    const citaActualizada = await citaService.actualizarEstadoCita({
      token,
      citaId,
      estado,
      observacion,   // motivo de rechazo (si aplica)
      enlaceVirtual, // si modalidad=virtual
      ubicacion,    // si modalidad=presencial
      fechaISO       
    });

    res.status(200).json({ message: "Estado actualizado", cita: citaActualizada });
  } catch (error) {
    console.error("Error en actualizarEstadoCita:", error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const obtenerCoordinadorAsignado = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const coordinador = await citaService.obtenerCoordinadorAsignado(token);
    res.status(200).json({ coordinador });
  } catch (error) {
    console.error("Error en obtenerCoordinadorAsignado:", error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

// POST /api/citas/:id/reagendar
export async function postReagendarCita(req, res) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "No autenticado" });

    const citaId = Number(req.params.id);
    if (!Number.isFinite(citaId)) {
      return res.status(400).json({ error: "ID de cita inválido" });
    }

    const {
      nuevaFechaISO,
      nuevaModalidad,
      nuevaUbicacion,
      nuevaUrl,
      motivoReagendo
    } = req.body || {};

    if (!nuevaFechaISO) {
      return res.status(400).json({ error: "nuevaFechaISO es requerida" });
    }

    const result = await citaService.reagendarCita({
      token,
      citaId,
      nuevaFechaISO,
      nuevaModalidad,   // "presencial" | "virtual"
      nuevaUbicacion,
      nuevaUrl,
      motivoReagendo
    });

    return res.json({ ok: true, cita: result });
  } catch (err) {
    console.error("[citas] postReagendarCita error:", err);
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || "Error al reagendar la cita" });
  }
}

// PATCH /api/citas/:id/estado (si lo mantienes)
export async function patchEstadoCita(req, res) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "No autenticado" });

    const citaId = Number(req.params.id);
    const { estado, observacion, enlaceVirtual, ubicacion } = req.body || {};
    if (!Number.isFinite(citaId) || !estado) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    const result = await citaService.actualizarEstadoCita({
      token,
      citaId,
      estado,
      observacion,
      enlaceVirtual,
      ubicacion
    });

    return res.json({ ok: true, cita: result });
  } catch (err) {
    console.error("[citas] patchEstadoCita error:", err);
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || "Error al actualizar estado" });
  }
}
