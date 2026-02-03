#!/bin/bash

# Автоматизированный скрипт развертывания Medical Q&A Portal
# Выполняет все шаги из DEPLOYMENT.md одной командой

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Логирование
LOG_FILE="/var/log/med-qa-deploy.log"

# Параметры по умолчанию
DOMAIN=""
IP_ADDRESS=""
SSL_ENABLED=false
RESET=false
INSTALL_DIR="/opt/med-qa-portal"
REPO_URL="https://github.com/dfr8938/med-qa.git"

# Функция логирования
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_success() {
    log "${GREEN}[SUCCESS]${NC} $1"
}

log_info() {
    log "${BLUE}[INFO]${NC} $1"
}

log_warning() {
    log "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    log "${RED}[ERROR]${NC} $1"
}

# Функция для отображения справки
show_help() {
    echo "Автоматизированный скрипт развертывания Medical Q&A Portal"
    echo ""
    echo "Использование: $0 [ОПЦИИ]"
    echo ""
    echo "Опции:"
    echo "  -d, --domain DOMAIN    Доменное имя для настройки SSL"
    echo "  -i, --ip IP_ADDRESS   IP-адрес сервера"
    echo "  -s, --ssl             Включить настройку SSL сертификата"
    echo "  -r, --reset           Сбросить существующую установку"
    echo "  -h, --help            Показать эту справку"
    echo ""
    echo "Примеры:"
    echo "  $0                          # Базовое развертывание"
    echo "  $0 -d medsester.ru -i 130.49.149.185 --ssl     # Развертывание с SSL"
    echo "  $0 -r                       # Сброс и новое развертывание"
}

# Парсинг аргументов
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--domain)
            DOMAIN="$2"
            shift 2
            ;;
        -i|--ip)
            IP_ADDRESS="$2"
            shift 2
            ;;
        -s|--ssl)
            SSL_ENABLED=true
            shift
            ;;
        -r|--reset)
            RESET=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            log_error "Неизвестный параметр: $1"
            show_help
            exit 1
            ;;
    esac
done

# Проверка прав администратора
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "Этот скрипт должен запускаться от имени root"
        exit 1
    fi
}

# Проверка существующей установки
check_existing_install() {
    if [ -d "$INSTALL_DIR" ] && [ "$RESET" = false ]; then
        log_warning "Обнаружена существующая установка в $INSTALL_DIR"
        log_warning "Используйте параметр --reset для очистки перед новой установкой"
        read -p "Продолжить установку поверх существующей? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Установка отменена пользователем"
            exit 0
        fi
    fi
}

# Проверка системных требований
check_system_requirements() {
    log_info "Проверка системных требований..."
    
    # Проверка ОС
    if ! grep -q "Ubuntu" /etc/os-release; then
        log_warning "Скрипт протестирован на Ubuntu. На других дистрибутивах могут потребоваться изменения."
    fi
    
    # Проверка версии Ubuntu
    if grep -q "Ubuntu" /etc/os-release; then
        UBUNTU_VERSION=$(lsb_release -rs)
        if (( $(echo "$UBUNTU_VERSION < 20.04" | bc -l) )); then
            log_warning "Рекомендуется Ubuntu 20.04 или выше. Текущая версия: $UBUNTU_VERSION"
        fi
    fi
    
    log_success "Проверка системных требований завершена"
}

# Обновление системы
update_system() {
    log_info "Обновление системы..."
    apt update && apt upgrade -y
    log_success "Система обновлена"
}

# Установка необходимых пакетов
install_packages() {
    log_info "Установка необходимых пакетов..."
    
    # Установка Node.js
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        apt-get install -y nodejs
        log_success "Node.js установлен"
    else
        log_info "Node.js уже установлен"
    fi
    
    # Установка PostgreSQL
    if ! command -v psql &> /dev/null; then
        apt install postgresql postgresql-contrib -y
        log_success "PostgreSQL установлен"
    else
        log_info "PostgreSQL уже установлен"
    fi
    
    # Установка Nginx
    if ! command -v nginx &> /dev/null; then
        apt install nginx -y
        log_success "Nginx установлен"
    else
        log_info "Nginx уже установлен"
    fi
    
    # Установка дополнительных утилит
    apt install git curl bc certbot python3-certbot-nginx -y
    
    log_success "Все пакеты установлены"
}

# Настройка базы данных
setup_database() {
    log_info "Настройка базы данных..."
    
    # Запуск PostgreSQL если не запущен
    systemctl start postgresql
    systemctl enable postgresql
    
    # Создание баз данных
    sudo -u postgres createdb med_qa_dev_db 2>/dev/null || log_info "База данных med_qa_dev_db уже существует"
    sudo -u postgres createdb med_qa_test_db 2>/dev/null || log_info "База данных med_qa_test_db уже существует"
    sudo -u postgres createdb med_qa_prod_db 2>/dev/null || log_info "База данных med_qa_prod_db уже существует"
    
    # Создание пользователя базы данных
    DB_USER_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='med_qa_user'")
    if [ "$DB_USER_EXISTS" != "1" ]; then
        sudo -u postgres psql -c "CREATE USER med_qa_user WITH ENCRYPTED PASSWORD 'K3nP5V9mN8xR2dW7qL4pY6tA1sZ3cU8f';"
        log_success "Пользователь med_qa_user создан"
    else
        log_info "Пользователь med_qa_user уже существует"
    fi
    
    # Назначение привилегий
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE med_qa_prod_db TO med_qa_user;"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE med_qa_dev_db TO postgres;"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE med_qa_test_db TO postgres;"
    
    # Назначение привилегий на схему public
    sudo -u postgres psql -d med_qa_prod_db -c "GRANT ALL ON SCHEMA public TO med_qa_user;"
    sudo -u postgres psql -d med_qa_prod_db -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO med_qa_user;"
    sudo -u postgres psql -d med_qa_prod_db -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO med_qa_user;"
    sudo -u postgres psql -d med_qa_prod_db -c "GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO med_qa_user;"
    sudo -u postgres psql -d med_qa_prod_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO med_qa_user;"
    sudo -u postgres psql -d med_qa_prod_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO med_qa_user;"
    sudo -u postgres psql -d med_qa_prod_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO med_qa_user;"
    
    # Для разработки и тестирования
    sudo -u postgres psql -d med_qa_dev_db -c "GRANT ALL ON SCHEMA public TO postgres;"
    sudo -u postgres psql -d med_qa_dev_db -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;"
    sudo -u postgres psql -d med_qa_dev_db -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;"
    sudo -u postgres psql -d med_qa_dev_db -c "GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres;"
    
    sudo -u postgres psql -d med_qa_test_db -c "GRANT ALL ON SCHEMA public TO postgres;"
    sudo -u postgres psql -d med_qa_test_db -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;"
    sudo -u postgres psql -d med_qa_test_db -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;"
    sudo -u postgres psql -d med_qa_test_db -c "GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres;"
    
    log_success "База данных настроена"
}

# Развертывание приложения
deploy_application() {
    log_info "Развертывание приложения..."
    
    # Создание директории для приложения
    if [ "$RESET" = true ] && [ -d "$INSTALL_DIR" ]; then
        rm -rf "$INSTALL_DIR"
        log_info "Существующая установка удалена"
    fi
    
    mkdir -p "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    
    # Клонирование репозитория (если это новая установка)
    if [ ! -d ".git" ]; then
        log_info "Клонирование репозитория из $REPO_URL..."
        git clone "$REPO_URL" .
        log_success "Репозиторий клонирован"
    else
        log_info "Обновление репозитория..."
        git pull origin main
    fi
    
    # Установка зависимостей для сервера
    log_info "Установка зависимостей сервера..."
    cd server
    npm install --production
    
    # Установка зависимостей для клиента
    log_info "Установка зависимостей клиента..."
    cd ../client
    npm install
    
    # Создание production сборки
    log_info "Создание production сборки..."
    npm run build
    
    log_success "Приложение развернуто"
}

# Настройка переменных окружения
setup_environment() {
    log_info "Настройка переменных окружения..."
    
    cd "$INSTALL_DIR/server"
    
    # Создание .env.production если не существует
    if [ ! -f ".env.production" ]; then
        cat > .env.production << EOF
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
PORT=5000
HOST=${IP_ADDRESS:-localhost}
DOMAIN=${DOMAIN:-localhost}
DB_HOST=localhost
DB_PORT=5432
DB_NAME=med_qa_prod_db
DB_USER=med_qa_user
DB_PASSWORD=K3nP5V9mN8xR2dW7qL4pY6tA1sZ3cU8f
LOG_LEVEL=error
EOF
        log_success "Файл .env.production создан"
    else
        log_info "Файл .env.production уже существует"
    fi
    
    # Создание .env.development если не существует
    if [ ! -f ".env.development" ]; then
        cat > .env.development << EOF
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=development
PORT=5000
HOST=${IP_ADDRESS:-localhost}
DOMAIN=${DOMAIN:-localhost}
DB_HOST=localhost
DB_PORT=5432
DB_NAME=med_qa_dev_db
DB_USER=postgres
DB_PASSWORD=postgres
LOG_LEVEL=info
EOF
        log_success "Файл .env.development создан"
    else
        log_info "Файл .env.development уже существует"
    fi
    
    # Создание .env.test если не существует
    if [ ! -f ".env.test" ]; then
        cat > .env.test << EOF
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=test
PORT=5000
HOST=${IP_ADDRESS:-localhost}
DOMAIN=${DOMAIN:-localhost}
DB_HOST=localhost
DB_PORT=5432
DB_NAME=med_qa_test_db
DB_USER=postgres
DB_PASSWORD=postgres
LOG_LEVEL=info
EOF
        log_success "Файл .env.test создан"
    else
        log_info "Файл .env.test уже существует"
    fi
    
    log_success "Переменные окружения настроены"
}

# Выполнение миграций и сидов
run_migrations_seeds() {
    log_info "Выполнение миграций и сидов..."
    
    cd "$INSTALL_DIR/server"
    
    # Установка sequelize-cli если не установлена
    if ! command -v npx &> /dev/null || ! npx sequelize-cli --version &> /dev/null; then
        log_info "Установка sequelize-cli..."
        npm install -g sequelize-cli
    fi
    
    # Экспорт переменных окружения для production
    export NODE_ENV=production
    export DB_HOST=localhost
    export DB_PORT=5432
    export DB_NAME=med_qa_prod_db
    export DB_USER=med_qa_user
    export DB_PASSWORD=K3nP5V9mN8xR2dW7qL4pY6tA1sZ3cU8f
    
    # Запуск миграций
    log_info "Запуск миграций..."
    npx sequelize-cli db:migrate --env production
    
    if [ $? -eq 0 ]; then
        log_success "Миграции выполнены"
    else
        log_error "Ошибка выполнения миграций"
        return 1
    fi
    
    # Загрузка сидов
    log_info "Загрузка сидов..."
    npx sequelize-cli db:seed:all --env production
    
    if [ $? -eq 0 ]; then
        log_success "Сиды загружены"
    else
        log_error "Ошибка загрузки сидов"
        return 1
    fi
    
    log_success "Миграции и сиды обработаны"
}

# Настройка systemd сервиса
setup_systemd_service() {
    log_info "Настройка systemd сервиса..."
    
    # Обновление конфигурации systemd с IP адресом и доменом
    if [ -n "$IP_ADDRESS" ]; then
        sed -i "s|Environment=HOST=localhost|Environment=HOST=$IP_ADDRESS|g" "$INSTALL_DIR/deployment/med-qa.service"
    fi
    
    if [ -n "$DOMAIN" ]; then
        sed -i "s|Environment=DOMAIN=localhost|Environment=DOMAIN=$DOMAIN|g" "$INSTALL_DIR/deployment/med-qa.service"
    fi
    
    # Копирование файла сервиса
    cp "$INSTALL_DIR/deployment/med-qa.service" /etc/systemd/system/
    
    # Перезагрузка systemd
    systemctl daemon-reload
    
    # Включение сервиса
    systemctl enable med-qa.service
    
    log_success "Systemd сервис настроен"
}

# Настройка Nginx
setup_nginx() {
    log_info "Настройка Nginx..."
    
    # Обновление конфигурации Nginx с IP адресом и доменом
    if [ -n "$DOMAIN" ]; then
        sed -i "s|server_name medsester.ru www.medsester.ru|server_name $DOMAIN www.$DOMAIN|g" "$INSTALL_DIR/deployment/nginx.conf"
    fi
    
    # Копирование конфигурации Nginx
    cp "$INSTALL_DIR/deployment/nginx.conf" /etc/nginx/sites-available/med-qa
    
    # Создание символической ссылки
    ln -sf /etc/nginx/sites-available/med-qa /etc/nginx/sites-enabled/
    
    # Удаление конфигурации по умолчанию, если существует
    if [ -f /etc/nginx/sites-enabled/default ]; then
        rm /etc/nginx/sites-enabled/default
    fi
    
    # Тестирование конфигурации
    nginx -t
    
    # Перезагрузка Nginx
    systemctl reload nginx
    
    log_success "Nginx настроен"
}

# Настройка SSL сертификата
setup_ssl() {
    if [ "$SSL_ENABLED" = true ] && [ -n "$DOMAIN" ]; then
        log_info "Настройка SSL сертификата для $DOMAIN..."
        
        # Проверка наличия certbot
        if command -v certbot &> /dev/null; then
            certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email "admin@$DOMAIN"
            log_success "SSL сертификат установлен для $DOMAIN"
        else
            log_error "Certbot не найден. Установите его для настройки SSL."
        fi
    elif [ "$SSL_ENABLED" = true ]; then
        log_warning "SSL включен, но не указан домен. Пропуск настройки SSL."
    fi
}

# Запуск приложения
start_application() {
    log_info "Запуск приложения..."
    
    # Запуск сервиса
    systemctl restart med-qa.service
    
    # Проверка статуса
    if systemctl is-active --quiet med-qa.service; then
        log_success "Приложение успешно запущено"
    else
        log_error "Ошибка запуска приложения. Проверьте статус: systemctl status med-qa.service"
    fi
}

# Основная функция
main() {
    log_info "Начало автоматизированного развертывания Medical Q&A Portal"
    
    check_root
    check_existing_install
    check_system_requirements
    update_system
    install_packages
    setup_database
    deploy_application
    setup_environment
    run_migrations_seeds
    setup_systemd_service
    setup_nginx
    setup_ssl
    start_application
    
    log_success "Автоматизированное развертывание завершено!"
    
    if [ -n "$DOMAIN" ]; then
        log_info "Приложение доступно по адресу: http://$DOMAIN"
        if [ "$SSL_ENABLED" = true ]; then
            log_info "Также доступно по адресу: https://$DOMAIN"
        fi
    elif [ -n "$IP_ADDRESS" ]; then
        log_info "Приложение доступно по адресу: http://$IP_ADDRESS"
    else
        log_info "Приложение доступно по адресу: http://ваш_IP_адрес"
    fi
    
    log_info "Логи развертывания сохранены в: $LOG_FILE"
}

# Запуск основной функции
main "$@"