self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // A minimal fetch listener is required by some browsers to trigger the PWA install prompt.
  // In a real offline-first PWA, you would implement caching logic here.
});
