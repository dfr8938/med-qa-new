const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { User } = require('../models')
const { authenticateToken } = require('../middleware/auth')
const rateLimit = require('express-rate-limit')
const { Op } = require('sequelize')
// const { csrfProtection, csrfToken } = require('../middleware/csrf')
require('dotenv').config()


/**
 * Маршрут для регистрации нового пользователя
 * Доступен без аутентификации
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    // Проверка обязательных полей
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Все поля обязательны для заполнения' })
    }

    // Проверка существующего пользователя
    const existingUser = await User.findOne({
      where: {
        email: email
      }
    })

    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' })
    }

    // Создание нового пользователя
    const user = await User.create({ username, email, password })

    // Генерация JWT токена
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Ошибка регистрации:', error)
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors[0].message })
    }
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// // Лимит для попыток входа: 5 попыток за 15 минут
// const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 минут
//   max: 5, // Максимум 5 попыток
//   message: {
//     error: 'Слишком много попыток входа, попробуйте снова через 15 минут'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// })

/**
 * Маршрут для получения CSRF токена
 * Доступен без аутентификации
 */
router.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: '' });
});

/**
 * Маршрут для входа пользователя в систему
 * Доступен без аутентификации
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Проверка обязательных полей
    if (!email || !password) {
      return res.status(400).json({ message: 'Email и пароль обязательны для заполнения' })
    }

    // Поиск пользователя по email
    const user = await User.findOne({ where: { email } })

    if (!user) {
      return res.status(400).json({ message: 'Неверный email или пароль' })
    }

    // Проверка пароля
    const validPassword = await user.validPassword(password)

    if (!validPassword) {
      return res.status(400).json({ message: 'Неверный email или пароль' })
    }

    // Генерация JWT токена
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Ошибка входа:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

/**
 * Маршрут для получения информации о текущем пользователе
 * Доступен только для аутентифицированных пользователей
 */
router.get('/me', authenticateToken, async (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role
  })
})

/**
 * Маршрут для обновления профиля текущего пользователя
 * Доступен только для аутентифицированных пользователей
 */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, email, password } = req.body
    const userId = req.user.id
    
    // Проверка наличия обязательных полей
    if (!username || !email) {
      return res.status(400).json({ message: 'Имя пользователя и email обязательны для заполнения' })
    }
    
    // Проверка существования пользователя с таким email (кроме текущего)
    const existingUser = await User.findOne({ where: { email, id: { [Op.ne]: userId } } })
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
    await User.update(updateData, { where: { id: userId } })
    
    // Получение обновленных данных пользователя
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    })
    
    res.json(updatedUser)
  } catch (error) {
    console.error('Ошибка при обновлении профиля:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

module.exports = router