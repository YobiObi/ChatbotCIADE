import { useEffect, useState } from "react";
import coordinadoresPorCampus from "../utils/coordinacionData";

export default function SelectorCoordinadorCIADE({ campus, carrera, value, onChange }) {
  const [coordinadoresFiltrados, setCoordinadoresFiltrados] = useState([]);

  useEffect(() => {
    if (!campus || !carrera) {
      setCoordinadoresFiltrados([]);
      return;
    }

    const filtrados = coordinadoresPorCampus.filter(c =>
      c.campus.includes(campus) && c.carreras.includes(carrera)
    );

    setCoordinadoresFiltrados(filtrados);
  }, [campus, carrera]);

  return (
    <div className="mb-3">
      <label className="form-label">Coordinador/a CIADE</label>
      <select
        name="coordinador"
        className="form-select"
        value={value}
        onChange={onChange}
        required
        disabled={coordinadoresFiltrados.length === 0}
      >
        <option value="">Selecciona Coordinador/a CIADE</option>
        {coordinadoresFiltrados.map((c) => (
          <option key={c.uid} value={c.uid}>{c.nombre}</option>
        ))}
      </select>

      {coordinadoresFiltrados.length === 0 && campus && carrera && (
        <div className="alert alert-warning mt-2">
          No hay coordinadores asignados para la carrera <strong>{carrera}</strong> en el campus <strong>{campus}</strong>.
        </div>
      )}
    </div>
  );
}
