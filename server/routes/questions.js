const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion
} = require('../controllers/questionController');

/**
 * Маршрут для получения всех вопросов
 * Доступен без аутентификации (публичный маршрут)
 */
router.get('/', getAllQuestions);

/**
 * Маршрут для создания нового вопроса
 * Доступен только для администраторов
 */
router.post('/', authenticateToken, requireAdmin, createQuestion);

/**
 * Маршрут для обновления вопроса
 * Доступен только для администраторов
 */
router.put('/:id', authenticateToken, requireAdmin, updateQuestion);

/**
 * Маршрут для удаления вопроса
 * Доступен только для администраторов
 */
router.delete('/:id', authenticateToken, requireAdmin, deleteQuestion);

module.exports = router;