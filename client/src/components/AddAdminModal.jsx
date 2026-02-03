import React, { useState } from 'react';

function AddAdminModal({ isOpen, onClose, onAddAdmin }) {
  const [adminData, setAdminData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdminData(prev => ({
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
    
    if (!adminData.username.trim()) {
      newErrors.username = 'Имя пользователя обязательно';
    } else if (adminData.username.length < 3) {
      newErrors.username = 'Имя пользователя должно содержать минимум 3 символа';
    }
    
    if (!adminData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(adminData.email)) {
      newErrors.email = 'Некорректный формат email';
    }
    
    if (!adminData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (adminData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    try {
      await onAddAdmin(adminData);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Сбрасываем форму и ошибки при закрытии
    setAdminData({
      username: '',
      email: '',
      password: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Добавить нового администратора</h3>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="add-admin-form">
          <div className="form-group">
            <label htmlFor="username">Имя пользователя:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={adminData.username}
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
              value={adminData.email}
              onChange={handleInputChange}
              required
              placeholder="Введите email адрес"
              autoComplete="off"
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Пароль:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={adminData.password}
              onChange={handleInputChange}
              required
              minLength="6"
              placeholder="Введите пароль (минимум 6 символов)"
              autoComplete="new-password"
            />
            <div className="password-legend">
              <small>Пароль должен содержать минимум 6 символов</small>
            </div>
            {errors.password && <span className="error">{errors.password}</span>}
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить'}
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

export default AddAdminModal;