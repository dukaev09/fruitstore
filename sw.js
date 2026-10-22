const C = 'fruit-v3';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || !/^https?:$/.test(u.protocol) || /firestore\.googleapis|identitytoolkit|securetoken|google\.com\/(v1|identitytoolkit)/.test(u.hostname + u.pathname)) return;
  const cacheable = u.origin === location.origin || /gstatic|googleapis/.test(u.hostname);
  e.respondWith(caches.open(C).then(c => new Promise(res => {
    let done = false;
    const finish = x => { if (!done && x) { done = true; res(x); } };
    // при слабой связи через 3 секунды отдаём копию из кэша, не заставляя ждать
    const t = setTimeout(() => c.match(r).then(finish), 3000);
    fetch(r).then(x => { clearTimeout(t); if (x.ok && cacheable) c.put(r, x.clone()); finish(x); })
      .catch(() => { clearTimeout(t); c.match(r).then(m => { if (m) finish(m); else if (!done) { done = true; res(Response.error()); } }); });
  })));
});
