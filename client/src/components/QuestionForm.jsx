import React, { useState, useEffect } from 'react'

/**
 * Компонент формы для создания и редактирования вопросов
 * @param {Function} onSubmit - Функция для отправки данных формы
 * @param {Object} initialData - Начальные данные для редактирования вопроса
 * @param {Function} onCancel - Функция для отмены редактирования
 * @param {Array<{id: number, name: string, description: string}>} availableCategories - Список доступных категорий
 */
function QuestionForm({ onSubmit, initialData, onCancel, availableCategories = [] }) {
  // Состояние для хранения данных формы
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: ''
  })
  
  // Состояние для хранения ошибок валидации
  const [errors, setErrors] = useState({})

  // Эффект для инициализации формы при изменении initialData
  useEffect(() => {
    if (initialData) {
      // Преобразуем categoryId в category name для отображения в форме
      const categoryName = initialData.categoryRef?.name || initialData.category || '';
      setFormData({
        question: initialData.question,
        answer: initialData.answer,
        category: categoryName
      })
    } else {
      // Очищаем форму при отсутствии initialData (например, после создания)
      setFormData({
        question: '',
        answer: '',
        category: ''
      })
    }
  }, [initialData])

  /**
   * Обработчик изменения полей формы
   * @param {Event} e - Событие изменения поля
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    
    // Очищаем ошибку при изменении поля
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      })
    }
  }

  /**
   * Валидация формы перед отправкой
   * @returns {Object} Объект с ошибками валидации
   */
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.question.trim()) {
      newErrors.question = 'Вопрос обязателен для заполнения'
    }
    
    if (!formData.answer.trim()) {
      newErrors.answer = 'Ответ обязателен для заполнения'
    }
    
    return newErrors
  }
  
  /**
   * Обработчик отправки формы
   * @param {Event} e - Событие отправки формы
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Проверка авторизации
    const token = localStorage.getItem('token');
    if (!token) {
      setErrors({ form: 'Необходимо авторизоваться для выполнения этого действия' });
      return;
    }
    
    // Валидация формы
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    // Преобразуем category name в categoryId для отправки на сервер
    const selectedCategory = availableCategories.find(cat => cat.name === formData.category);
    const submitData = {
      question: formData.question,
      answer: formData.answer,
      categoryId: selectedCategory ? selectedCategory.id : null
    };
    
    try {
      if (initialData) {
        await onSubmit(initialData.id, submitData)
      } else {
        await onSubmit(submitData)
        // Очищаем форму после отправки
        setFormData({
          question: '',
          answer: '',
          category: ''
        })
        // Очищаем ошибки
        setErrors({})
      }
    } catch (error) {
      // Проверяем, является ли ошибка связанной с дублированием вопроса
      if (error.response?.data?.message === 'Вопрос с таким текстом уже существует') {
        // Отображаем пользовательское уведомление
        setErrors({ form: 'Вопрос с таким текстом уже существует в этой категории' })
      } else {
        // Для всех остальных ошибок отображаем общее сообщение
        setErrors({ form: 'Произошла ошибка при сохранении вопроса' })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="question-form">
      <div className="form-group">
        <label htmlFor="question">Вопрос:</label>
        <input
          type="text"
          id="question"
          name="question"
          value={formData.question}
          onChange={handleChange}
          required
          placeholder="Введите вопрос"
          autoComplete="off"
        />
        {errors.question && <span className="error">{errors.question}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="answer">Ответ:</label>
        <textarea
          id="answer"
          name="answer"
          value={formData.answer}
          onChange={handleChange}
          required
          placeholder="Введите ответ"
          autoComplete="off"
        />
        {errors.answer && <span className="error">{errors.answer}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="category">Категория:</label>
        <select
          id="category"
          name="category"
          value={formData.category || ''}
          onChange={handleChange}
          autoComplete="off"
        >
          <option value="">Выберите категорию</option>
          {availableCategories.map(category => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      
      {errors.form && <div className="error form-error">{errors.form}</div>}
      
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {initialData ? 'Обновить' : 'Создать'}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setFormData({
              question: '',
              answer: '',
              category: ''
            });
            setErrors({});
          }}
        >
          Очистить
        </button>
        {initialData && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Отмена
          </button>
        )}
      </div>
    </form>
  )
}

export default QuestionForm