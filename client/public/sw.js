const CACHE_NAME = 'ha-agriculture-v1';

// عند التثبيت
self.addEventListener('install', () => {
  self.skipWaiting();
});

// عند التفعيل — امسح الـ cache القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

// لا نحفظ أي شيء في الـ cache — كل طلب يذهب للشبكة مباشرة
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
