// src/components/Citas/CitaStatusBadge.jsx
export default function CitaStatusBadge({ estado }) {
  const e = (estado || "").toLowerCase();
  const map = {
    aceptada: { cls: "bg-success", ico: "✅" },
    rechazada: { cls: "bg-danger", ico: "❌" },
    pendiente: { cls: "bg-secondary", ico: "⏳" },
  };
  const { cls, ico } = map[e] || { cls: "bg-secondary", ico: "" };
  return <span className={`badge text-capitalize ${cls}`}>{ico} {estado}</span>;
}
