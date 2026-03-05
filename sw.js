const CACHE_NAME = 'lunalnk-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Instalar el Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activar el Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar las solicitudes
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si la respuesta está en caché, devolverla
        if (response) {
          return response;
        }
        
        // Si no, hacer la solicitud a la red
        return fetch(event.request).then(response => {
          // Verificar si es una respuesta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clonar la respuesta
          const responseToCache = response.clone();
          
          // Agregar a caché
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
      .catch(() => {
        // Si ambas fallan, devolver una página offline
        return caches.match('./index.html');
      })
  );
});
