const { Category, Question } = require('../models');
const { Op } = require('sequelize');
// const { flushCache } = require('./questionController');

/**
 * Контроллер для работы с категориями
 * @namespace CategoryController
 */

/**
 * Получение всех категорий
 * @param {import('express').Request} req - Объект запроса Express
 * @param {import('express').Response} res - Объект ответа Express
 * @returns {Promise<void>}
 */
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });
    res.json(categories);
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

/**
 * Создание новой категории
 * @param {import('express').Request} req - Объект запроса Express
 * @param {import('express').Response} res - Объект ответа Express
 * @returns {Promise<void>}
 */
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Проверка обязательных полей
    if (!name) {
      return res.status(400).json({ message: 'Название категории обязательно для заполнения' });
    }
    
    // Проверка существующей категории с таким именем
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({ message: 'Категория с таким названием уже существует' });
    }
    
    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (error) {
    console.error('Ошибка при создании категории:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

/**
 * Обновление категории
 * @param {import('express').Request} req - Объект запроса Express
 * @param {import('express').Response} res - Объект ответа Express
 * @returns {Promise<void>}
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // Проверка существующей категории с таким именем (исключая текущую)
    if (name) {
      const existingCategory = await Category.findOne({
        where: {
          name,
          id: { [Op.ne]: id }
        }
      });
      if (existingCategory) {
        return res.status(400).json({ message: 'Категория с таким названием уже существует' });
      }
    }
    
    const [updated] = await Category.update(
      { name, description },
      { where: { id } }
    );
    
    if (updated === 0) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }
    
    const category = await Category.findByPk(id);
    res.json(category);
  } catch (error) {
    console.error('Ошибка при обновлении категории:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

/**
 * Удаление категории
 * @param {import('express').Request} req - Объект запроса Express
 * @param {import('express').Response} res - Объект ответа Express
 * @returns {Promise<void>}
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Проверяем существование категории
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }
    
    // Удаляем все вопросы в категории
    await Question.destroy({ where: { categoryId: id } });
    
    // Удаляем категорию
    await Category.destroy({ where: { id } });
    
    // Очищаем кэш после удаления категории
    // flushCache();
    
    res.json({ message: 'Категория и все вопросы в ней успешно удалены' });
  } catch (error) {
    console.error('Ошибка при удалении категории:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

/**
 * Получение всех вопросов в категории
 * @param {import('express').Request} req - Объект запроса Express
 * @param {import('express').Response} res - Объект ответа Express
 * @returns {Promise<void>}
 */
const getCategoryQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Проверяем существование категории
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }
    
    // Получаем все вопросы в категории
    const questions = await Question.findAll({
      where: { categoryId: id },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(questions);
  } catch (error) {
    console.error('Ошибка при получении вопросов категории:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

/**
 * Удаление всех вопросов в категории
 * @param {import('express').Request} req - Объект запроса Express
 * @param {import('express').Response} res - Объект ответа Express
 * @returns {Promise<void>}
 */
const deleteCategoryQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Проверяем существование категории
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }
    
    // Удаляем все вопросы в категории
    const deletedCount = await Question.destroy({ where: { categoryId: id } });
    
    res.json({ 
      message: `Удалено ${deletedCount} вопросов из категории`,
      deletedCount
    });
  } catch (error) {
    console.error('Ошибка при удалении вопросов категории:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryQuestions,
  deleteCategoryQuestions
};