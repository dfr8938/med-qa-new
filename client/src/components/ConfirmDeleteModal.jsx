import React from 'react';

function ConfirmDeleteModal({ isOpen, onClose, onConfirm, username }) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Подтверждение удаления</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <p>Вы уверены, что хотите удалить администратора <strong>{username}</strong>?</p>
          <p className="warning-text">
            Это действие невозможно отменить.
          </p>
        </div>
        
        <div className="form-actions">
          <button type="button" className="btn btn-danger" onClick={handleConfirm}>
            Удалить
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;