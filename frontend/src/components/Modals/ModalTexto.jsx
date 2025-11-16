export default function ModalTexto({ visible, title = "Detalle", text = "", onClose }) {
  if (!visible) return null;

  // Convertimos cada línea en un bloque <p>
  const formatted = text
    .split("\n")
    .map((linea, i) => {
      if (!linea.includes(":")) {
        // líneas sin título → texto normal
        return <p key={i} className="mt-1">{linea}</p>;
      }

      const [label, ...resto] = linea.split(":");
      const valor = resto.join(":").trim();

      return (
        <p key={i} className="mt-2">
          <strong>{label}:</strong>{" "}
          <span>{valor}</span>
        </p>
      );
    });

  return (
    <div
      className="modal fade show"
      style={{
        display: "block",
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1050
      }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "600px" }}>
        <div className="modal-content" style={{ maxHeight: "70vh", overflowY: "auto" }}>
          
          {/* ENCABEZADO INSTITUCIONAL */}
          <div style={{ color: "white" }} className="modal-header bg-unab">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {/* CONTENIDO FORMATEADO */}
          <div className="modal-body">
            {formatted}
          </div>

        </div>
      </div>
    </div>
  );
}
