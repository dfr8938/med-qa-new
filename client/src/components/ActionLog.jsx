import React, { useState, useEffect } from 'react'
import { getActionLogs, exportActionLogs } from '../services/api'

function ActionLog() {
  const [actionLogs, setActionLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)
  const [limit] = useState(20)

  useEffect(() => {
    fetchActionLogs()
  }, [currentPage])

  const fetchActionLogs = async () => {
    try {
      setLoading(true)
      const response = await getActionLogs(currentPage, limit)
      setActionLogs(response.data.actionLogs || [])
      setTotalPages(response.data.totalPages || 1)
      setTotalLogs(response.data.totalLogs || 0)
    } catch (error) {
      console.error('Ошибка при загрузке логов действий:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      const response = await exportActionLogs()
      
      // Создаем ссылку для скачивания файла
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8;' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'action_logs.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Ошибка при экспорте логов действий:', error)
      alert('Ошибка при экспорте логов действий')
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Загрузка логов действий...</p>
      </div>
    )
  }

  return (
    <div className="action-log-section">
      <div className="action-log-header">
        <h3>Логи действий</h3>
        <button className="btn btn-secondary" onClick={handleExportCSV}>
          Экспорт в CSV
        </button>
      </div>
      
      <div className="action-log-stats">
        <p>Всего записей: {totalLogs}</p>
      </div>
      
      {actionLogs.length > 0 ? (
        <div className="action-log-table-container">
          <table className="action-log-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Пользователь</th>
                <th>Тип действия</th>
                <th>Описание</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {actionLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>{log.user?.username || 'Неизвестный'}</td>
                  <td>{log.actionType}</td>
                  <td>{log.description}</td>
                  <td>{new Date(log.createdAt).toLocaleString('ru-RU')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Логи действий отсутствуют.</p>
      )}
      
      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="action-log-pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-button"
            title="Предыдущая страница"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          
          <div className="page-input-container">
            <label>Страница:</label>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value)
                if (page >= 1 && page <= totalPages) {
                  setCurrentPage(page)
                }
              }}
              className="page-input"
            />
            <span>из {totalPages}</span>
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-button"
            title="Следующая страница"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  )
}

export default ActionLog