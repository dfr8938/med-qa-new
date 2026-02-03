#!/bin/bash

# Скрипт развертывания приложения Medical Q&A Portal на VPS сервере

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка прав администратора
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}[-] Этот скрипт не должен запускаться от имени root${NC}" 1>&2
   exit 1
fi

# Проверка наличия необходимых утилит
command -v git >/dev/null 2>&1 || { echo -e "${RED}[-] Требуется git, но он не установлен.${NC}" >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo -e "${RED}[-] Требуется Node.js, но он не установлен.${NC}" >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}[-] Требуется npm, но он не установлен.${NC}" >&2; exit 1; }

echo -e "${GREEN}[+] Начало развертывания Medical Q&A Portal${NC}"

# Создание директории для приложения, если она не существует
if [ ! -d "/opt/med-qa-portal" ]; then
    echo -e "${YELLOW}[!] Директория /opt/med-qa-portal не найдена, создаем...${NC}"
    sudo mkdir -p /opt/med-qa-portal
    sudo chown $USER:$USER /opt/med-qa-portal
fi

# Переход в директорию приложения
cd /opt/med-qa-portal

# Клонирование репозитория (если это первый запуск)
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}[!] Клонирование репозитория...${NC}"
    git clone https://github.com/your-repo/med-qa-portal.git .
else
    echo -e "${GREEN}[+] Обновление репозитория${NC}"
    git pull origin main
fi

# Установка зависимостей для сервера
echo -e "${GREEN}[+] Установка зависимостей сервера${NC}"
cd server
npm install --production

# Установка зависимостей для клиента
echo -e "${GREEN}[+] Установка зависимостей клиента${NC}"
cd ../client
npm install

# Создание production сборки
echo -e "${GREEN}[+] Создание production сборки${NC}"
npm run build

# Возврат в корневую директорию
cd ..

# Настройка systemd сервиса
echo -e "${GREEN}[+] Настройка systemd сервиса${NC}"
sudo cp deployment/med-qa.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable med-qa.service

# Настройка Nginx
echo -e "${GREEN}[+] Настройка Nginx${NC}"
sudo cp deployment/nginx.conf /etc/nginx/sites-available/med-qa
sudo ln -sf /etc/nginx/sites-available/med-qa /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Запуск сервиса
echo -e "${GREEN}[+] Запуск сервиса${NC}"
sudo systemctl restart med-qa.service

echo -e "${GREEN}[+] Развертывание завершено успешно!${NC}"
echo -e "${YELLOW}[!] Проверьте статус сервиса: sudo systemctl status med-qa.service${NC}"