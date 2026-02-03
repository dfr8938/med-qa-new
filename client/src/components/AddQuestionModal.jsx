import React, { useState, useEffect } from 'react';
import QuestionForm from './QuestionForm';


function AddQuestionModal({ isOpen, onClose, onSubmit, availableCategories }) {
  const [questionData, setQuestionData] = useState({
    question: '',
    answer: '',
    category: ''
  });
  const [errors, setErrors] = useState({});

  // Сброс формы при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      setQuestionData({
        question: '',
        answer: '',
        category: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = async (data) => {
    // Проверяем, есть ли ошибки в данных формы
    const newErrors = {};
    
    if (!data.question.trim()) {
      newErrors.question = 'Вопрос обязателен для заполнения';
    }
    
    if (!data.answer.trim()) {
      newErrors.answer = 'Ответ обязателен для заполнения';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      await onSubmit(data);
      handleClose();
    } catch (error) {
      // Обработка ошибки дубликата без вывода в консоль
      if (error.response?.data?.message === 'Вопрос с таким текстом уже существует') {
        // Ошибка обрабатывается в компоненте QuestionForm, здесь просто игнорируем
        // чтобы не выводить в консоль
        return;
      }
      // Для всех остальных ошибок выводим в консоль
      console.error('Ошибка при создании вопроса:', error);
    }
  };

  const handleClose = () => {
    // Сбрасываем форму и ошибки при закрытии
    setQuestionData({
      question: '',
      answer: '',
      category: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Добавить новый вопрос</h3>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        
        <div className="add-question-form">
          <QuestionForm
            onSubmit={handleSubmit}
            onCancel={handleClose}
            initialData={null}
            availableCategories={availableCategories}
          />
        </div>
      </div>
    </div>
  );
}

export default AddQuestionModal;