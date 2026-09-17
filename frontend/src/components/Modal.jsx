export default function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="flex-between mb-16">
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Fechar</button>
        </div>
        {children}
      </div>
    </div>
  );
}
