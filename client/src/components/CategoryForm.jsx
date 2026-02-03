import React, { useState } from 'react'

/**
 * Компонент формы для создания и редактирования категорий
 * @param {Function} onSubmit - Функция для отправки данных формы
 * @param {Function} onCancel - Функция для отмены редактирования
 * @param {Object} initialData - Начальные данные для редактирования категории
 * @param {string} initialData.name - Название категории
 * @param {string} initialData.description - Описание категории
 */
function CategoryForm({ onSubmit, onCancel, initialData }) {
  // Состояние для хранения данных формы
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || ''
  })
  
  // Состояние для хранения ошибок валидации
  const [errors, setErrors] = useState({})

  /**
   * Обработчик изменения полей формы
   * @param {Event} e - Событие изменения поля
   */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  /**
   * Валидация формы перед отправкой
   * @returns {Object} Объект с ошибками валидации
   */
  const validate = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Название категории обязательно для заполнения'
    }
    
    return newErrors
  }

  /**
   * Обработчик отправки формы
   * @param {Event} e - Событие отправки формы
   */
  const handleSubmit = (e) => {
      e.preventDefault()
      const newErrors = validate()
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }
      
      onSubmit(formData)
      
      // Очищаем форму после добавления новой категории (если это не редактирование)
      if (!initialData) {
        setFormData({
          name: '',
          description: ''
        })
      }
    }

  return (
    <div className="category-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Название категории:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
            placeholder="Введите название категории"
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Описание:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Введите описание категории (необязательно)"
            rows="3"
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {initialData ? 'Сохранить' : 'Добавить'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  )
}

export default CategoryForm