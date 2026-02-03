// Используем имя кэша с версией для управления обновлениями
const CACHE_NAME = 'med-qa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/index.css',
  '/assets/index.js',
  '/logo.png',
  '/favicon.ico',
  '/favicon.svg'
];

// Установка сервис-воркера и кэширование ресурсов
self.addEventListener('install', (event) => {
  // Задерживаем установку до завершения кэширования ресурсов
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Открыт кэш');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Ошибка кэширования ресурсов:', error);
      })
  );
});

// Обработка сетевых запросов
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Возвращаем кэшированный ресурс или делаем сетевой запрос
        return response || fetch(event.request);
      })
      .catch(() => {
        // В случае ошибки возвращаем запасной вариант (например, для изображений)
        if (event.request.url.endsWith('.png') || event.request.url.endsWith('.jpg') || event.request.url.endsWith('.jpeg')) {
          return caches.match('/logo.png');
        }
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