# Медицинский портал вопросов и ответов

## Описание проекта

Медицинский портал представляет собой веб-приложение для управления базой знаний медицинских вопросов и ответов. Приложение имеет три уровня доступа: публичный доступ к вопросам, админ-панель для управления контентом и суперадмин-панель для управления пользователями и системой в целом.

## Основные функции

### Публичная часть
- Просмотр списка медицинских вопросов и ответов
- Поиск по вопросам
- Пагинация результатов
- Сортировка по дате создания
- Просмотр вопросов по категориям

### Админ-панель
- Аутентификация администратора
- Создание, редактирование и удаление вопросов
- Создание, редактирование и удаление категорий
- Статистика по вопросам
- Графики активности
- Предотвращение дублирования вопросов

### Суперадмин-панель
- Управление пользователями (админами)
- Назначение ролей
- Просмотр истории действий админов
- Экспорт логов действий в CSV

## Технический стек

### Фронтенд
- React
- Vite
- Axios
- React Router
- Recharts (для графиков)
- CSS (кастомная стилизация)

### Бэкенд
- Node.js
- Express
- PostgreSQL
- Sequelize ORM

### Аутентификация и безопасность
- JWT токены
- Cookie-based sessions
- Rate limiting
- CSRF защита
- Bcrypt для хэширования паролей

## Архитектура проекта

```
.
├── client/                 # Фронтенд приложение (React)
│   ├── public/             # Статические файлы
│   ├── src/
│   │   ├── components/     # Переиспользуемые компоненты
│   │   ├── pages/          # Страницы приложения
│   │   ├── services/       # API сервисы
│   │   └── ...
│   └── ...
├── server/                # Бэкенд приложение (Node.js/Express)
│   ├── config/             # Конфигурация базы данных
│   ├── middleware/          # Промежуточное ПО
│   ├── migrations/          # Миграции базы данных
│   ├── models/              # Модели данных (Sequelize)
│   ├── routes/              # API маршруты
│   ├── seeders/             # Начальные данные
│   ├── public/              # Статические файлы
│   └── ...
├── deployment/              # Файлы для развертывания
└── README.md
```

## Быстрый старт

### Требования
- Node.js (v14 или выше)
- PostgreSQL (v12 или выше)
- Yarn или npm

### Установка

1. Клонируйте репозиторий:
   ```bash
   git clone <repository-url>
   cd med-qa-portal
   ```

2. Установите зависимости для бэкенда:
   ```bash
   cd server
   npm install
   cd ..
   ```

3. Установите зависимости для фронтенда:
   ```bash
   cd client
   npm install
   cd ..
   ```

### Настройка базы данных

В проекте используются раздельные базы данных для разных сред:
- `med_qa_dev_db` для среды разработки
- `med_qa_test_db` для тестовой среды
- `med_qa_prod_db` для продакшен среды

Конфигурация подключения к базам данных находится в файле `server/config/config.json`:

```json
{
  "development": {
    "username": "postgres",
    "password": "postgres",
    "database": "med_qa_dev_db",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "test": {
    "username": "postgres",
    "password": "postgres",
    "database": "med_qa_test_db",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "production": {
    "username": "med_qa_user",
    "password": "K3nP5V9mN8xR2dW7qL4pY6tA1sZ3cU8f",
    "database": "med_qa_prod_db",
    "host": "localhost",
    "port": 5432,
    "dialect": "postgres"
  }
}
```

### Проверка подключения к базам данных

Для проверки подключения к базам данных используйте следующие команды:

```bash
# Проверка подключения к базе разработки
psql -U postgres -d med_qa_dev_db -c "SELECT current_database(), current_user;"

# Проверка подключения к тестовой базе
psql -U postgres -d med_qa_test_db -c "SELECT current_database(), current_user;"

# Проверка подключения к продакшен базе
psql -U med_qa_user -d med_qa_prod_db -c "SELECT current_database(), current_user;"
```

### Переменные окружения

Создайте файл `.env` в папке `server` со следующими переменными или используйте `.env.example` как шаблон:

**ВАЖНО**: Никогда не храните файл `.env` в системе контроля версий. Он должен быть добавлен в `.gitignore`.

```
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=med_qa_db
DB_USER=med_qa_user
DB_PASSWORD=your_db_password_here
```

**Рекомендации по безопасности**:
- Используйте сложные пароли для базы данных
- Храните JWT_SECRET в безопасном месте и регулярно меняйте его
- Не используйте учетные данные из примеров в production

### Запуск приложения

### Запуск приложения

Для запуска всего приложения в режиме разработки выполните:

```bash
npm run dev
```

Эта команда запустит и фронтенд, и бэкенд одновременно.

Для запуска только бэкенда:
```bash
cd server
npm run dev
```

Для запуска только фронтенда:
```bash
cd client
npm run dev
```

## Примеры использования

### API запросы

#### Получение списка вопросов (публичный endpoint)
```bash
# Получить все вопросы
curl -X GET http://localhost:5000/api/questions

# Поиск вопросов с пагинацией
curl -X GET "http://localhost:5000/api/questions?search=диабет&page=1&limit=10"

# Получить вопросы определенной категории
curl -X GET "http://localhost:5000/api/questions?categoryId=1"
```

#### Аутентификация администратора
```bash
# Вход в систему
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}'
```

#### Создание вопроса (требует аутентификации админа)
```bash
curl -X POST http://localhost:5000/api/questions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "question": "Что такое гипертония?",
    "answer": "Гипертония - это хроническое заболевание...",
    "categoryId": 1
  }'
```

#### Создание категории (требует аутентификации админа)
```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Кардиология",
    "description": "Вопросы о заболеваниях сердца и сосудов"
  }'
```

#### Создание администратора (требует аутентификации суперадмина)
```bash
curl -X POST http://localhost:5000/api/users/admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "username": "newadmin",
    "email": "newadmin@example.com",
    "password": "securepassword123"
  }'
```

## Развертывание

Подробное руководство по развертыванию приложения на VPS сервере REG.RU находится в файле [DEPLOYMENT.md](DEPLOYMENT.md).

Для быстрого развертывания на VPS можно использовать скрипт [deploy.sh](deploy.sh):

```bash
./deploy.sh
```

## API Endpoints

### Аутентификация
- `POST /api/auth/login` - Вход в систему
- `GET /api/auth/me` - Получение информации о текущем пользователе
- `POST /api/auth/logout` - Выход из системы

### Вопросы
- `GET /api/questions` - Получение списка вопросов (публичный)
- `POST /api/questions` - Создание вопроса (админ)
- `PUT /api/questions/:id` - Обновление вопроса (админ)
- `DELETE /api/questions/:id` - Удаление вопроса (админ)

### Категории
- `GET /api/categories` - Получение списка категорий
- `POST /api/categories` - Создание категории (админ)
- `PUT /api/categories/:id` - Обновление категории (админ)
- `DELETE /api/categories/:id` - Удаление категории (админ)

### Пользователи
- `GET /api/users` - Получение списка пользователей (суперадмин)
- `POST /api/users/admin` - Создание админа (суперадмин)
- `PUT /api/users/:id` - Редактирование пользователя (суперадмин)
- `PUT /api/users/:id/role` - Изменение роли пользователя (суперадмин)
- `DELETE /api/users/:id` - Удаление пользователя (суперадмин)

## Роли пользователей

1. **Пользователь (user)** - Доступ только к публичной части
2. **Админ (admin)** - Доступ к админ-панели для управления вопросами и категориями
3. **Суперадмин (superadmin)** - Полный доступ ко всем функциям системы

## Безопасность

- Пароли хэшируются с использованием bcrypt
- JWT токены с истечением срока действия (24 часа)
- Rate limiting для попыток входа (5 попыток за 15 минут)
- Проверка ролей на уровне middleware
- CSRF защита для всех форм
- Предотвращение дублирования вопросов

## Лицензия

MIT