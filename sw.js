const C = 'fruit-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || /firestore\.googleapis|identitytoolkit|securetoken/.test(u.hostname)) return;
  e.respondWith(caches.open(C).then(c => fetch(r).then(res => {
    if (res.ok && (u.origin === location.origin || /gstatic|googleapis/.test(u.hostname))) c.put(r, res.clone());
    return res;
  }).catch(() => c.match(r).then(m => m || (r.mode === 'navigate' ? c.match('/') : undefined)))));
});
