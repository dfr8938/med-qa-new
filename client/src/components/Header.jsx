import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'


function Header() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))

  const handleLogout = () => {
    // Удаление токена и информации о пользователе из localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // Удаление токена из заголовков API
    delete api.defaults.headers.common['Authorization']
    
    // Перенаправление на главную страницу
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <i className="fas fa-heartbeat"></i>
          MedQA
        </div>
        <nav className="nav-links">
          <Link to="/" className="nav-link">
            <i className="fas fa-home"></i> Главная
          </Link>
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link">
                  <i className="fas fa-user-shield"></i> Админ-панель
                </Link>
              )}
              {user.role === 'superadmin' && (
                <>
                  <Link to="/admin" className="nav-link">
                    <i className="fas fa-user-shield"></i> Админ-панель
                  </Link>
                  <Link to="/superadmin" className="nav-link">
                    <i className="fas fa-user-cog"></i> Суперадмин-панель
                  </Link>
                </>
              )}
              <button onClick={handleLogout} className="nav-link logout-btn">
                <i className="fas fa-sign-out-alt"></i> Выйти
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-link">
              <i className="fas fa-sign-in-alt"></i> Вход
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header