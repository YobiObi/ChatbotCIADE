import { useState, useEffect, useMemo } from "react";

function toIsoFromLocal(datetimeLocal) {
  // datetimeLocal típico: "2025-11-20T10:30"
  const d = new Date(datetimeLocal);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString(); // ISO UTC
}

export default function ModalAceptarCita({ cita, onClose, onSubmit }) {
  const esVirtual = (cita?.modalidad || "").toLowerCase() === "virtual";

  const [enlaceVirtual, setEnlaceVirtual] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [fechaHora, setFechaHora] = useState(""); // datetime-local
  const [error, setError] = useState("");

  // Prefill ubicación para presencial
  useEffect(() => {
    if (!esVirtual) {
      setUbicacion(`CIADE - ${cita?.estudiante?.campus?.nombre || ""}`.trim());
    }
  }, [cita, esVirtual]);

  // min: ahora (evita seleccionar pasado)
  const minDateTimeLocal = useMemo(() => {
    const now = new Date();
    // Redondea a 5 minutos hacia adelante (opcional)
    const minutes = now.getMinutes();
    const rounded = new Date(now);
    rounded.setMinutes(minutes + (5 - (minutes % 5 || 5)), 0, 0);
    const pad = (n) => String(n).padStart(2, "0");
    const y = rounded.getFullYear();
    const m = pad(rounded.getMonth() + 1);
    const d = pad(rounded.getDate());
    const hh = pad(rounded.getHours());
    const mm = pad(rounded.getMinutes());
    return `${y}-${m}-${d}T${hh}:${mm}`;
  }, []);

  const handleConfirm = async ()  => {
    setError("");

    if (!fechaHora) {
      return setError("Debes seleccionar fecha y hora.");
    }
    const fechaISO = toIsoFromLocal(fechaHora);
    if (!fechaISO) {
      return setError("La fecha/hora es inválida.");
    }

    if (esVirtual) {
      if (!enlaceVirtual.trim()) return setError("Debes ingresar el enlace de la reunión.");
    } else {
      if (!ubicacion.trim()) return setError("Debes ingresar la ubicación.");
    }
    if (!window.confirm("¿Estás segur@ de aceptar la cita?")) return;
    await onSubmit({
      fechaISO,
      enlaceVirtual: esVirtual ? enlaceVirtual.trim() : null,
      ubicacion: !esVirtual ? ubicacion.trim() : null,
    });;
    alert("Cita aceptada con éxito");
    onClose();
  };

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.55)" }}
      tabIndex="-1"
      aria-modal="true"
      role="dialog"
      onClick={onClose} // click en backdrop cierra
    >
      <div
        className="modal-dialog"
        role="document"
        onClick={(e) => e.stopPropagation()} // evita cierre al click interno
      >
        <div className="modal-content shadow">
          <div className="modal-header">
            <h5 className="modal-title">Aceptar cita</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
          </div>

          <div className="modal-body">
            <p className="mb-2">
              Modalidad: <b className="text-capitalize">{cita?.modalidad}</b>
            </p>

            <div className="mb-3">
              <label className="form-label">Fecha y hora de la cita</label>
              <input
                className="form-control"
                type="datetime-local"
                value={fechaHora}
                min={minDateTimeLocal}
                onChange={(e) => setFechaHora(e.target.value)}
              />
              <div className="form-text">Usa la zona horaria local (se guardará en ISO).</div>
            </div>

            {esVirtual ? (
              <div className="mb-3">
                <label className="form-label">Enlace de reunión</label>
                <input
                  className="form-control"
                  placeholder="https://meet.google.com/abc-defg-hij (o Zoom/Teams)"
                  value={enlaceVirtual}
                  onChange={(e) => setEnlaceVirtual(e.target.value)}
                />
              </div>
            ) : (
              <div className="mb-3">
                <label className="form-label">Ubicación</label>
                <input
                  className="form-control"
                  placeholder="CIADE - Campus ..."
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                />
              </div>
            )}

            {error && <div className="alert alert-warning py-2 mb-0">{error}</div>}
          </div>

          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              className="btn btn-success"
              onClick={handleConfirm}
              disabled={
                !fechaHora ||
                (esVirtual ? !enlaceVirtual.trim() : !ubicacion.trim())
              }
            >
              Confirmar cita
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
