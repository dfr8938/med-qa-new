import React, { useState, useEffect } from 'react'
import UserManagement from '../components/UserManagement'
import ActionLog from '../components/ActionLog'
import Notification from '../components/Notification'
import AddAdminModal from '../components/AddAdminModal'
import EditAdminModal from '../components/EditAdminModal'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import api from '../services/api'


function SuperAdminPanel() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false)
  const [isEditAdminModalOpen, setIsEditAdminModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users')
      setUsers(response.data)
      // Устанавливаем минимальное время отображения загрузчика в 1.5 секунды
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Ошибка при загрузке пользователей:', error)
      showNotification('Ошибка при загрузке пользователей: ' + error.message, 'error')
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await api.put(`/users/${userId}/role`, { role: newRole })
      setUsers(users.map(user => 
        user.id === userId ? response.data : user
      ))
      showNotification('Роль пользователя успешно изменена!', 'success')
    } catch (error) {
      console.error('Ошибка при изменении роли пользователя:', error)
      showNotification('Ошибка при изменении роли пользователя: ' + error.message, 'error')
    }
  }

  const handleEditClick = (user) => {
    setEditingUser(user)
    setIsEditAdminModalOpen(true)
  }

  const handleDeleteClick = (user) => {
    console.log('Получен объект пользователя для удаления:', user);
    console.log('Тип объекта:', typeof user);
    if (typeof user === 'number') {
      console.error('В onDelete передан ID вместо объекта пользователя:', user);
      // Найдем пользователя по ID в списке пользователей
      const userObj = users.find(u => u.id === user);
      if (userObj) {
        console.log('Найден пользователь по ID:', userObj);
        setUserToDelete(userObj);
      } else {
        console.error('Пользователь с ID', user, 'не найден в списке');
        showNotification('Ошибка: не удалось найти пользователя для удаления', 'error');
        return;
      }
    } else {
      if (!user || !user.id) {
        console.error('Пользователь не содержит ID:', user);
        showNotification('Ошибка: не удалось определить пользователя для удаления', 'error');
        return;
      }
      setUserToDelete(user);
    }
    setIsDeleteModalOpen(true);
  }

  const handleConfirmDelete = async () => {
    console.log('Подтверждение удаления пользователя:', userToDelete);
    if (userToDelete && userToDelete.id) {
      await handleUserDelete(userToDelete.id);
    } else {
      console.error('Попытка удаления пользователя без ID:', userToDelete);
      showNotification('Ошибка: не удалось определить пользователя для удаления', 'error');
      // Закрываем модальное окно в случае ошибки
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  }

  const handleUserDelete = async (userId) => {
    try {
      await api.delete(`/users/${userId}`)
      setUsers(users.filter(user => user.id !== userId))
      showNotification('Пользователь успешно удален!', 'success')
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error)
      showNotification('Ошибка при удалении пользователя: ' + error.message, 'error')
    } finally {
      // Закрываем модальное окно в любом случае
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  }

  const handleAddAdmin = async (adminData) => {
    try {
      // Проверка авторизации
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Необходимо авторизоваться для выполнения этого действия', 'error');
        return;
      }
      
      const response = await api.post('/users/admin', adminData)
      setUsers([response.data, ...users])
      setIsAddAdminModalOpen(false)
      showNotification('Админ успешно создан!', 'success')
    } catch (error) {
      console.error('Ошибка при создании админа:', error)
      showNotification('Ошибка при создании админа: ' + error.message, 'error')
    }
  }

  const handleEditAdmin = async (userId, userData) => {
    try {
      // Проверка авторизации
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Необходимо авторизоваться для выполнения этого действия', 'error');
        return;
      }
      
      const response = await api.put(`/users/${userId}`, userData)
      const updatedUser = response.data
      
      // Обновляем пользователя в списке
      const updatedUsers = users.map(user =>
        user.id === userId ? updatedUser : user
      )
      
      setUsers(updatedUsers)
      setIsEditAdminModalOpen(false)
      setEditingUser(null)
      showNotification('Админ успешно обновлен!', 'success')
    } catch (error) {
      console.error('Ошибка при обновлении админа:', error)
      showNotification('Ошибка при обновлении админа: ' + error.message, 'error')
    }
  }

  const handleUpdateUsers = (updatedUsers) => {
    setUsers(updatedUsers)
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className="panel">
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={closeNotification}
          />
        )}
        <h2>Суперадмин-панель</h2>
        <div className="super-admin-content">
          <div className="admin-actions">
            <button
              className="btn btn-primary"
              onClick={() => setIsAddAdminModalOpen(true)}
            >
              Добавить нового админа
            </button>
          </div>
          
          <div className="tabs">
            <div className="tab-content">
              <UserManagement
                users={users}
                onRoleChange={handleRoleChange}
                onDelete={handleDeleteClick}
                onUpdateUsers={handleUpdateUsers}
                onEdit={handleEditClick}
              />
            </div>
            
            <div className="tab-content">
              <ActionLog />
            </div>
          </div>
          
        </div>
      </div>
      
      <AddAdminModal
        isOpen={isAddAdminModalOpen}
        onClose={() => setIsAddAdminModalOpen(false)}
        onAddAdmin={handleAddAdmin}
      />
      
      <EditAdminModal
        isOpen={isEditAdminModalOpen}
        onClose={() => {
          setIsEditAdminModalOpen(false);
          setEditingUser(null);
        }}
        onEditAdmin={handleEditAdmin}
        user={editingUser}
      />
      
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        username={userToDelete?.username}
      />
    </React.Fragment>
  )
}

export default SuperAdminPanel