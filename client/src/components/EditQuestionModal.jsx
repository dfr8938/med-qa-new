import React, { useState, useEffect } from 'react';
import QuestionForm from './QuestionForm';


function EditQuestionModal({ isOpen, onClose, onSubmit, question, availableCategories }) {
  const [errors, setErrors] = useState({});

  // Инициализация формы данными редактируемого вопроса
  useEffect(() => {
    if (isOpen && question) {
      setErrors({});
    }
  }, [isOpen, question]);

  const handleSubmit = async (id, data) => {
    // Проверяем, есть ли ошибки в данных формы
    const newErrors = {};
    
    // Проверяем, что data существует и содержит необходимые поля
    if (!data) {
      console.error('Данные формы отсутствуют');
      return;
    }
    
    if (!data.question || !data.question.trim()) {
      newErrors.question = 'Вопрос обязателен для заполнения';
    }
    
    if (!data.answer || !data.answer.trim()) {
      newErrors.answer = 'Ответ обязателен для заполнения';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      // Передаем ID вопроса и данные в onSubmit
      if (question && question.id) {
        await onSubmit(question.id, data);
      } else {
        await onSubmit(data);
      }
      handleClose();
    } catch (error) {
      // Обработка ошибки дубликата без вывода в консоль
      if (error.response?.data?.message === 'Вопрос с таким текстом уже существует') {
        // Ошибка обрабатывается в компоненте QuestionForm, здесь просто игнорируем
        // чтобы не выводить в консоль
        return;
      }
      // Для всех остальных ошибок выводим в консоль
      console.error('Ошибка при обновлении вопроса:', error);
    }
  };

  const handleClose = () => {
    // Сбрасываем форму и ошибки при закрытии
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Редактировать вопрос</h3>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        
        <div className="edit-question-form">
          <QuestionForm
            onSubmit={(id, data) => handleSubmit(id, data)}
            onCancel={handleClose}
            initialData={question}
            availableCategories={availableCategories}
          />
        </div>
      </div>
    </div>
  );
}

export default EditQuestionModal;