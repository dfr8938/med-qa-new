'use strict';
const {
  Model
} = require('sequelize');

/**
 * Модель вопроса/ответа
 * Представляет медицинский вопрос и его ответ в системе
 */
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    /**
     * Определение связей с другими моделями
     * @param {Object} models - Объект со всеми моделями
     */
    static associate(models) {
      // Определяем связи (если нужно)
      Question.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'categoryRef'
      });
    }
  }
  
  /**
   * Инициализация модели вопроса с определением полей и их валидацией
   */
  Question.init({
    /**
     * Текст вопроса
     * @type {string}
     * @required
     */
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Вопрос не может быть пустым'
        }
      }
    },
    
    /**
     * Текст ответа на вопрос
     * @type {string}
     * @required
     */
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Ответ не может быть пустым'
        }
      }
    },
    
    /**
     * Название категории (устаревшее поле, сохранено для совместимости)
     * @type {string}
     * @deprecated
     */
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    
    /**
     * Идентификатор категории, к которой относится вопрос
     * @type {number}
     */
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Categories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  }, {
    sequelize,
    modelName: 'Question',
  });
  
  return Question;
};