'use strict';
const {
  Model
} = require('sequelize');

/**
 * Модель категории вопросов
 * Представляет категорию для группировки медицинских вопросов
 */
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Определение связей с другими моделями
     * @param {Object} models - Объект со всеми моделями
     */
    static associate(models) {
      // Определяем связь с вопросами
      Category.hasMany(models.Question, {
        foreignKey: 'categoryId',
        as: 'questions',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }
  
  /**
   * Инициализация модели категории с определением полей
   */
  Category.init({
    /**
     * Название категории
     * @type {string}
     */
    name: DataTypes.STRING,
    
    /**
     * Описание категории
     * @type {string}
     */
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Category',
  });
  
  return Category;
};