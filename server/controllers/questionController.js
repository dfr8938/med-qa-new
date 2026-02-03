const { Question, Category } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Контроллер для получения всех вопросов
 * Поддерживает пагинацию, поиск, сортировку и фильтрацию по категориям
 * @param {Object} req - Объект запроса Express
 * @param {Object} res - Объект ответа Express
 */
/**
 * Получение всех вопросов с пагинацией, поиском и фильтрацией
 * @param {import('express').Request} req - Объект запроса Express
 * @param {import('express').Response} res - Объект ответа Express
 * @returns {Promise<void>}
 */
const getAllQuestions = async (req, res) => {
  try {
    const { search, page = 1, limit = 10, sortBy = 'createdAt', order = 'DESC', categoryId } = req.query;
    
    let whereClause = {};
    const offset = (page - 1) * limit;
    
    // Если передан поисковый запрос, добавляем условие поиска
    if (search) {
      whereClause = {
        [Op.or]: [
          { question: { [Op.iLike]: `%${search}%` } },
          { answer: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }
    
    // Если передан ID категории, добавляем фильтр по категории
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    
    // Улучшенная сортировка с поддержкой регистронезависимой сортировки по вопросу
    let orderClause = [['createdAt', 'DESC']];
    if (sortBy && order) {
      // Для сортировки по вопросу используем регистронезависимую сортировку
      if (sortBy === 'question') {
        orderClause = [[sequelize.fn('LOWER', sequelize.col('question')), order]];
      } else {
        orderClause = [[sortBy, order]];
      }
    }
    
    const { count, rows } = await Question.findAndCountAll({
      where: whereClause,
      order: orderClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{
        model: Category,
        as: 'categoryRef',
        attributes: ['id', 'name', 'description']
      }]
    });
    
    // Получаем статистику по категориям
    const categoryStats = await Question.findAll({
      attributes: [
        'categoryId',
        [sequelize.fn('COUNT', sequelize.col('categoryId')), 'count']
      ],
      group: ['categoryId']
    });
    
    // Получаем статистику по датам создания
    const dateStats = await Question.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('createdAt')), 'count']
      ],
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    });
    
    const result = {
      questions: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalQuestions: count,
      categoryStats,
      dateStats,
      filteredQuestionsCount: rows.length
    };
    
    res.json(result);
  } catch (error) {
    console.error('Ошибка при получении вопросов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

/**
 * Контроллер для создания нового вопроса
 * Доступен только для администраторов
 * @param {Object} req - Объект запроса Express
 * @param {Object} res - Объект ответа Express
 */
/**
 * Создание нового вопроса
 * @param {import('express').Request} req - Объект запроса Express
 * @param {import('express').Response} res - Объект ответа Express
 * @returns {Promise<void>}
 */
const createQuestion = async (req, res) => {
  try {
    const { question, answer, categoryId } = req.body;
    
    // Проверка обязательных полей
    if (!question || !answer) {
      return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
    }
    
    // Проверка на дубликаты вопросов с учетом категории
    const existingQuestion = await Question.findOne({
      where: {
        question: question,
        categoryId: categoryId
      }
    });
    
    if (existingQuestion) {
      return res.status(400).json({ message: 'Вопрос с таким текстом уже существует' });
    }
    
    const newQuestion = await Question.create({ question, answer, categoryId });
    
    // Возвращаем созданный вопрос с информацией о категории
    const questionWithCategory = await Question.findByPk(newQuestion.id, {
      include: [{
        model: Category,
        as: 'categoryRef',
        attributes: ['id', 'name', 'description']
      }]
    });
    
    res.status(201).json(questionWithCategory);
  } catch (error) {
    console.error('Ошибка при создании вопроса:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

/**
 * Контроллер для обновления вопроса
 * Доступен только для администраторов
 * @param {Object} req - Объект запроса Express
 * @param {Object} res - Объект ответа Express
 */
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, categoryId } = req.body;
    
    // Проверка обязательных полей
    if (!question || !answer) {
      return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
    }
    
    // Проверка на дубликаты вопросов с учетом категории (исключая текущий вопрос)
    const existingQuestion = await Question.findOne({
      where: {
        question: question,
        categoryId: categoryId,
        id: {
          [Op.ne]: id
        }
      }
    });
    
    if (existingQuestion) {
      return res.status(400).json({ message: 'Вопрос с таким текстом уже существует' });
    }
    
    const [updated] = await Question.update(
      { question, answer, categoryId },
      { where: { id } }
    );
    
    if (updated === 0) {
      return res.status(404).json({ message: 'Вопрос не найден' });
    }
    
    const questionData = await Question.findByPk(id, {
      include: [{
        model: Category,
        as: 'categoryRef',
        attributes: ['id', 'name', 'description']
      }]
    });
    
    res.json(questionData);
  } catch (error) {
    console.error('Ошибка при обновлении вопроса:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

/**
 * Контроллер для удаления вопроса
 * Доступен только для администраторов
 * @param {Object} req - Объект запроса Express
 * @param {Object} res - Объект ответа Express
 */
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Question.destroy({ where: { id } });
    
    if (deleted === 0) {
      return res.status(404).json({ message: 'Вопрос не найден' });
    }
    
    res.json({ message: 'Вопрос успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении вопроса:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion
};