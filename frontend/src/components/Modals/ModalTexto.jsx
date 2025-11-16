export default function ModalTexto({ visible, title = "Detalle", text = "", onClose }) {
  if (!visible) return null;

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
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "650px" }}>
        <div className="modal-content" style={{ maxHeight: "75vh", overflowY: "auto" }}>

          {/* --- HEADER INSTITUCIONAL CIADE --- */}
          <div
            className="modal-header bg-unab"
            style={{
              color: "white",
              borderBottom: "3px solid #002244"
            }}
          >
            <h5 className="modal-title fw-bold">{title}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {/* --- CUERPO --- */}
          <div className="modal-body">
            {/* Elimina saltos dobles y aplica formato */}
            <div
              dangerouslySetInnerHTML={{
                __html: text
                  .replace(/\n\n/g, "<br/>")
                  .replace(/^(.+?):/gm, "<strong>$1:</strong>") // negrita antes de :
              }}
              style={{
                whiteSpace: "pre-wrap",
                lineHeight: "1.55",
                fontSize: "0.95rem",
                color: "#333"
              }}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
