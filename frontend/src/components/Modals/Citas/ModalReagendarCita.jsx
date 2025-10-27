import { useMemo, useState } from "react";

function toIsoFromLocal(dt) {
  const d = new Date(dt);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export default function ModalReagendarCita({ cita, onClose, onSubmit }) {
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [nuevaModalidad, setNuevaModalidad] = useState(cita?.modalidad || "virtual");
  const [nuevaUrl, setNuevaUrl] = useState("");
  const [nuevaUbicacion, setNuevaUbicacion] = useState(
    `CIADE - ${cita?.estudiante?.campus?.nombre || ""}`
  );
  const [motivoReagendo, setMotivoReagendo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const esVirtual = nuevaModalidad === "virtual";

  // opcional: evita seleccionar pasado (redondeado a 5 min)
  const minDateTimeLocal = useMemo(() => {
    const now = new Date();
    const minutes = now.getMinutes();
    const rounded = new Date(now);
    rounded.setMinutes(minutes + (5 - (minutes % 5 || 5)), 0, 0);
    const pad = (n) => String(n).padStart(2, "0");
    return `${rounded.getFullYear()}-${pad(rounded.getMonth() + 1)}-${pad(rounded.getDate())}T${pad(
      rounded.getHours()
    )}:${pad(rounded.getMinutes())}`;
  }, []);

  const handleGuardar = async () => {
    // validaciones mínimas
    if (!nuevaFecha) {
      alert("Debes seleccionar fecha y hora.");
      return;
    }
    const nuevaFechaISO = toIsoFromLocal(nuevaFecha);
    if (!nuevaFechaISO) {
      alert("La fecha/hora es inválida.");
      return;
    }
    if (esVirtual && !nuevaUrl.trim()) {
      alert("Debes ingresar el enlace de la reunión.");
      return;
    }
    if (!esVirtual && !nuevaUbicacion.trim()) {
      alert("Debes ingresar la nueva ubicación.");
      return;
    }

    // confirmación corta
    const ok = window.confirm("¿Estás segur@ de reagendar esta cita?");
    if (!ok) return;

    const payload = {
      nuevaFechaISO,
      nuevaModalidad,
      nuevaUbicacion: esVirtual ? null : nuevaUbicacion.trim(),
      nuevaUrl: esVirtual ? nuevaUrl.trim() : null,
      motivoReagendo: (motivoReagendo || "").trim(),
    };

    try {
      setSubmitting(true);
      await Promise.resolve(onSubmit(payload)); // por si onSubmit es async o sync
      alert("Cita reagendada con éxito.");
      onClose();
    } catch (e) {
      console.error(e);
      alert(e?.message || "No se pudo reagendar la cita.");
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
      onClick={onClose} // click fuera cierra
    >
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Reagendar cita</h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            <label className="form-label">Nueva fecha y hora</label>
            <input
              className="form-control"
              type="datetime-local"
              value={nuevaFecha}
              min={minDateTimeLocal}
              onChange={(e) => setNuevaFecha(e.target.value)}
            />

            <label className="form-label mt-3">Modalidad</label>
            <select
              className="form-select"
              value={nuevaModalidad}
              onChange={(e) => setNuevaModalidad(e.target.value)}
            >
              <option value="virtual">Virtual</option>
              <option value="presencial">Presencial</option>
            </select>

            {esVirtual ? (
              <>
                <label className="form-label mt-3">Nuevo enlace de reunión</label>
                <input
                  className="form-control"
                  placeholder="https://meet/zoom/teams..."
                  value={nuevaUrl}
                  onChange={(e) => setNuevaUrl(e.target.value)}
                />
              </>
            ) : (
              <>
                <label className="form-label mt-3">Nueva ubicación</label>
                <input
                  className="form-control"
                  placeholder="CIADE - Campus ..."
                  value={nuevaUbicacion}
                  onChange={(e) => setNuevaUbicacion(e.target.value)}
                />
              </>
            )}

            <label className="form-label mt-3">Motivo del reagendamiento</label>
            <textarea
              className="form-control"
              rows={3}
              value={motivoReagendo}
              onChange={(e) => setMotivoReagendo(e.target.value)}
              placeholder="(Opcional) Explica brevemente el motivo"
            />
          </div>

          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              className="btn btn-warning"
              onClick={handleGuardar}
              disabled={
                submitting ||
                !nuevaFecha ||
                (esVirtual ? !nuevaUrl.trim() : !nuevaUbicacion.trim())
              }
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
