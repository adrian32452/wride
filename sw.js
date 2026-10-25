/* W123 road book service worker — version 20261025171022 */
const V = 'w123-20261025171022', CORE = ["./", "index.html", "map-extra.json", "manifest.webmanifest", "icon-192.png", "icon-512.png", "img/anghiari-t.jpg", "img/aquileia-t.jpg", "img/arezzo-t.jpg", "img/belgrade-h.jpg", "img/belgrade-t.jpg", "img/biarritz-t.jpg", "img/bilbao-t.jpg", "img/bucharest-h.jpg", "img/bucharest-t.jpg", "img/burgos-h.jpg", "img/burgos-t.jpg", "img/carcassonne-h.jpg", "img/carcassonne-t.jpg", "img/chianti-h.jpg", "img/chianti-t.jpg", "img/chioggia-t.jpg.dl", "img/craiova-t.jpg", "img/drobeta-t.jpg", "img/esterel1-h.jpg", "img/esterel1-t.jpg", "img/esterel2-t.jpg", "img/eze-h.jpg", "img/eze-t.jpg", "img/florence-h.jpg", "img/florence-t.jpg", "img/getaria-h.jpg", "img/getaria-t.jpg", "img/golubac-t.jpg", "img/greve-t.jpg", "img/irongates-t.jpg", "img/kazan-h.jpg", "img/kazan-t.jpg", "img/lepenski-t.jpg", "img/ljubljana-t.jpg", "img/lucca-t.jpg", "img/madrid-t.jpg", "img/menton-t.jpg", "img/miramare-h.jpg", "img/miramare-t.jpg", "img/monaco-t.jpg", "img/pau-t.jpg", "img/pisa-h.jpg", "img/pisa-t.jpg", "img/pontdugard-t.jpg", "img/ravenna-h.jpg", "img/ravenna-t.jpg", "img/sanmarino-t.jpg", "img/sansebastian-t.jpg", "img/trabaria-h.jpg", "img/trabaria-t.jpg", "img/trieste-t.jpg", "img/urbania-t.jpg", "img/venice-h.jpg", "img/venice-t.jpg", "img/villefranche-t.jpg", "img/zagreb-h.jpg", "img/zagreb-t.jpg", "g/sprite-1.jpg", "g/sprite-11.jpg", "g/sprite-12.jpg", "g/sprite-13.jpg", "g/sprite-14.jpg", "g/sprite-15.jpg", "g/sprite-16.jpg", "g/sprite-2.jpg", "g/sprite-3.jpg", "g/sprite-4.jpg", "g/sprite-5.jpg", "g/sprite-6.jpg", "g/sprite-7.jpg", "g/sprite-8.jpg", "g/sprite-9.jpg"];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== 'w123-runtime').map(k => caches.delete(k)))).then(() => self.clients.claim())); });
const netFirst = async req => {
  try { const r = await fetch(req); if (r.ok) (await caches.open('w123-runtime')).put(req, r.clone()); return r; }
  catch (e) { const c = await caches.match(req, { ignoreSearch: true }); if (c) return c; if (req.mode === 'navigate') return caches.match('index.html'); throw e; }
};
const cacheFirst = async req => {
  const c = await caches.match(req); if (c) return c;
  const r = await fetch(req); if (r.ok || r.type === 'opaque') (await caches.open('w123-runtime')).put(req, r.clone()); return r;
};
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (u.origin === location.origin) {
    if (e.request.mode === 'navigate' || u.pathname.endsWith('/index.html') || u.pathname.includes('/data/')) e.respondWith(netFirst(e.request));
    else e.respondWith(cacheFirst(e.request));
  } else if (/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) e.respondWith(cacheFirst(e.request));
});
