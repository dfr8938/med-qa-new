import React, { useState, useEffect } from 'react';
import CategoryForm from './CategoryForm';


function EditCategoryModal({ isOpen, onClose, onSubmit, category }) {
  const [categoryData, setCategoryData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  // Инициализация формы данными редактируемой категории
  useEffect(() => {
    if (isOpen && category) {
      setCategoryData({
        name: category.name || '',
        description: category.description || ''
      });
      setErrors({});
    }
  }, [isOpen, category]);

  const handleSubmit = (data) => {
    // Проверяем, есть ли ошибки в данных формы
    const newErrors = {};
    
    // Проверяем, что data существует и содержит необходимые поля
    if (!data) {
      console.error('Данные формы отсутствуют');
      return;
    }
    
    if (!data.name || !data.name.trim()) {
      newErrors.name = 'Название категории обязательно для заполнения';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Передаем данные в onSubmit
    onSubmit(category.id, data);
    handleClose();
  };

  const handleClose = () => {
    // Сбрасываем форму и ошибки при закрытии
    setCategoryData({
      name: '',
      description: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Редактировать категорию</h3>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        
        <div className="edit-category-form">
          <CategoryForm
            onSubmit={(data) => handleSubmit(data)}
            onCancel={handleClose}
            initialData={category}
          />
        </div>
      </div>
    </div>
  );
}

export default EditCategoryModal;