// src/components/Table/FechaCell.jsx
import { formatFechaCL } from "../../utils/formatFecha";

export default function FechaCell({ value, fallback = "—" }) {
  if (!value) return <span>{fallback}</span>;
  try {
    return <span>{formatFechaCL(value)}</span>;
  } catch {
    return <span>{fallback}</span>;
  }
}
