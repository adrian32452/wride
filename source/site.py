"""Build the GitHub Pages home-screen app (PWA) into /home/claude/wride from out/route-book.html."""
import json, os, shutil, time, glob
from PIL import Image, ImageDraw, ImageFont

S = os.path.dirname(os.path.abspath(__file__))
OUT, SITE = f"{S}/out", "/home/claude/wride"
VER = time.strftime("%Y%m%d%H%M%S")

page = open(f"{OUT}/route-book.html", encoding="utf-8").read()
head = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#1b2530">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="W123 Run">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon-192.png">
<link rel="apple-touch-icon" href="icon-192.png">
</head>
<body>
"""
tail = """
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}
</script>
</body>
</html>
"""
os.makedirs(SITE, exist_ok=True)
open(f"{SITE}/index.html", "w", encoding="utf-8").write(head + page + tail)

# V2 (redesign) next to V1, sharing images, data and the service worker
os.makedirs(f"{SITE}/v2", exist_ok=True)
v2 = open(f"{OUT}/v2/index.html", encoding="utf-8").read()
head2 = head.replace('href="manifest.webmanifest"', 'href="manifest.webmanifest"').replace('href="icon-192.png"', 'href="../icon-192.png"').replace('content="W123 Run"', 'content="W123 Run 2"')
tail2 = tail.replace("register('sw.js')", "register('../sw.js', { scope: '../' })")
open(f"{SITE}/v2/index.html", "w", encoding="utf-8").write(head2 + v2 + tail2)
json.dump({"name": "W123 Run (V2)", "short_name": "W123 Run 2", "start_url": "./", "scope": "./", "display": "standalone",
           "background_color": "#dfe2e1", "theme_color": "#22272b",
           "icons": [{"src": "../icon-192.png", "sizes": "192x192", "type": "image/png"}, {"src": "../icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"}]},
          open(f"{SITE}/v2/manifest.webmanifest", "w"), ensure_ascii=False, indent=1)

# static files
shutil.copy(f"{OUT}/map-extra.json", f"{SITE}/map-extra.json")
for d in ("img", "g"):
    if os.path.isdir(f"{SITE}/{d}"): shutil.rmtree(f"{SITE}/{d}")
shutil.copytree(f"{OUT}/img", f"{SITE}/img")
gfiles = json.load(open(f"{OUT}/gfiles.json"))
for f in gfiles:
    os.makedirs(os.path.dirname(f"{SITE}/{f}"), exist_ok=True)
    shutil.copy(f"{OUT}/{f}", f"{SITE}/{f}")

# icons
def icon(n):
    im = Image.new("RGB", (n, n), (27, 37, 48)); dr = ImageDraw.Draw(im)
    r = n * 0.36; c = n / 2
    dr.ellipse([c - r, c - r - n * 0.06, c + r, c + r - n * 0.06], outline=(210, 60, 50), width=max(2, n // 28))
    try: f = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", int(n * 0.2))
    except Exception: f = ImageFont.load_default()
    t = "W123"; w = dr.textlength(t, font=f)
    dr.text((c - w / 2, c - n * 0.17), t, fill=(237, 240, 241), font=f)
    f2 = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", int(n * 0.085)) if os.path.exists("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf") else f
    t2 = "MAD → BUC"; w2 = dr.textlength(t2, font=f2)
    dr.text((c - w2 / 2, c + n * 0.2), t2, fill=(200, 205, 210), font=f2)
    im.save(f"{SITE}/icon-{n}.png")
for n in (192, 512): icon(n)

json.dump({"name": "W123 Madrid–Bucharest Run", "short_name": "W123 Run", "start_url": "./", "scope": "./",
           "display": "standalone", "background_color": "#edf0f1", "theme_color": "#1b2530",
           "icons": [{"src": "icon-192.png", "sizes": "192x192", "type": "image/png"},
                     {"src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"}]},
          open(f"{SITE}/manifest.webmanifest", "w"), ensure_ascii=False, indent=1)

# offline: core files precached on install; gallery photos cached the first time they are viewed
core = ["./", "index.html", "v2/", "v2/index.html", "v2/manifest.webmanifest", "map-extra.json", "manifest.webmanifest", "icon-192.png", "icon-512.png"] + \
       sorted("img/" + f for f in os.listdir(f"{SITE}/img")) + sorted(f for f in gfiles if "/sprite-" in f)
sw = f"""/* W123 road book service worker — version {VER} */
const V = 'w123-{VER}', CORE = {json.dumps(core)};
self.addEventListener('install', e => {{ e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); }});
self.addEventListener('activate', e => {{ e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== 'w123-runtime').map(k => caches.delete(k)))).then(() => self.clients.claim())); }});
const netFirst = async req => {{
  try {{ const r = await fetch(req); if (r.ok) (await caches.open('w123-runtime')).put(req, r.clone()); return r; }}
  catch (e) {{ const c = await caches.match(req, {{ ignoreSearch: true }}); if (c) return c; if (req.mode === 'navigate') return caches.match('index.html'); throw e; }}
}};
const cacheFirst = async req => {{
  const c = await caches.match(req); if (c) return c;
  const r = await fetch(req); if (r.ok || r.type === 'opaque') (await caches.open('w123-runtime')).put(req, r.clone()); return r;
}};
self.addEventListener('fetch', e => {{
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (u.origin === location.origin) {{
    if (e.request.mode === 'navigate' || u.pathname.endsWith('/index.html') || u.pathname.includes('/data/')) e.respondWith(netFirst(e.request));
    else e.respondWith(cacheFirst(e.request));
  }} else if (/fonts\\.(googleapis|gstatic)\\.com$/.test(u.hostname)) e.respondWith(cacheFirst(e.request));
}});
"""
open(f"{SITE}/sw.js", "w").write(sw)

# data the scheduled checks publish (bulletins/, weather/); keep what is there
for k in ("bulletins", "weather"):
    os.makedirs(f"{SITE}/data/{k}", exist_ok=True)
    keep = f"{SITE}/data/{k}/.keep"
    if not os.path.exists(keep): open(keep, "w").write("")
for f in glob.glob(f"{S}/seed/wx-d*.json"):
    dst = f"{SITE}/data/weather/{os.path.basename(f)[3:]}"
    if not os.path.exists(dst): shutil.copy(f, dst)

open(f"{SITE}/robots.txt", "w").write("User-agent: *\nDisallow: /\n")
open(f"{SITE}/.nojekyll", "w").write("")
open(f"{SITE}/README.md", "w").write("# W123 road book\n\nHome-screen version of the Madrid–Bucharest road book (December 2026).\nBuilt and updated by Claude; `data/` is written by the scheduled weather and news checks.\n")
tot = sum(os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(SITE) if ".git" not in dp for f in fs)
print("site built", VER, "files:", sum(len(fs) for dp, _, fs in os.walk(SITE) if ".git" not in dp), f"{tot/1e6:.1f} MB", "precache:", len(core))
