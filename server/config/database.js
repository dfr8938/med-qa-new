const { Sequelize } = require('sequelize');
const config = require('./config.json');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Используем переменные окружения, если они доступны, иначе значения из config.json
const sequelize = new Sequelize(
  process.env.DB_NAME || dbConfig.database,
  process.env.DB_USER || dbConfig.username,
  process.env.DB_PASSWORD || dbConfig.password,
  {
    host: process.env.DB_HOST || dbConfig.host,
    port: process.env.DB_PORT || dbConfig.port || 5432,
    dialect: dbConfig.dialect,
    logging: env === 'development' ? console.log : false, // Отключаем логирование в продакшене
  }
);

module.exports = sequelize;
