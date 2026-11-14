const CACHE = "lanternsea-0.8.4";
const FILES = ["./", "index.html", "style.css?v=0.8.4", "telemetri.js?v=0.8.4", "cards.js?v=0.8.4", "engine.js?v=0.8.4", "art.js?v=0.8.4", "voyage.js?v=0.8.4", "app.js?v=0.8.4", "icon.svg", "icon-192.png", "manifest.webmanifest"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request)));
});
