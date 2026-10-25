# Source of the W123 road book

Everything needed to rebuild the road book (the Claude artifact and this site).
Work in a copy of this folder (the scripts expect this layout: `mapdata/`, `i18n/`, `out/`, `ne/`).

1. `gunzip -k ne/*.gz` — Natural Earth 10m data (roads, countries, rivers, lakes, towns).
2. `cd mapdata && python3 modes.py` — route styles (fastest, cinematic, safe) and weather watch points → `modes.json`.
3. `python3 route_roads.py` — routes every leg on the road network → `mapdata/routed*.json`.
4. `python3 plan.py` — timed plan, sunrise/sunset, daylight checks → `plan.json`.
5. `cd mapdata && npm ci && node build-map.mjs` — map projection → `map.json`, `out/map-extra.json`.
6. `python3 i18n/merge.py` — translations (`i18n/src*/<lang>.txt`, lines `index<TAB>text`, indices from `i18n/master.json`).
7. `python3 build.py` — builds `out/route-book.html` (needs the photos in `out/img` and `out/g`; copy them from the site root `img/` and `g/`).
8. `python3 site.py` — builds this site (home-screen app) from `out/route-book.html`.

`seed/` holds the route summaries written to the artifact database (`route/dNN`); `prompts/` the scheduled weather check and news bulletin.
Claude artifact: https://claude.ai/artifact/7mouWSdAzZUVw8G9ofJH8J

9. `python3 build_v2.py` — builds V2 (`v2/shell.html` + `v2/lib.js` + `v2/app.js`) into `out/v2/index.html`; `site.py` then also writes the site's `v2/`.
