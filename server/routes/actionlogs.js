const express = require('express')
const router = express.Router()
const { ActionLog, User } = require('../models')
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth')

/**
 * Маршрут для получения всех логов действий
 * Доступен только для суперадминистраторов
 */
router.get('/', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit

    const { count, rows } = await ActionLog.findAndCountAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['username']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    })

    res.json({
      actionLogs: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalLogs: count
    })
  } catch (error) {
    console.error('Ошибка при получении логов действий:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

/**
 * Маршрут для экспорта логов действий в CSV
 * Доступен только для суперадминистраторов
 */
router.get('/export', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const actionLogs = await ActionLog.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['username']
      }],
      order: [['createdAt', 'DESC']]
    })

    // Создаем CSV строку
    let csvContent = 'ID,Пользователь,Тип действия,Описание,ID сущности,Тип сущности,Дата\n'
    
    actionLogs.forEach(log => {
      csvContent += `"${log.id}","${log.user?.username || 'Неизвестный'}","${log.actionType}","${log.description.replace(/"/g, '""')}","${log.entityId}","${log.entityType}","${log.createdAt.toISOString()}"\n`
    })

    // Устанавливаем заголовки для скачивания файла
    res.setHeader('Content-Disposition', 'attachment; filename="action_logs.csv"')
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.status(200).send('\uFEFF' + csvContent) // Добавляем BOM для корректного отображения кириллицы в Excel
  } catch (error) {
    console.error('Ошибка при экспорте логов действий:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

module.exports = router