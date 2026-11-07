// Service Worker: hält die App offline verfügbar. Daten liegen in IndexedDB, nicht hier.
const CACHE = "kb-2026.11.07-2212";
const SHELL = ["./", "index.html", "manifest.webmanifest", "anleitung.html", "vendor/pdf.min.js", "vendor/pdf.worker.min.js", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png", "icons/favicon.ico"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (u.origin === location.origin){
    // App-Dateien: zuerst Netz (für Updates), sonst Cache
    e.respondWith(fetch(e.request).then(r => { if (r.ok){ const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } return r; }).catch(() => caches.match(e.request, {ignoreSearch: true}).then(r => r || caches.match("index.html"))));
  } else if (/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(x => { const c = x.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); return x; })));
  }
});
