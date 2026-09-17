import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({ open, title = 'Confirmar ação', message, onConfirm, onCancel }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p>{message}</p>
      <div className="flex gap-8" style={{ justifyContent: 'flex-end' }}>
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button variant="danger" onClick={onConfirm}>Confirmar</Button>
      </div>
    </Modal>
  );
}
