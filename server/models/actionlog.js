'use strict';
const {
  Model
} = require('sequelize');

/**
 * Модель лога действий пользователей
 * Представляет запись о действии пользователя в системе
 */
module.exports = (sequelize, DataTypes) => {
  class ActionLog extends Model {
    /**
     * Определение связей с другими моделями
     * @param {Object} models - Объект со всеми моделями
     */
    static associate(models) {
      // Определяем связь с моделью User
      ActionLog.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  
  /**
   * Инициализация модели лога действий с определением полей
   */
  ActionLog.init({
    /**
     * Идентификатор пользователя, выполнившего действие
     * @type {number}
     */
    userId: DataTypes.INTEGER,
    
    /**
     * Тип действия
     * @type {string}
     */
    actionType: DataTypes.STRING,
    
    /**
     * Описание действия
     * @type {string}
     */
    description: DataTypes.TEXT,
    
    /**
     * Идентификатор сущности, над которой было выполнено действие
     * @type {number}
     */
    entityId: DataTypes.INTEGER,
    
    /**
     * Тип сущности, над которой было выполнено действие
     * @type {string}
     */
    entityType: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ActionLog',
  });
  
  return ActionLog;
};