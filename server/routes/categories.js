const express = require('express');
const router = express.Router();
const { Category, Question } = require('../models');
const { Op } = require('sequelize');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { flushCache } = require('../controllers/questionController');
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryQuestions,
  deleteCategoryQuestions
} = require('../controllers/categoryController');

/**
 * Маршрут для получения всех категорий
 * Доступен без аутентификации (публичный маршрут)
 */
router.get('/', getAllCategories);

/**
 * Маршрут для получения всех вопросов в категории
 * Доступен только для администраторов
 * @deprecated Используйте GET /questions с параметром categoryId
 */
router.get('/:id/questions', authenticateToken, requireAdmin, getCategoryQuestions);

/**
 * Маршрут для создания новой категории
 * Доступен только для администраторов
 */
router.post('/', authenticateToken, requireAdmin, createCategory);

/**
 * Маршрут для обновления категории
 * Доступен только для администраторов
 */
router.put('/:id', authenticateToken, requireAdmin, updateCategory);

/**
 * Маршрут для удаления категории
 * Доступен только для администраторов
 */
router.delete('/:id', authenticateToken, requireAdmin, deleteCategory);

/**
 * Маршрут для удаления всех вопросов в категории
 * Доступен только для администраторов
 */
router.delete('/:id/questions', authenticateToken, requireAdmin, deleteCategoryQuestions);

module.exports = router;