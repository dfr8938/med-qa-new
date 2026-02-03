import React, { useState, useEffect } from 'react';

function UserManagement({ user, users, onRoleChange, onDelete, onUpdateUsers, onEdit }) {
  // Форматируем дату регистрации
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  // Определяем статус аккаунта
  const getAccountStatus = (role) => {
    switch (role) {
      case 'superadmin':
        return 'Суперадминистратор';
      case 'admin':
        return 'Администратор';
      default:
        return 'Пользователь';
    }
  };

  // Если передан список пользователей, отображаем таблицу пользователей
  if (users && Array.isArray(users)) {
    return (
      <div className="user-management">
        <h3>Управление пользователями</h3>
        <div className="users-list">
          {users.map(user => (
            <div key={user.id} className="user-item">
              <div className="user-content">
                <h4>{user.username}</h4>
                <div className="user-email">{user.email}</div>
              </div>
              <div className="user-footer">
                <div className="user-meta">
                  <div className="user-role">
                    <span className="role-tag">{getAccountStatus(user.role)}</span>
                  </div>
                </div>
                <div className="user-actions">
                  <button
                    className="btn-edit"
                    onClick={() => onEdit(user)}
                    title="Редактировать"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => onDelete(user)}
                    title="Удалить"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Если передан один пользователь, отображаем информацию о нем
  if (user) {
    return (
      <div className="user-management">
        <h3>Информация о пользователе</h3>
        <div className="user-info-card">
          <div className="user-info-item">
            <label>Имя пользователя:</label>
            <span>{user.username || 'Не указано'}</span>
          </div>
          <div className="user-info-item">
            <label>Email:</label>
            <span>{user.email || 'Не указано'}</span>
          </div>
          <div className="user-info-item">
            <label>Дата регистрации:</label>
            <span>{user.createdAt ? formatDate(user.createdAt) : 'Не указана'}</span>
          </div>
          <div className="user-info-item">
            <label>Статус аккаунта:</label>
            <span>{user.role ? getAccountStatus(user.role) : 'Не определен'}</span>
          </div>
        </div>
      </div>
    );
  }

  // Если нет данных для отображения
  return (
    <div className="user-management">
      <h3>Управление пользователями</h3>
      <p>Нет данных для отображения</p>
    </div>
  );
}

export default UserManagement;