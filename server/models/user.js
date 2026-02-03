'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require('bcryptjs');

/**
 * Модель пользователя системы
 * Представляет администраторов и суперадминистраторов портала
 * @typedef {Object} User
 * @property {number} id - Идентификатор пользователя
 * @property {string} username - Имя пользователя
 * @property {string} email - Email пользователя
 * @property {string} password - Хэшированный пароль
 * @property {'admin'|'superadmin'} role - Роль пользователя
 * @property {Date} createdAt - Дата создания
 * @property {Date} updatedAt - Дата обновления
 */
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Определение связей с другими моделями
     * @param {Object} models - Объект со всеми моделями
     */
    static associate(models) {
      // Определяем связь с логами действий
      User.hasMany(models.ActionLog, {
        foreignKey: 'userId',
        as: 'actionLogs'
      });
    }
    
    /**
     * Метод для проверки пароля пользователя
     * @param {string} password - Пароль для проверки
     * @returns {Promise<boolean>} Результат проверки пароля
     */
    async validPassword(password) {
      return await bcrypt.compare(password, this.password);
    }
    
    /**
     * Метод для проверки, является ли пользователь суперадминистратором
     * @returns {boolean} True, если пользователь является суперадминистратором
     */
    isSuperAdmin() {
      return this.role === 'superadmin';
    }
  }
  
  /**
   * Инициализация модели пользователя с определением полей и их валидацией
   */
  User.init({
    /**
     * Имя пользователя
     * @type {string}
     * @required
     */
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'Имя пользователя не может быть пустым'
        }
      }
    },
    
    /**
     * Email пользователя
     * @type {string}
     * @required
     */
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Некорректный формат email'
        },
        notEmpty: {
          msg: 'Email не может быть пустым'
        }
      }
    },
    
    /**
     * Хэшированный пароль пользователя
     * @type {string}
     * @required
     */
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Пароль не может быть пустым'
        },
        len: {
          args: [6, 100],
          msg: 'Пароль должен содержать минимум 6 символов'
        }
      }
    },
    
    /**
     * Роль пользователя (admin или superadmin)
     * @type {string}
     * @default 'admin'
     */
    role: {
      type: DataTypes.ENUM('admin', 'superadmin'),
      defaultValue: 'admin'
    }
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      /**
       * Хук перед созданием пользователя
       * Хэширует пароль перед сохранением
       */
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      
      /**
       * Хук перед обновлением пользователя
       * Хэширует пароль, если он был изменен
       */
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });
  
  return User;
};