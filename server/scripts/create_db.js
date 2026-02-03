const { Client } = require('pg')
const dotenv = require('dotenv')
const bcrypt = require('bcryptjs')
const config = require('../config/config.json')

// Загрузка переменных окружения
dotenv.config()

// Определяем окружение
const env = process.env.NODE_ENV || 'development'

// Конфигурация для подключения к PostgreSQL (без указания базы данных)
// Для создания пользователя и базы данных используем учетные данные суперпользователя
const clientConfig = {
  user: config.development.username,
  password: config.development.password,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
}

// Имя базы данных из переменных окружения
const dbName = process.env.DB_NAME || 'med_qa_db'

// Учетные данные для создания пользователя med_qa_user
const dbUser = process.env.DB_USER || 'med_qa_user'
const dbPassword = process.env.DB_PASSWORD || 'K3nP5V9mN8xR2dW7qL4pY6tA1sZ3cU8f'

async function dropAndCreateDatabase() {
  let client

  try {
    // Подключение к PostgreSQL без указания базы данных
    client = new Client(clientConfig)
    await client.connect()
    console.log('Подключение к PostgreSQL успешно установлено.')

    // Удаление базы данных, если она существует
    await client.query(`DROP DATABASE IF EXISTS "${dbName}"`)
    console.log(`База данных "${dbName}" удалена.`)

    // Создание базы данных
    await client.query(`CREATE DATABASE "${dbName}"`)
    console.log(`База данных "${dbName}" успешно создана.`)
  } catch (error) {
    console.error('Ошибка при работе с базой данных:', error.message)
  } finally {
    // Закрытие подключения
    if (client) {
      await client.end()
      console.log('Подключение к PostgreSQL закрыто.')
    }
  }
}

// Функция для создания пользователя med_qa_user в PostgreSQL
async function createDBUser() {
  let client

  try {
    // Подключение к PostgreSQL с правами суперпользователя
    client = new Client({
      ...clientConfig
    })
    
    await client.connect()
    console.log('Подключение к PostgreSQL с правами суперпользователя успешно установлено.')

    // Создание пользователя med_qa_user
    await client.query(`CREATE USER "${dbUser}" WITH PASSWORD '${dbPassword}'`)
    console.log(`Пользователь "${dbUser}" успешно создан.`)
    
    // Назначение прав пользователю
    await client.query(`GRANT ALL PRIVILEGES ON DATABASE "${dbName}" TO "${dbUser}"`)
    await client.query(`GRANT ALL ON SCHEMA public TO "${dbUser}"`)
    console.log(`Права для пользователя "${dbUser}" успешно назначены.`)
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`Пользователь "${dbUser}" уже существует.`)
    } else {
      console.error('Ошибка при создании пользователя:', error.message)
    }
  } finally {
    // Закрытие подключения
    if (client) {
      await client.end()
      console.log('Подключение к PostgreSQL закрыто.')
    }
  }
}

// Функция для создания суперпользователя
async function createSuperAdmin() {
  let client

  try {
    // Подключение к базе данных от имени med_qa_user
    client = new Client({
      user: dbUser,
      password: dbPassword,
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: dbName
    })
    
    await client.connect()
    console.log(`Подключение к базе данных "${dbName}" от имени "${dbUser}" успешно установлено.`)

    // Создание таблицы пользователей
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Users" (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        "createdAt" TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL
      )
    `)
    
    console.log('Таблица пользователей создана.')

    // Создание суперпользователя
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash('superadmin123', salt)
    
    await client.query(
      `INSERT INTO "Users" (username, email, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      ['superadmin', 'superadmin@example.com', hashedPassword, 'superadmin']
    )
    
    console.log('Суперпользователь успешно создан.')
  } catch (error) {
    console.error('Ошибка при создании суперпользователя:', error.message)
  } finally {
    // Закрытие подключения
    if (client) {
      await client.end()
      console.log('Подключение к базе данных закрыто.')
    }
  }
}

// Запуск скрипта
async function run() {
  await dropAndCreateDatabase()
  await createDBUser()
  await createSuperAdmin()
}

run()