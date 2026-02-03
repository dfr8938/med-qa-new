import React, { useState, useEffect } from 'react'
import QuestionForm from '../components/QuestionForm'
import QuestionList from '../components/QuestionList'
import CategoryForm from '../components/CategoryForm'
import CategoryList from '../components/CategoryList'
import Notification from '../components/Notification'
import ConfirmDeleteCategoryModal from '../components/ConfirmDeleteCategoryModal'
import ConfirmDeleteQuestionModal from '../components/ConfirmDeleteQuestionModal'
import AddCategoryModal from '../components/AddCategoryModal'
import AddQuestionModal from '../components/AddQuestionModal'
import EditQuestionModal from '../components/EditQuestionModal'
import EditCategoryModal from '../components/EditCategoryModal'
import ProfileModal from '../components/ProfileModal'
import UserManagement from '../components/UserManagement'
import api, { updateProfile } from '../services/api'

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function AdminPanel() {
  const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingQuestion, setEditingQuestion] = useState(null)
    const [isEditQuestionModalOpen, setIsEditQuestionModalOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false)
    const [notification, setNotification] = useState(null)
    const [categoryStats, setCategoryStats] = useState([])
    const [totalQuestions, setTotalQuestions] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [currentCategoryPage, setCurrentCategoryPage] = useState(1)
    const [totalCategoryPages, setTotalCategoryPages] = useState(1)
    const [limit] = useState(8) // Количество вопросов на странице
    const [categoryLimit] = useState(8) // Количество категорий на странице
    const [availableCategories, setAvailableCategories] = useState([])
    const [displayedCategories, setDisplayedCategories] = useState([])
    const [deleteCategoryModal, setDeleteCategoryModal] = useState({
      isOpen: false,
      categoryId: null,
      categoryName: '',
      questionCount: 0
    })
    const [deleteQuestionModal, setDeleteQuestionModal] = useState({
      isOpen: false,
      questionId: null,
      questionText: ''
    })
    const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false)
    const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false)
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
    const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    fetchQuestions()
    fetchStats()
    fetchCategories()
  }, [])

  // Получаем текущего пользователя из localStorage при монтировании компонента
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    setCurrentUser(user)
  }, [])

  // Эффект для загрузки вопросов при изменении страницы
  useEffect(() => {
    fetchQuestions()
  }, [currentPage])

  const fetchStats = async () => {
      try {
        const response = await api.get('/questions')
        const allQuestions = response.data.questions || response.data
        const questionsArray = Array.isArray(allQuestions) ? allQuestions : []
        
        // Подсчет общего количества вопросов
        setTotalQuestions(questionsArray.length)
        
        // Подсчет статистики по датам создания
        const dateCount = {}
        questionsArray.forEach(question => {
          // Извлекаем дату без времени из createdAt
          const date = new Date(question.createdAt).toLocaleDateString('ru-RU')
          dateCount[date] = (dateCount[date] || 0) + 1
        })
        
        // Преобразование в формат для графика (все даты, отсортированные по возрастанию)
        const stats = Object.keys(dateCount)
          .sort((a, b) => new Date(a.split('.').reverse().join('-')) - new Date(b.split('.').reverse().join('-')))
          .map(date => ({
            date,
            count: dateCount[date]
          }))
        
        setCategoryStats(stats)
      } catch (error) {
        console.error('Ошибка при загрузке статистики:', error)
        showNotification('Ошибка при загрузке статистики: ' + error.message, 'error')
      }
    }

  const fetchCategories = async () => {
      try {
        const response = await api.get('/categories')
        const categories = response.data || []
        setAvailableCategories(categories)
        
        // Обновляем пагинацию категорий
        setTotalCategoryPages(Math.ceil(categories.length / categoryLimit))
        const startIndex = (currentCategoryPage - 1) * categoryLimit
        const endIndex = startIndex + categoryLimit
        setDisplayedCategories(categories.slice(startIndex, endIndex))
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error)
      }
    }
    
    // Эффект для обновления отображаемых категорий при изменении страницы или категорий
    useEffect(() => {
      const startIndex = (currentCategoryPage - 1) * categoryLimit
      const endIndex = startIndex + categoryLimit
      setDisplayedCategories(availableCategories.slice(startIndex, endIndex))
    }, [currentCategoryPage, availableCategories, categoryLimit])
    
    const handleCreateCategory = async (categoryData) => {
          try {
            const response = await api.post('/categories', categoryData)
            setAvailableCategories([...availableCategories, response.data])
            // Сбрасываем форму редактирования категории
            setEditingCategory(null)
            showNotification('Категория успешно создана!', 'success')
          } catch (error) {
            console.error('Ошибка при создании категории:', error)
            showNotification('Ошибка при создании категории: ' + error.message, 'error')
          }
        }
    
    const handleAddCategory = async (categoryData) => {
      try {
        const response = await api.post('/categories', categoryData)
        setAvailableCategories([...availableCategories, response.data])
        setIsAddCategoryModalOpen(false)
        showNotification('Категория успешно создана!', 'success')
        // Обновляем пагинацию после добавления категории
        setTotalCategoryPages(Math.ceil((availableCategories.length + 1) / categoryLimit))
      } catch (error) {
        console.error('Ошибка при создании категории:', error)
        showNotification('Ошибка при создании категории: ' + error.message, 'error')
      }
    }
    
    const handleEditCategory = (category) => {
      setEditingCategory(category)
      setIsEditCategoryModalOpen(true)
    }
    
    const handleUpdateCategory = async (id, categoryData) => {
      try {
        const response = await api.put(`/categories/${id}`, categoryData)
        setAvailableCategories(availableCategories.map(cat =>
          cat.id === id ? response.data : cat
        ))
        setEditingCategory(null)
        showNotification('Категория успешно обновлена!', 'success')
      } catch (error) {
        console.error('Ошибка при обновлении категории:', error)
        showNotification('Ошибка при обновлении категории: ' + error.message, 'error')
      }
    }
    
    const handleDeleteCategoryClick = async (category) => {
      try {
        // Получаем количество вопросов в категории
        const response = await api.get(`/categories/${category.id}/questions`)
        const questionCount = response.data ? response.data.length : 0
        
        // Открываем модальное окно подтверждения
        setDeleteCategoryModal({
          isOpen: true,
          categoryId: category.id,
          categoryName: category.name,
          questionCount: questionCount
        })
      } catch (error) {
        console.error('Ошибка при получении информации о категории:', error)
        // Даже при ошибке продолжаем показ модального окна с 0 вопросов
        setDeleteCategoryModal({
          isOpen: true,
          categoryId: category.id,
          categoryName: category.name,
          questionCount: 0
        })
      }
    }
    
    const handleDeleteCategoryConfirm = async () => {
      const { categoryId } = deleteCategoryModal
      
      try {
        // Удаляем категорию (все вопросы в категории будут удалены автоматически на сервере)
        await api.delete(`/categories/${categoryId}`)
        
        // Обновляем список категорий
        setAvailableCategories(availableCategories.filter(cat => cat.id !== categoryId))
        
        // Обновляем список вопросов, чтобы удалить вопросы без категории
        await fetchQuestions()
        refreshHomeQuestions() // Обновляем вопросы на главной странице
        
        // Закрываем модальное окно
        setDeleteCategoryModal({
          isOpen: false,
          categoryId: null,
          categoryName: '',
          questionCount: 0
        })
        
        showNotification('Категория и все вопросы в ней успешно удалены!', 'success')
        
        // Обновляем пагинацию после удаления категории
        const newCategoryCount = availableCategories.length - 1
        setTotalCategoryPages(Math.ceil(newCategoryCount / categoryLimit))
        if (currentCategoryPage > Math.ceil(newCategoryCount / categoryLimit)) {
          setCurrentCategoryPage(Math.max(1, Math.ceil(newCategoryCount / categoryLimit)))
        }
      } catch (error) {
        console.error('Ошибка при удалении категории:', error)
        showNotification('Ошибка при удалении категории: ' + error.message, 'error')
      }
    }
  
    // Функция для обновления списка вопросов на главной странице
    const refreshHomeQuestions = () => {
      // Отправляем пользовательское событие, которое может прослушивать Home компонент
      window.dispatchEvent(new CustomEvent('refreshHomeQuestions'));
    }
    
    const handleDeleteCategoryCancel = () => {
      setDeleteCategoryModal({
        isOpen: false,
        categoryId: null,
        categoryName: '',
        questionCount: 0
      })
    }

  const fetchQuestions = async () => {
    try {
      const response = await api.get('/questions', {
        params: {
          page: currentPage,
          limit: limit
        }
      })
      const allQuestions = response.data.questions || response.data
      setQuestions(Array.isArray(allQuestions) ? allQuestions : [])
      setTotalPages(response.data.totalPages || 1)
      // Обновляем общее количество вопросов
      setTotalQuestions(response.data.totalQuestions || 0)
      // Устанавливаем минимальное время отображения загрузчика в 1.5 секунды
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Ошибка при загрузке вопросов:', error)
      showNotification('Ошибка при загрузке вопросов: ' + error.message, 'error')
      setQuestions([]) // Устанавливаем пустой массив в случае ошибки
      setLoading(false)
    }
  }

  const handleCreate = async (questionData) => {
    try {
      const response = await api.post('/questions', questionData)
      setQuestions([...questions, response.data])
      // Очищаем форму после создания вопроса
      setEditingQuestion(null)
      // Обновляем статистику после создания вопроса
      await fetchStats()
      showNotification('Вопрос успешно создан!', 'success')
    } catch (error) {
      // Проверяем, является ли ошибка связанной с дублированием вопроса
      if (error.response?.data?.message === 'Вопрос с таким текстом уже существует') {
        // Отображаем пользовательское уведомление без вывода в консоль
        showNotification('Вопрос с таким текстом уже существует в этой категории', 'error')
      } else {
        // Для всех остальных ошибок отображаем общее сообщение
        showNotification('Ошибка при создании вопроса: ' + error.message, 'error')
      }
    }
  }

  const handleUpdate = async (id, questionData) => {
    try {
      const response = await api.put(`/questions/${id}`, questionData)
      setQuestions(questions.map(q => q.id === id ? response.data : q))
      setEditingQuestion(null)
      // Обновляем статистику после обновления вопроса
      await fetchStats()
      showNotification('Вопрос успешно обновлен!', 'success')
    } catch (error) {
      // Проверяем, является ли ошибка связанной с дублированием вопроса
      if (error.response?.data?.message === 'Вопрос с таким текстом уже существует') {
        // Отображаем пользовательское уведомление без вывода в консоль
        showNotification('Вопрос с таким текстом уже существует в этой категории', 'error')
      } else {
        // Для всех остальных ошибок отображаем общее сообщение
        showNotification('Ошибка при обновлении вопроса: ' + error.message, 'error')
      }
    }
  }

  const handleDelete = async (id, questionText) => {
    // Открываем модальное окно подтверждения удаления
    setDeleteQuestionModal({
      isOpen: true,
      questionId: id,
      questionText: questionText
    });
  }
  
  const handleDeleteQuestionConfirm = async () => {
    const { questionId } = deleteQuestionModal;
    
    try {
      await api.delete(`/questions/${questionId}`)
      setQuestions(questions.filter(q => q.id !== questionId))
      // Обновляем статистику после удаления вопроса
      await fetchStats()
      showNotification('Вопрос успешно удален!', 'success')
    } catch (error) {
      console.error('Ошибка при удалении вопроса:', error)
      showNotification('Ошибка при удалении вопроса: ' + error.message, 'error')
    } finally {
      // Закрываем модальное окно
      setDeleteQuestionModal({
        isOpen: false,
        questionId: null,
        questionText: ''
      });
    }
  }
  
  const handleDeleteQuestionCancel = () => {
    setDeleteQuestionModal({
      isOpen: false,
      questionId: null,
      questionText: ''
    });
  }

  const handleEdit = (question) => {
    setEditingQuestion(question)
    setIsEditQuestionModalOpen(true)
  }

  const showNotification = (message, type) => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  const handleUpdateProfile = async (profileData) => {
    try {
      // Вызываем API для обновления профиля
      const response = await updateProfile(profileData);
      const updatedUser = response.data;
      
      // Обновляем данные в localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      // Закрываем модальное окно
      setIsProfileModalOpen(false);
      
      showNotification('Профиль успешно обновлен!', 'success');
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      showNotification('Ошибка при обновлении профиля: ' + (error.response?.data?.message || error.message), 'error');
    }
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
    <div className="panel">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}
      <h2>Админ-панель</h2>
      
      {/* Информация о пользователе */}
      <div className="user-info-section">
        <UserManagement user={currentUser} />
      </div>
      
      {/* Кнопки управления под заголовком в правой части */}
      <div className="admin-actions">
        <button
          className="btn btn-primary"
          onClick={() => setIsAddQuestionModalOpen(true)}
        >
          Добавить новый вопрос
        </button>
        <button
          className="btn btn-primary"
          onClick={() => setIsAddCategoryModalOpen(true)}
        >
          Добавить новую категорию
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => setIsProfileModalOpen(true)}
        >
          Редактировать профиль
        </button>
      </div>
      
      {/* Управление категориями */}
            <div className="category-management">
                    {/* Удалена кнопка "Добавить новую категорию" из блока категорий */}
                    {!(editingCategory !== null && editingCategory.show) && null}
                    {/* Убрана inline форма редактирования категории, теперь используется модальное окно */}
                    {(editingCategory !== null && editingCategory.show) && null}
                    {editingCategory !== null && editingCategory.id && null}
                    <div className="category-list-section">
                      <h4>Список категорий</h4>
                      <CategoryList
                        categories={displayedCategories}
                        onEdit={handleEditCategory}
                        onDelete={handleDeleteCategoryClick}
                      />
                      {/* Пагинация категорий */}
                      <div className="category-pagination">
                        <button
                          onClick={() => setCurrentCategoryPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentCategoryPage === 1}
                          className="pagination-button"
                          title="Предыдущая страница"
                        >
                          <i className="fas fa-chevron-left"></i>
                        </button>
                        
                        {totalCategoryPages > 1 && (
                          <div className="page-input-container">
                            <label>Страница:</label>
                            <input
                              type="number"
                              min="1"
                              max={totalCategoryPages}
                              value={currentCategoryPage}
                              onChange={(e) => {
                                const page = parseInt(e.target.value);
                                if (page >= 1 && page <= totalCategoryPages) {
                                  setCurrentCategoryPage(page);
                                }
                              }}
                              className="page-input"
                            />
                            <span>из {totalCategoryPages}</span>
                          </div>
                        )}
                        
                        <button
                          onClick={() => setCurrentCategoryPage(prev => Math.min(prev + 1, totalCategoryPages))}
                          disabled={currentCategoryPage === totalCategoryPages}
                          className="pagination-button"
                          title="Следующая страница"
                        >
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </div>
                    </div>
            </div>
      
      <div className="admin-content">
        {/* Убрана inline форма редактирования, теперь используется модальное окно */}
        {editingQuestion && null}
        <div className="list-section">
          <h3>Список вопросов</h3>
          <QuestionList
            questions={questions}
            onEdit={handleEdit}
            onDelete={(id, questionText) => handleDelete(id, questionText)}
          />
          {/* Пагинация */}
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="pagination-button"
              title="Предыдущая страница"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            
            {totalPages > 1 && (
              <div className="page-input-container">
                <label>Страница:</label>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      setCurrentPage(page);
                    }
                  }}
                  className="page-input"
                />
                <span>из {totalPages}</span>
              </div>
            )}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="pagination-button"
              title="Следующая страница"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
      
      {/* Модальное окно подтверждения удаления категории */}
      <ConfirmDeleteCategoryModal
        isOpen={deleteCategoryModal.isOpen}
        onClose={handleDeleteCategoryCancel}
        onConfirm={handleDeleteCategoryConfirm}
        categoryName={deleteCategoryModal.categoryName}
        questionCount={deleteCategoryModal.questionCount}
      />
      
      {/* Модальное окно добавления категории */}
      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onSubmit={handleAddCategory}
      />
      
      {/* Модальное окно добавления вопроса */}
      <AddQuestionModal
        isOpen={isAddQuestionModalOpen}
        onClose={() => setIsAddQuestionModalOpen(false)}
        onSubmit={handleCreate}
        availableCategories={availableCategories}
      />
      
      {/* Модальное окно редактирования вопроса */}
      <EditQuestionModal
        isOpen={isEditQuestionModalOpen}
        onClose={() => setIsEditQuestionModalOpen(false)}
        onSubmit={(id, data) => handleUpdate(id, data)}
        question={editingQuestion}
        availableCategories={availableCategories}
      />
      
      {/* Модальное окно подтверждения удаления вопроса */}
      <ConfirmDeleteQuestionModal
        isOpen={deleteQuestionModal.isOpen}
        onClose={handleDeleteQuestionCancel}
        onConfirm={handleDeleteQuestionConfirm}
        questionText={deleteQuestionModal.questionText}
      />
      
      {/* Модальное окно редактирования категории */}
      <EditCategoryModal
        isOpen={isEditCategoryModalOpen}
        onClose={() => setIsEditCategoryModalOpen(false)}
        onSubmit={(id, data) => handleUpdateCategory(id, data)}
        category={editingCategory}
      />
      
      {/* Модальное окно профиля */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={currentUser}
        onUpdateProfile={handleUpdateProfile}
      />
    </div>
  )
}

export default AdminPanel