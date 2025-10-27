// components/modals/FeedbackModal.jsx
export default function FeedbackModal({ open, title="Operación exitosa", message, onClose, autoCloseMs=1500 }) {
  if (!open) return null;

  // autocierra tras X ms
  setTimeout(onClose, autoCloseMs);

  return (
    <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.55)" }} onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered" onClick={(e)=>e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header bg-success text-white">
            <h5 className="modal-title">{title}</h5>
            <button className="btn-close btn-close-white" onClick={onClose} />
          </div>
          <div className="modal-body">
            <div className="alert alert-success mb-0">✅ {message}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
