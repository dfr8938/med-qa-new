import React from 'react'
import { Navigate } from 'react-router-dom'

// Компонент для защиты маршрутов на основе роли пользователя
function ProtectedRoute({ children, allowedRoles }) {
  // Получение информации о пользователе из localStorage
  const user = JSON.parse(localStorage.getItem('user'))

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Проверка, имеет ли пользователь доступ к данному маршруту
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Перенаправляем на главную страницу или страницу соответствующую роли пользователя
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />
    } else if (user.role === 'superadmin') {
      return <Navigate to="/superadmin" replace />
    } else {
      return <Navigate to="/" replace />
    }
  }

  return children
}

export default ProtectedRoute