import fs from 'node:fs';
import * as topo from 'topojson-client';
import { geoConicConformal, geoPath } from 'd3-geo';

const dir = new URL('.', import.meta.url).pathname;
const world = JSON.parse(fs.readFileSync(dir + 'node_modules/world-atlas/countries-50m.json', 'utf8'));
const trip = JSON.parse(fs.readFileSync(dir + 'trip.json', 'utf8'));

const W = 1200, H = 400;
const countries = topo.feature(world, world.objects.countries);

// Fit projection to the route plus a margin of context
const pts = trip.days.flatMap(d => d.stops.map(s => [s.lon, s.lat]));
const lons = pts.map(p => p[0]), lats = pts.map(p => p[1]);
const bbox = {
  type: 'Feature',
  geometry: { type: 'MultiPoint', coordinates: [
    [Math.min(...lons) - 1.6, Math.min(...lats) - 1.0],
    [Math.max(...lons) + 1.4, Math.max(...lats) + 1.3],
    [Math.min(...lons) - 1.6, Math.max(...lats) + 1.3],
    [Math.max(...lons) + 1.4, Math.min(...lats) - 1.4]
  ]}
};
const proj = geoConicConformal().parallels([40, 47]).rotate([-11, 0]).fitExtent([[10, 10], [W - 10, H - 10]], bbox);
proj.clipExtent([[0, 0], [W, H]]);
const path = geoPath(proj);
const r = n => Math.round(n * 10) / 10;
const shrink = d => d ? d.replace(/(\d+\.\d+)/g, m => String(Math.round(parseFloat(m) * 10) / 10)) : '';

const onRoute = new Set(['Spain','France','Monaco','Italy','San Marino','Slovenia','Croatia','Serbia','Romania']);
const shapes = [];
for (const f of countries.features) {
  const d = shrink(path(f));
  if (!d) continue;
  shapes.push({ n: f.properties.name, d, on: onRoute.has(f.properties.name) });
}

const P = (lon, lat) => { const p = proj([lon, lat]); return [r(p[0]), r(p[1])]; };

// route: one polyline per day, continuing from the previous day's end
const ROUTED = JSON.parse(fs.readFileSync(dir + 'routed.json', 'utf8'));
const ROUTEDM = JSON.parse(fs.readFileSync(dir + 'routed-modes.json', 'utf8'));
const MODESJ = JSON.parse(fs.readFileSync(dir + 'modes.json', 'utf8'));
let prev = null;
const days = trip.days.map(day => {
  const line = [];
  if (prev) line.push(prev);
  for (const s of day.stops) {
    if (s.t === 'visit') continue;
    const p = P(s.lon, s.lat);
    const last = line[line.length - 1];
    if (!last || last[0] !== p[0] || last[1] !== p[1]) line.push(p);
  }
  if (line.length) prev = line[line.length - 1];
  // road-following legs from route_roads.py (falls back to straight lines)
  const legs = (ROUTED[day.d] || []).map(mkLeg);
  const modes = {};
  for (const [mk, ls] of Object.entries(ROUTEDM[day.d] || {})) modes[mk] = ls.map(mkLeg);
  const mstops = {};
  for (const mk of ['fast', 'cine', 'safe']) {
    const v = MODESJ[day.d] && MODESJ[day.d][mk];
    if (!v || v.same) continue;
    mstops[mk] = v.stops.filter(x => typeof x !== 'string' && x.t !== 'via').map(x => ({ n: x.n, t: x.t, xy: P(x.lon, x.lat) }));
  }
  return { d: day.d, line, legs, modes, mstops, stops: day.stops.map(s => ({ ...s, xy: P(s.lon, s.lat) })) };
});
function mkLeg(l) {
  {
    const pts = []; let last = null;
    for (const [lon, lat] of l.coords) {
      const q = P(lon, lat);
      if (!last || Math.hypot(q[0] - last[0], q[1] - last[1]) >= 0.25) { pts.push(q); last = q; }
    }
    const end = P(...l.coords[l.coords.length - 1]);
    if (pts.length && (pts[pts.length - 1][0] !== end[0] || pts[pts.length - 1][1] !== end[1])) pts.push(end);
    const projPts = cs => { const o = []; let lq = null; for (const [lon, lat] of cs) { const q = P(lon, lat); if (!lq || Math.hypot(q[0] - lq[0], q[1] - lq[1]) >= 0.25) { o.push(q); lq = q; } } return o; };
    const meta = { from: l.from, to: l.to, km: l.km, mins: l.mins, roads: l.roads || [], mode: l.mode, mw: l.mw_share ?? null };
    if (l.alt && (Math.abs(l.alt.mins - l.mins) >= 10 || Math.abs((l.alt.mw_share || 0) - (l.mw_share || 0)) >= 0.3)) {
      meta.alt = { label: l.alt.label, km: l.alt.km, mins: l.alt.mins, roads: l.alt.roads, mw: l.alt.mw_share, pts: projPts(l.alt.coords) };
    }
    return { r: l.routed ? 1 : 0, pts, meta };
  }
}

const labels = [
  ['SPAIN', -3.2, 41.3, 'c'], ['FRANCE', 2.6, 46.2, 'c'], ['ITALY', 12.6, 42.7, 'c'],
  ['SLOVENIA', 14.8, 46.25, 'c'], ['CROATIA', 16.9, 45.35, 'c'], ['BOSNIA & HERZ.', 17.9, 44.15, 'c'],
  ['SERBIA', 20.9, 43.9, 'c'], ['ROMANIA', 24.6, 45.6, 'c'], ['HUNGARY', 19.3, 46.95, 'c'],
  ['SWITZERLAND', 8.1, 46.75, 'c'], ['AUSTRIA', 14.2, 47.3, 'c'], ['BULGARIA', 25.0, 43.15, 'c'],
  ['Bay of Biscay', -4.3, 44.6, 's'], ['Mediterranean Sea', 4.8, 42.2, 's'], ["Ligurian Sea", 8.7, 43.2, "s"],
  ['Adriatic Sea', 14.9, 43.3, 's'], ['Tyrrhenian Sea', 11.0, 41.3, 's']
].map(([t, lon, lat, k]) => ({ t, xy: P(lon, lat), k })).filter(l => l.xy[0] > 20 && l.xy[0] < W - 20 && l.xy[1] > 10 && l.xy[1] < H - 10);

fs.writeFileSync(dir + 'map.json', JSON.stringify({ W, H, shapes, days, labels }));
const size = fs.statSync(dir + 'map.json').size;
console.log('map.json', Math.round(size / 1024) + ' KB', 'shapes', shapes.length);

// ---------- context layers: roads, towns, rivers, lakes (Natural Earth 1:10m) ----------
const NE = dir + '../ne/';
const inv = proj.invert([0, 0]), inv2 = proj.invert([W, H]), inv3 = proj.invert([0, H]), inv4 = proj.invert([W, 0]);
const LON0 = Math.min(inv[0], inv3[0]) - 1, LON1 = Math.max(inv2[0], inv4[0]) + 1;
const LAT0 = Math.min(inv2[1], inv3[1]) - 1, LAT1 = Math.max(inv[1], inv4[1]) + 1;
const inBox = c => c[0] > LON0 && c[0] < LON1 && c[1] > LAT0 && c[1] < LAT1;
const anyIn = g => {
  const cs = g.type === 'LineString' ? g.coordinates : g.type === 'MultiLineString' ? g.coordinates.flat() :
    g.type === 'Polygon' ? g.coordinates.flat() : g.type === 'MultiPolygon' ? g.coordinates.flat(2) : [g.coordinates];
  return cs.some(inBox);
};
const pathD = f => shrink(path(f) || '');
// simplify a projected path string: drop points closer than tol to the previous kept point
function thin(d, tol) {
  return d.replace(/M[^M]+/g, seg => {
    const nums = seg.slice(1).split(/L/).map(p => p.split(',').map(Number));
    const out = [nums[0]];
    for (let i = 1; i < nums.length; i++) {
      const a = out[out.length - 1], b = nums[i];
      if (i === nums.length - 1 || Math.hypot(b[0] - a[0], b[1] - a[1]) >= tol) out.push(b);
    }
    if (out.length < 2) return '';
    return 'M' + out.map(p => p.join(',')).join('L');
  });
}
const roads = JSON.parse(fs.readFileSync(NE + 'ne_10m_roads.geojson', 'utf8'));
import('d3-geo').then(() => {});
const { geoContains, geoBounds } = await import('d3-geo');
const cfeat = countries.features.filter(f => { const b = geoBounds(f); return b[1][0] > LON0 && b[0][0] < LON1 && b[1][1] > LAT0 && b[0][1] < LAT1; })
  .map(f => ({ f, b: geoBounds(f) }));
const countryOf = c => { for (const { f, b } of cfeat) { if (c[0] >= b[0][0] && c[0] <= b[1][0] && c[1] >= b[0][1] && c[1] <= b[1][1] && geoContains(f, c)) return f.properties.name; } return null; };
const PFX = { Romania: 'DN', Serbia: 'State road ', Croatia: 'D', Slovenia: 'G', Italy: 'SS', France: 'N', Spain: 'N-' };
const rname = (p, cc) => {
  const parts = [p.local || p.label2, p.label].filter(Boolean).map(x => {
    if (/^\d+[A-Z]?$/.test(x)) return (PFX[cc] || '') + x;
    if (cc === 'Italy' && /^S\d+$/.test(x)) return 'SS' + x.slice(1);
    return x;
  });
  return [...new Set(parts)].join(' · ') || null;
};
const groups = new Map();
const cls = { motorway: [], main: [], minor: [], ferry: [] };
for (const f of roads.features) {
  if (!f.geometry || !anyIn(f.geometry)) continue;
  const p = f.properties, t = p.type || '';
  const k = t.startsWith('Ferry') ? 'ferry' : (p.expressway === 1 || t === 'Major Highway' || t === 'Beltway') ? 'motorway' : t === 'Secondary Highway' ? 'main' : 'minor';
  const d = thin(pathD(f), k === 'minor' ? 0.6 : 0.35);
  if (!d) continue;
  cls[k].push(d);
  const cs = f.geometry.type === 'LineString' ? f.geometry.coordinates : f.geometry.coordinates.flat();
  const mid = cs[Math.floor(cs.length / 2)];
  const cc = countryOf(mid);
  const n = k === 'ferry' ? (p.name || 'Ferry route') : rname(p, cc);
  const gk = `${n}|${k}|${cc}`;
  if (!groups.has(gk)) groups.set(gk, { n, c: k, cc, d: [] });
  groups.get(gk).d.push(d);
}
const roadGroups = [...groups.values()].map(g => ({ ...g, d: g.d.join('') }));
const roadsOut = Object.fromEntries(Object.entries(cls).map(([k, v]) => [k, v.join('')]));
const rivers = JSON.parse(fs.readFileSync(NE + 'ne_10m_rivers_lake_centerlines.geojson', 'utf8'));
const riv = [];
for (const f of rivers.features) {
  if (!f.geometry || !anyIn(f.geometry) || (f.properties.scalerank ?? 9) > 7) continue;
  const d = thin(pathD(f), 0.5); if (d) riv.push(d);
}
const lakes = JSON.parse(fs.readFileSync(NE + 'ne_10m_lakes.geojson', 'utf8'));
const lak = [];
for (const f of lakes.features) {
  if (!f.geometry || !anyIn(f.geometry) || (f.properties.scalerank ?? 9) > 6) continue;
  const d = pathD(f); if (d) lak.push(d);
}
const { createRequire } = await import('node:module');
const req = createRequire(import.meta.url);
const allCities = req('all-the-cities');
const towns = [];
const CAPS = new Set(['Madrid','Paris','Rome','Monaco','San Marino','Vatican City','Ljubljana','Zagreb','Belgrade','Bucharest','Sarajevo','Budapest','Vienna','Bern','Podgorica','Tirana','Skopje','Sofia','Andorra la Vella','Pristina','Chisinau','Bratislava']);
for (const c of allCities) {
  const pop = c.population || 0;
  if (pop < 10000) continue;
  const [lon, lat] = c.loc.coordinates;
  if (!inBox([lon, lat])) continue;
  const xy = P(lon, lat);
  if (xy[0] < 0 || xy[0] > W || xy[1] < 0 || xy[1] > H) continue;
  const cap = CAPS.has(c.name) && /PPLC/.test(c.featureCode) ? 1 : 0;
  const tier = (cap || pop >= 500000) ? 1 : pop >= 120000 ? 2 : pop >= 40000 ? 3 : 4;
  towns.push({ n: c.name, xy, t: tier, cap, pop });
}
// drop near-duplicates (same name within 3 units)
towns.sort((a, b) => a.t - b.t || b.pop - a.pop);
for (const t of towns) delete t.pop;
const extra = { roadGroups, rivers: riv.join(''), lakes: lak.join(''), towns };
fs.writeFileSync(dir + '../out/map-extra.json', JSON.stringify(extra));
console.log('map-extra.json', Math.round(fs.statSync(dir + '../out/map-extra.json').size / 1024) + ' KB',
  Object.fromEntries(Object.entries(cls).map(([k, v]) => [k, v.length])), 'rivers', riv.length, 'lakes', lak.length, 'towns', towns.length,
  'tiers', [1,2,3,4,5].map(t => towns.filter(x => x.t === t).length));
