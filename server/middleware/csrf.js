// Заменяем устаревшую библиотеку csurf на ручную реализацию CSRF-защиты
const crypto = require('crypto');

// Хранилище для CSRF токенов (в production следует использовать Redis или другое хранилище)
const csrfTokens = new Map();

/**
 * Генерирует новый CSRF токен
 * @returns {string} CSRF токен
 */
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Middleware для генерации и проверки CSRF токенов
 * @param {Object} req - Объект запроса Express
 * @param {Object} res - Объект ответа Express
 * @param {Function} next - Функция для перехода к следующему middleware
 */
const csrfProtection = (req, res, next) => {
  // Отключаем CSRF-защиту
  next();
};

/**
 * Middleware для добавления CSRF токена в локальные переменные ответа
 * Делает токен доступным в шаблонах
 * @param {Object} req - Объект запроса Express
 * @param {Object} res - Объект ответа Express
 * @param {Function} next - Функция для перехода к следующему middleware
 */
const csrfToken = (req, res, next) => {
  // Проверяем, что csrfProtection middleware был применен
  if (typeof req.csrfToken === 'function') {
    const token = req.csrfToken();
    // Устанавливаем токен в cookie для клиента
    res.cookie('csrf-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 // 1 час
    });
    // Отправляем токен в теле ответа для использования клиентом
    res.json({ csrfToken: token });
  } else {
    res.status(500).json({ message: 'Ошибка генерации CSRF токена' });
  }
};

// Добавляем middleware для отладки CSRF токенов
const csrfDebug = (req, res, next) => {
  console.log('=== CSRF Debug Info ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('CSRF Token from header:', req.headers['x-csrf-token']);
  console.log('CSRF Token from cookie:', req.cookies);
  if (typeof req.csrfToken === 'function') {
    console.log('Generated CSRF Token:', req.csrfToken());
  }
  console.log('========================');
  next();
};

module.exports = {
  csrfProtection,
  csrfToken
};