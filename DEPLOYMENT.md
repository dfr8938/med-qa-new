# Руководство по развертыванию Medical Q&A Portal на VPS сервере REG.RU

## Системные требования

- Ubuntu 20.04 или выше
- 2 CPU, 4GB RAM (минимум)
- 40GB SSD диск
- Доступ по SSH

## Подготовка сервера

### 1. Обновление системы
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Установка Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Установка PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
```

### 4. Установка Nginx
```bash
sudo apt install nginx -y
```

## Настройка базы данных

### 1. Создание баз данных для разных сред
```bash
sudo -u postgres createdb med_qa_dev_db
sudo -u postgres createdb med_qa_test_db
sudo -u postgres createdb med_qa_prod_db
```

### 2. Создание пользователя базы данных и выдача привилегий
```bash
sudo -u postgres psql
```

```sql
-- Для сред разработки и тестирования используется пользователь postgres
-- Для продакшена создаем отдельного пользователя
CREATE USER med_qa_user WITH ENCRYPTED PASSWORD 'K3nP5V9mN8xR2dW7qL4pY6tA1sZ3cU8f';
GRANT ALL PRIVILEGES ON DATABASE med_qa_prod_db TO med_qa_user;
-- Для разработки и тестирования также выдаем привилегии пользователю postgres
GRANT ALL PRIVILEGES ON DATABASE med_qa_dev_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE med_qa_test_db TO postgres;
\q
```

## Развертывание приложения

### 1. Клонирование репозитория
```bash
sudo mkdir -p /opt/med-qa-portal
sudo chown $USER:$USER /opt/med-qa-portal
cd /opt/med-qa-portal
git clone https://github.com/your-repo/med-qa-portal.git .
```

### 2. Установка зависимостей
```bash
# Сервер
cd server
npm install --production

# Клиент
cd ../client
npm install
```

### 3. Настройка переменных окружения
Создайте файл `server/.env.production`:
```env
JWT_SECRET=your_strong_secret_key_here_for_production
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=med_qa_prod_db
DB_USER=med_qa_user
DB_PASSWORD=K3nP5V9mN8xR2dW7qL4pY6tA1sZ3cU8f
```

Также создайте файлы `.env.development` и `.env.test` для соответствующих сред:
```env
# .env.development
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=med_qa_dev_db
DB_USER=postgres
DB_PASSWORD=postgres
```

```env
# .env.test
JWT_SECRET=your_jwt_secret_here
NODE_ENV=test
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=med_qa_test_db
DB_USER=postgres
DB_PASSWORD=postgres
```

### 4. Создание production сборки
```bash
cd /opt/med-qa-portal/client
npm run build
```

## Миграции и сиды

Перед запуском миграций убедитесь, что переменные окружения установлены правильно. Для production среды используйте:

```bash
export NODE_ENV=production
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=med_qa_prod_db
export DB_USER=med_qa_user
export DB_PASSWORD=K3nP5V9mN8xR2dW7qL4pY6tA1sZ3cU8f
```

Или убедитесь, что файл `server/.env.production` существует и содержит правильные значения переменных окружения.

### 1. Запуск миграций
```bash
cd /opt/med-qa-portal/server
npx sequelize-cli db:migrate
```

### 2. Загрузка сидов
```bash
npx sequelize-cli db:seed:all
```

Если вы используете production среду, убедитесь, что переменная окружения NODE_ENV установлена в значение "production" перед запуском миграций и сидов.

## Настройка systemd сервиса

Скопируйте файл `deployment/med-qa.service` в `/etc/systemd/system/`:
```bash
sudo cp deployment/med-qa.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable med-qa.service
```

## Настройка Nginx

Скопируйте файл `deployment/nginx.conf` в `/etc/nginx/sites-available/`:
```bash
sudo cp deployment/nginx.conf /etc/nginx/sites-available/med-qa
sudo ln -sf /etc/nginx/sites-available/med-qa /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## Запуск приложения

```bash
sudo systemctl start med-qa.service
```

Проверка статуса:
```bash
sudo systemctl status med-qa.service
```

## Инициализация базы данных

```bash
cd /opt/med-qa-portal/server
npm run setup-db
```

## Проверка подключения к базам данных

Для проверки корректности настроек подключения к базам данных используйте следующие команды:

```bash
# Проверка подключения к базе разработки
psql -U postgres -d med_qa_dev_db -c "SELECT current_database(), current_user;"

# Проверка подключения к тестовой базе
psql -U postgres -d med_qa_test_db -c "SELECT current_database(), current_user;"

# Проверка подключения к продакшен базе
psql -U med_qa_user -d med_qa_prod_db -c "SELECT current_database(), current_user;"
```

## Обновление приложения

Для обновления приложения используйте скрипт `deploy.sh`:
```bash
./deploy.sh
```

## Безопасность

### Настройка SSL сертификата (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your_domain.com
```

### Настройка Firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```
 | ```
 | 
 | ## Изменение пароля пользователя postgres
 | 
 | Для изменения пароля пользователя postgres выполните следующие шаги:
 | 
 | 1. Подключитесь к PostgreSQL от имени пользователя postgres:
 |    ```bash
 |    sudo -u postgres psql
 |    ```
 | 
 | 2. Внутри PostgreSQL измените пароль:
 |    ```sql
 |    ALTER USER postgres PASSWORD 'новый_пароль';
 |    ```
 | 
 | 3. Выйдите из PostgreSQL:
 |    ```sql
 |    \q
 |    ```
 | 
 | 4. Обновите пароль в файлах конфигурации:
 |    - `server/.env.development`
 |    - `server/.env.test`
 | 
 | 5. Перезапустите сервис:
 |    ```bash
 |    sudo systemctl restart med-qa.service
 |    ```

## Мониторинг и логирование

Логи приложения доступны через journalctl:
```bash
sudo journalctl -u med-qa.service -f
```

## Резервное копирование

Регулярное резервное копирование базы данных:
```bash
pg_dump med_qa_db > backup_$(date +"%Y%m%d").sql