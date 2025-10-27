// SortBar.jsx
import React from "react";
import { SORT_MODES } from "../utils/sortCollection";

const DEFAULT_MODES = [SORT_MODES.NEWEST, SORT_MODES.OLDEST];
const LABELS = {
  [SORT_MODES.NEWEST]: "Más recientes",
  [SORT_MODES.OLDEST]: "Más antiguas",
  [SORT_MODES.PENDING_FIRST]: "Pendientes primero",
};

export default function SortBar({ value, onChange, modes = DEFAULT_MODES, className = "" }) {
  const safeModes = Array.isArray(modes) && modes.length ? modes : DEFAULT_MODES;

  return (
    <div className={`d-flex align-items-center gap-2 my-3 ${className}`}>
      <span className="text-muted">Ordenar:</span>
      <div className="btn-group" role="group" aria-label="Orden">
        {safeModes.map((mode) => {
          const isActive = value === mode;
          const cls = isActive ? "btn-institucional-sm active" : "btn-institucional-outline-sm";
          return (
            <button
              key={mode}
              type="button"
              className={`btn ${cls}`}
              onClick={() => onChange(mode)}
            >
              {LABELS[mode] ?? mode}
            </button>
          );
        })}
      </div>
    </div>
  );
}
