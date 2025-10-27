import { useState } from "react";

export default function ModalRechazarCita({ onClose, onSubmit }) {
  const [motivo, setMotivo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRechazar = async () => {
    if (!motivo.trim()) {
      alert("Debes ingresar un motivo de rechazo.");
      return;
    }

    const confirmar = window.confirm("¿Estás segur@ de rechazar esta cita?");
    if (!confirmar) return;

    try {
      setSubmitting(true);
      await Promise.resolve(onSubmit({ motivo: motivo.trim() }));
      alert("Cita rechazada con éxito.");
      onClose();
    } catch (e) {
      console.error(e);
      alert(e?.message || "No se pudo rechazar la cita.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Rechazar cita</h5>
            <button className="btn-close btn-close-white" onClick={onClose} />
          </div>

          <div className="modal-body">
            <label className="form-label">
              Motivo de rechazo <small className="text-muted">(se notificará al estudiante)</small>
            </label>
            <textarea
              className="form-control"
              rows={4}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Explica brevemente el motivo del rechazo..."
            />
          </div>

          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              className="btn btn-danger"
              onClick={handleRechazar}
              disabled={!motivo.trim() || submitting}
            >
              {submitting ? "Rechazando..." : "Rechazar cita"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
