import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Notification from '../components/Notification'
import api from '../services/api'


function Login() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [notification, setNotification] = useState(null)
  const navigate = useNavigate()


  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Валидация формы
    if (!credentials.email || !credentials.password) {
      setError('Все поля обязательны для заполнения');
      showNotification('Все поля обязательны для заполнения', 'error');
      return;
    }
    
    // Проверка формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      setError('Некорректный формат email');
      showNotification('Некорректный формат email', 'error');
      return;
    }
    
    // Проверка длины пароля
    if (credentials.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      showNotification('Пароль должен содержать минимум 6 символов', 'error');
      return;
    }
    
    setLoading(true)
    setError('')
    
    // Устанавливаем минимальное время отображения загрузчика в 1.5 секунды
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    try {
      const response = await api.post('/auth/login', credentials)
      const { token, user } = response.data

      // Сохранение токена и информации о пользователе в localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      // Установка токена в заголовки для будущих запросов
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      // Перенаправление в зависимости от роли пользователя
      if (user.role === 'superadmin') {
        navigate('/superadmin')
      } else if (user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/')
      }
      
      showNotification('Успешный вход в систему!', 'success')
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Ошибка входа'
      setError(errorMessage)
      showNotification(errorMessage, 'error')
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }

  const showNotification = (message, type) => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  const closeNotification = () => {
    setNotification(null)
  }

  return (
    <div className="login-page">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}
      <div className="login-container">
        <h2>Вход в систему</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">
              <i className="fas fa-envelope"></i> Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
              autoComplete="off"
              className="input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">
              <i className="fas fa-lock"></i> Пароль:
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="input"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-login" disabled={loading}>
            {loading ? 'Вход...' : <><i className="fas fa-sign-in-alt"></i> Войти</>}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login