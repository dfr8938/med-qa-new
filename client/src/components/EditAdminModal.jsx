import React, { useState, useEffect } from 'react';


function EditAdminModal({ isOpen, onClose, onEditAdmin, user }) {
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  // Инициализируем форму данными пользователя при открытии модального окна
  useEffect(() => {
    if (isOpen && user) {
      setEditForm({
        username: user.username,
        email: user.email,
        password: ''
      });
      setErrors({});
    }
  }, [isOpen, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!editForm.username.trim()) {
      newErrors.username = 'Имя пользователя обязательно';
    } else if (editForm.username.length < 3) {
      newErrors.username = 'Имя пользователя должно содержать минимум 3 символа';
    }
    
    if (!editForm.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(editForm.email)) {
      newErrors.email = 'Некорректный формат email';
    }
    
    if (editForm.password && editForm.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Передаем только измененные данные
    const updatedData = {
      username: editForm.username,
      email: editForm.email
    };
    
    // Добавляем пароль только если он был введен
    if (editForm.password) {
      updatedData.password = editForm.password;
    }
    
    onEditAdmin(user.id, updatedData);
  };

  const handleClose = () => {
    setEditForm({
      username: '',
      email: '',
      password: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Редактирование администратора</h3>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="edit-admin-form">
          <div className="form-group">
            <label htmlFor="username">Имя пользователя:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={editForm.username}
              onChange={handleInputChange}
              required
              placeholder="Введите имя пользователя (минимум 3 символа)"
              autoComplete="off"
            />
            {errors.username && <span className="error">{errors.username}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={editForm.email}
              onChange={handleInputChange}
              required
              placeholder="Введите email адрес"
              autoComplete="off"
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Новый пароль:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={editForm.password}
              onChange={handleInputChange}
              minLength="6"
              placeholder="Введите новый пароль (минимум 6 символов) или оставьте пустым"
              autoComplete="new-password"
            />
            <div className="password-legend">
              <small>Оставьте пустым, чтобы не менять пароль</small>
            </div>
            {errors.password && <span className="error">{errors.password}</span>}
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Сохранить</button>
            <button type="button" className="btn btn-secondary" onClick={() => setEditForm({...editForm, username: user.username, email: user.email, password: ''})}>
              Сбросить
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditAdminModal;