// App shell cache so the buyer app opens instantly and works on weak open-home signal.
const CACHE = 'buyer-app-v1';
const SHELL = ['./Lead%20Gen%20App.dc.html?app=buyer', './support.js', './services.js', './icon-512.png', './manifest.webmanifest'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request)));
});
// TODO (developer): push notifications for "report ready" / "offer from broker" via self.addEventListener('push', ...)
