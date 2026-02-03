const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const path = require('path')
require('dotenv').config()

// // Импортируем CSRF middleware
// const { csrfProtection, csrfToken } = require('./middleware/csrf')

// Создаем функцию для экспорта приложения
function createApp() {
  const app = express()
  const PORT = process.env.PORT || 5000

  // Middleware
  app.use(cors())
  app.use(express.json())
  app.use(cookieParser())

  // // CSRF защита для всех POST, PUT, DELETE запросов
  // app.use((req, res, next) => {
  //   // Пропускаем CSRF проверку для маршрута получения токена
  //   if (req.path === '/api/auth/csrf-token') {
  //     return next();
  //   }
  //
  //   if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
  //     csrfProtection(req, res, next)
  //   } else {
  //     next()
  //   }
  // })
  
  // Добавляем отладочный middleware после CSRF middleware
  app.use((req, res, next) => {
    console.log('=== Request Info ===');
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('Headers:', req.headers);
    console.log('Cookies:', req.cookies);
    console.log('Body:', req.body);
    next();
  });

  // Статические файлы
  app.use(express.static(path.join(__dirname, 'public')))

  // Подключение к базе данных и инициализация
  const db = require('./config/database')
  const initializeDatabase = require('./config/db_init')

  // Инициализация базы данных
  initializeDatabase()

  // Маршруты
  app.use('/api/auth', require('./routes/auth'))
  app.use('/api/questions', require('./routes/questions'))
  app.use('/api/categories', require('./routes/categories'))
  app.use('/api/users', require('./routes/users'))
  app.use('/api/actionlogs', require('./routes/actionlogs'))

  // Обработка корневого маршрута
  app.get('/', (req, res) => {
    res.json({ message: 'Добро пожаловать в API медицинского портала' })
  })

  // Обработка несуществующих маршрутов
  app.use('*', (req, res) => {
    res.status(404).json({ message: 'Маршрут не найден' })
  })

  // // Обработка ошибок CSRF
  // app.use((err, req, res, next) => {
  //   if (err.code === 'EBADCSRFTOKEN') {
  //     return res.status(403).json({ message: 'Неверный CSRF токен' })
  //   }
  //   next(err)
  // })

  // Обработка других ошибок
  app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ message: 'Что-то пошло не так!' })
  })

  return app;
}

// Если файл запущен напрямую, запускаем сервер
if (require.main === module) {
  const app = createApp();
  const PORT = process.env.PORT || 5000;
  const HOST = process.env.HOST || 'localhost';
  app.listen(PORT, HOST, () => {
    console.log(`Сервер запущен на ${HOST}:${PORT}`)
  })
}

// Экспортируем функцию создания приложения для тестов
module.exports = createApp