/* Service worker de English Review. build.py reemplaza f86b32d3f2 y ["./", "index.html", "manifest.webmanifest", "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "sync.js", "firebase-config.js"]. */
const V = 'er-f86b32d3f2';
const CORE = ["./", "index.html", "manifest.webmanifest", "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "sync.js", "firebase-config.js"];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => /^er-[0-9a-f]+$/.test(k) && k !== V).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'skip') self.skipWaiting(); });

async function trim(cache, max){ const ks = await cache.keys(); for (let i = 0; i < ks.length - max; i++) await cache.delete(ks[i]); }
async function staleWhileRevalidate(req, name){
  const cache = await caches.open(name);
  const hit = await cache.match(req);
  const net = fetch(req).then(res => { if (res.ok || res.type === 'opaque') cache.put(req, res.clone()); return res; }).catch(() => hit);
  return hit || net;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // la app: primero la caché (funciona sin internet); las navegaciones siempre sirven index.html
  if (url.origin === self.location.origin) {
    if (req.mode === 'navigate') {
      e.respondWith(caches.match('index.html').then(hit => hit || fetch(req)));
      return;
    }
    e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
    return;
  }
  // fuentes y SDK de Firebase: rápido desde caché y se actualiza en segundo plano
  if (/^(fonts\.googleapis\.com|fonts\.gstatic\.com|www\.gstatic\.com)$/.test(url.host)) {
    e.respondWith(staleWhileRevalidate(req, 'er-ext'));
    return;
  }
  // fotos de Wikimedia: caché limitada a 400 imágenes
  if (url.host === 'upload.wikimedia.org') {
    e.respondWith(caches.open('er-img').then(async cache => {
      const hit = await cache.match(req); if (hit) return hit;
      try { const res = await fetch(req); if (res.ok || res.type === 'opaque') { cache.put(req, res.clone()); trim(cache, 400); } return res; }
      catch (err) { return Response.error(); }
    }));
  }
});
