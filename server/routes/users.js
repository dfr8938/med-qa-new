const express = require('express')
const router = express.Router()
const { User, ActionLog } = require('../models')
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth')
const bcrypt = require('bcryptjs')
const { Op } = require('sequelize')


/**
 * Маршрут для получения всех пользователей
 * Доступен только для суперадминистраторов
 */
router.get('/', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }, // Исключаем пароль из ответа
      order: [['createdAt', 'DESC']]
    })
    res.json(users)
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

/**
 * Маршрут для создания нового администратора
 * Доступен только для суперадминистраторов
 */
router.post('/admin', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { username, email, password } = req.body
    
    // Проверка наличия всех обязательных полей
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Все поля обязательны для заполнения' })
    }
    
    // Проверка длины пароля
    if (password.length < 6) {
      return res.status(400).json({ message: 'Пароль должен содержать минимум 6 символов' })
    }
    
    // Проверка существования пользователя с таким email
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' })
    }
    
    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Создание нового админа
    const newAdmin = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'admin'
    })
    
    // Убираем пароль из ответа
    const adminData = newAdmin.toJSON()
    delete adminData.password
    
    res.status(201).json(adminData)
  } catch (error) {
    console.error('Ошибка при создании админа:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

/**
 * Маршрут для редактирования администратора или суперадминистратора
 * Доступен только для суперадминистраторов
 */
router.put('/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { username, email, password } = req.body
    
    // Проверка наличия пользователя
    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }
    
    // Проверка, что пользователь является админом или суперадмином
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return res.status(400).json({ message: 'Редактировать можно только админов и суперадминов' })
    }
    
    // Проверка наличия обязательных полей
    if (!username || !email) {
      return res.status(400).json({ message: 'Имя пользователя и email обязательны для заполнения' })
    }
    
    // Проверка существования пользователя с таким email (кроме текущего)
    const existingUser = await User.findOne({ where: { email, id: { [Op.ne]: id } } })
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' })
    }
    
    // Подготовка данных для обновления
    const updateData = { username, email }
    
    // Если передан пароль, хешируем его
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Пароль должен содержать минимум 6 символов' })
      }
      updateData.password = await bcrypt.hash(password, 10)
    }
    
    // Обновление пользователя
    await User.update(updateData, { where: { id } })
    
    // Получение обновленных данных пользователя
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    })
    
    res.json(updatedUser)
  } catch (error) {
    console.error('Ошибка при редактировании пользователя:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

/**
 * Маршрут для изменения роли пользователя
 * Доступен только для суперадминистраторов
 */
router.put('/:id/role', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body
    const userId = req.user.id // ID текущего пользователя (суперадмина)
    
    // Проверка корректности роли
    if (!['admin'].includes(role)) {  // Убираем 'user' из допустимых значений
      return res.status(400).json({ message: 'Некорректная роль. Можно назначить только admin' })
    }
    
    // Предотвращаем изменение роли самому себе
    if (userId == id) {
      return res.status(400).json({ message: 'Нельзя изменить роль самому себе' })
    }
    
    const updatedUser = await User.update(
      { role },
      { where: { id } }
    )
    
    if (updatedUser[0] === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }
    
    const userData = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    })
    
    // Логируем действие
    await ActionLog.create({
      userId: userId,
      actionType: 'UPDATE_USER_ROLE',
      description: `Изменена роль пользователя ${userData.username} на ${role}`,
      entityId: parseInt(id),
      entityType: 'User'
    })
    
    res.json(userData)
  } catch (error) {
    console.error('Ошибка при изменении роли пользователя:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

/**
 * Маршрут для удаления пользователя
 * Доступен только для суперадминистраторов
 */
router.delete('/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id // ID текущего пользователя (суперадмина)
    
    // Предотвращаем удаление самого себя
    if (userId == id) {
      return res.status(400).json({ message: 'Нельзя удалить самого себя' })
    }
    
    // Предотвращаем удаление суперадмина
    const userToDelete = await User.findByPk(id)
    if (!userToDelete) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }
    
    if (userToDelete.isSuperAdmin()) {
      return res.status(400).json({ message: 'Нельзя удалить суперадмина' })
    }
    
    // Логируем действие перед удалением
    await ActionLog.create({
      userId: userId,
      actionType: 'DELETE_USER',
      description: `Удален пользователь ${userToDelete.username}`,
      entityId: parseInt(id),
      entityType: 'User'
    })
    
    const deleted = await User.destroy({ where: { id } })
    
    if (deleted === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }
    
    res.json({ message: 'Пользователь успешно удален' })
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

module.exports = router