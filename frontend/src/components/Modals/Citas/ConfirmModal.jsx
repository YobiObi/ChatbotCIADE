// components/modals/ConfirmModal.jsx
export default function ConfirmModal({ open, title, message, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.55)" }} onClick={onCancel}>
      <div className="modal-dialog modal-dialog-centered" onClick={(e)=>e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header bg-warning text-dark">
            <h5 className="modal-title">{title}</h5>
            <button className="btn-close" onClick={onCancel} />
          </div>
          <div className="modal-body">
            <p className="mb-0">{message}</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onCancel}>Cancelar</button>
            <button className="btn btn-warning" onClick={onConfirm}>Confirmar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
