import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AdminPanel from './pages/AdminPanel'
import SuperAdminPanel from './pages/SuperAdminPanel'
import Login from './pages/Login'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'
import Notification from './components/Notification'


function App() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Отслеживаем прокрутку страницы
  useEffect(() => {
    const handleScroll = () => {
      // Показываем кнопку, когда прокрутка больше 300px
      setShowScrollTop(window.scrollY > 300);
    };

    // Добавляем слушатель события прокрутки
    window.addEventListener('scroll', handleScroll);
    
    // Убираем слушатель при размонтировании компонента
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Функция для прокрутки наверх
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Функция для добавления уведомления
  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  // Функция для удаления уведомления
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="app">
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Загрузка...</p>
          </div>
        )}
        
        {/* Уведомления */}
        <div className="notifications-container">
          {notifications.map(notification => (
            <Notification
              key={notification.id}
              message={notification.message}
              type={notification.type}
              onClose={() => removeNotification(notification.id)}
            />
          ))}
        </div>
        
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin"
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <SuperAdminPanel />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        
        {/* Кнопка "Наверх" */}
        {showScrollTop && (
          <button
            className="scroll-to-top"
            onClick={scrollToTop}
            title="Наверх"
          >
            <i className="fas fa-arrow-up"></i>
          </button>
        )}
      </div>
    </Router>
  )
}

export default App