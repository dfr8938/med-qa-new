import React, { useState, useEffect } from 'react';
import UserManagement from './UserManagement';

function ProfileModal({ isOpen, onClose, user, onUpdateProfile }) {
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Инициализируем форму данными пользователя при открытии модального окна
  useEffect(() => {
    if (isOpen && user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        password: ''
      });
      setErrors({});
    }
  }, [isOpen, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
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
    
    if (!profileData.username.trim()) {
      newErrors.username = 'Имя пользователя обязательно';
    } else if (profileData.username.length < 3) {
      newErrors.username = 'Имя пользователя должно содержать минимум 3 символа';
    }
    
    if (!profileData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Некорректный формат email';
    }
    
    // Проверка пароля, если он был введен
    if (profileData.password && profileData.password.length < 6) {
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
    
    onUpdateProfile(profileData);
  };

  const handleClose = () => {
    setProfileData({
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
          <h3>Профиль администратора</h3>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        
        <div className="modal-body">
          {/* Отображение информации о пользователе */}
          {/* <UserManagement user={user} /> */}
          
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="username">Имя пользователя:</label>
              <input
                type="text"
                id="username"
                name="username"
                value={profileData.username}
                onChange={handleInputChange}
                required
                placeholder="Введите имя пользователя (минимум 3 символа)"
                autoComplete="off"
                className="input"
              />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                required
                placeholder="Введите email адрес"
                autoComplete="off"
                className="input"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Новый пароль:</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={profileData.password}
                  onChange={handleInputChange}
                  placeholder="Введите новый пароль (минимум 6 символов) или оставьте пустым"
                  autoComplete="new-password"
                  className={`input ${errors.password ? "error" : ""}`}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Скрыть пароль" : "Показать пароль"}
                >
                  <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                </button>
              </div>
              <div className="password-legend">
                <small>Оставьте пустым, чтобы не менять пароль</small>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Сохранить</button>
              <button type="button" className="btn btn-secondary" onClick={() => setProfileData({ username: user.username || '', email: user.email || '', password: '' })}>
                Сбросить
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;