// Используем имя кэша с версией для управления обновлениями
const CACHE_NAME = 'med-qa-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './assets/index.css',
  './assets/index.js',
  './logo.png',
  './favicon.ico',
  './favicon.svg'
];

// Установка сервис-воркера и кэширование ресурсов
self.addEventListener('install', (event) => {
  // Задерживаем установку до завершения кэширования ресурсов
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Открыт кэш');
        // Добавляем каждый URL по отдельности для лучшей обработки ошибок
        const cachePromises = urlsToCache.map(url => {
          return fetch(url)
            .then(response => {
              if (!response.ok) {
                throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
              }
              return cache.put(url, response);
            })
            .catch(error => {
              console.warn(`Не удалось закэшировать ${url}:`, error);
              // Продолжаем работу даже если не удалось закэшировать некоторые ресурсы
              return Promise.resolve();
            });
        });
        return Promise.all(cachePromises);
      })
      .catch((error) => {
        console.error('Ошибка открытия кэша:', error);
      })
  );
});

// Обработка сетевых запросов
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Возвращаем кэшированный ресурс или делаем сетевой запрос
        return response || fetch(event.request).catch(() => {
          // В случае ошибки возвращаем запасной вариант (например, для изображений)
          if (event.request.url.endsWith('.png') || event.request.url.endsWith('.jpg') || event.request.url.endsWith('.jpeg')) {
            return caches.match('./logo.png');
          }
        });
      })
  );
});

// Активация сервис-воркера и очистка старых кэшей
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Удаляем старые кэши, не входящие в белый список
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});