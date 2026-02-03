import React, { useState } from 'react';
import CategoryForm from './CategoryForm';


function AddCategoryModal({ isOpen, onClose, onSubmit }) {
  const [categoryData, setCategoryData] = useState({
    name: '',
    description: ''
  });

  const handleSubmit = (data) => {
    onSubmit(data);
    // Сбрасываем форму после успешного добавления
    setCategoryData({
      name: '',
      description: ''
    });
  };

  const handleClose = () => {
    // Сбрасываем форму при закрытии
    setCategoryData({
      name: '',
      description: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Добавить новую категорию</h3>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        
        <div className="add-category-form">
          <CategoryForm
            onSubmit={handleSubmit}
            onCancel={handleClose}
            initialData={null}
          />
        </div>
      </div>
    </div>
  );
}

export default AddCategoryModal;