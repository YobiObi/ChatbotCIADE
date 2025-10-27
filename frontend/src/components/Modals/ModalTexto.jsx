export default function ModalTexto({ visible, title = "Detalle", text = "", onClose }) {
  if (!visible) return null;

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "600px" }}>
        <div className="modal-content" style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>{text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
