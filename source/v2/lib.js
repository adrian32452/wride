/* ---- from V1 lines 792-809 ---- */
const MAP = /*MAPDATA*/null;
const DAYS = MAP.days;
const TRIP = /*TRIPDATA*/null;
const PHOTOS = /*PHOTODATA*/{};
const GAL = /*GALDATA*/{};
const PARK = /*PARKDATA*/{};
const PLAN = /*PLANDATA*/{};
const I18N = /*I18NDATA*/{};
const LANGS = [['en', 'English'], ['es', 'Español'], ['fr', 'Français'], ['it', 'Italiano'], ['sl', 'Slovenščina'], ['hr', 'Hrvatski'], ['sr', 'Srpski'], ['ro', 'Română']];
const LOCALE = { en: 'en-GB', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', sl: 'sl-SI', hr: 'hr-HR', sr: 'sr-Latn-RS', ro: 'ro-RO' };
let LANG = 'en';
try { const h = (location.hash.match(/lang=([a-z]{2})/) || [])[1]; const st = localStorage.getItem('w123-lang'); LANG = h || st || 'en'; } catch (e) { const h = (location.hash.match(/lang=([a-z]{2})/) || [])[1]; if (h) LANG = h; }
if (!LOCALE[LANG]) LANG = 'en';
const DICT = I18N[LANG] || {};
const T = (str, ...a) => { if (str == null) return str; let r = DICT[str]; if (r == null) r = str; return a.length ? r.replace(/\{(\d)\}/g, (_, i) => a[i]) : r; };
const fmtDate = iso => { try { return new Intl.DateTimeFormat(LOCALE[LANG], { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(iso + 'T12:00:00Z')); } catch (e) { return iso; } };
document.documentElement.lang = LANG === 'sr' ? 'sr-Latn' : LANG;
/* static text: each block is looked up by its English HTML */
/* ---- from V1 lines 838-871 ---- */
const commons = f => 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(f);

const NS = 'http://www.w3.org/2000/svg';
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));


/* ---------- route modes: fastest / balanced / cinematic ---------- */
const MODESD = /*MODEDATA*/{};
const MK = ['fast', 'bal', 'cine', 'safe'];
const MODE_NAME = { fast: 'Fastest', bal: 'Balanced', cine: 'Cinematic', safe: 'Safe' };
const variant = (d, m) => m === 'bal' ? null : (MODESD[d] && MODESD[d][m] && !MODESD[d][m].same ? MODESD[d][m] : null);
const hasMode = (d, m) => m === 'bal' || !!variant(d, m);
const balModes = d => MK.filter(m => !variant(d, m));
const groupsOf = d => [{ m: 'bal', ms: balModes(d).join(' ') }].concat(['fast', 'cine', 'safe'].filter(m => variant(d, m)).map(m => ({ m, ms: m })));
let MODE = { global: 'bal', days: {} };
try { const sv = JSON.parse(localStorage.getItem('w123-mode') || 'null'); if (sv && MK.includes(sv.global)) MODE = { global: sv.global, days: sv.days || {} }; } catch (e) {}
const modeOf = d => { const m = MODE.days[d] || MODE.global; return MK.includes(m) ? m : 'bal'; };
const planFor = (d, m) => { const P = PLAN[d]; if (!P) return null; return m !== 'bal' && P.modes && P.modes[m] ? P.modes[m] : P; };
const legsFor = (d, m) => { const D = DAYS.find(x => x.d === d); if (!D) return []; return m !== 'bal' && D.modes && D.modes[m] ? D.modes[m] : D.legs; };
const pm = s => { const [h, mi] = String(s).split(':').map(Number); return h * 60 + mi; };
const durMin = P => P ? P.rows.filter(r => r.k === 'drive').reduce((a, r) => a + r.min, 0) : 0;
const fmtDur = m => `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`;
const lastArr = P => { const r = P ? P.rows.filter(x => x.k === 'drive') : []; return r.length ? r[r.length - 1].arr : (P ? P.end : ''); };
function stopsFor(day, m) {
  const v = variant(day.d, m); if (!v) return day.stops;
  const here = Object.fromEntries(day.stops.map(s => [s.n, s]));
  const out = [];
  for (const it of v.stops) {
    if (typeof it === 'string') { const n = it.split('|')[0]; if (here[n]) out.push(v.notes && v.notes[n] ? { ...here[n], note: v.notes[n] } : here[n]); }
    else out.push(it);
  }
  return out;
}
const stopModes = (dnum, name) => MK.filter(m => { const v = variant(dnum, m); return !v || v.stops.some(it => typeof it === 'string' && it.split('|')[0] === name); }).join(' ');
/* ---- from V1 lines 1460-1479 ---- */
const KIND = { park: ['P', 'Parking'], ride: ['P+R', 'Park and ride'], pull: ['★', 'Stop on the road'] };
const durTxt = min => min >= 60 ? Math.floor(min / 60) + 'h' + String(min % 60).padStart(2, '0') : min + ' min';
const mapsQ = q => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
/* Waze: open the installed app directly on phones and tablets; the web link stays as the fallback */
const UA = navigator.userAgent || '';
const IS_ANDROID = /Android/i.test(UA);
const IS_IOS = /iPhone|iPad|iPod/i.test(UA) || (/Macintosh/.test(UA) && navigator.maxTouchPoints > 1);
function wazeLink(params) {
  const web = 'https://waze.com/ul?' + params + '&navigate=yes';
  if (IS_ANDROID) return `intent://?${params}&navigate=yes#Intent;scheme=waze;package=com.waze;S.browser_fallback_url=${encodeURIComponent(web)};end`;
  if (IS_IOS) return 'waze://?' + params + '&navigate=yes';
  return web;
}
const wazeQ = q => wazeLink('q=' + encodeURIComponent(q));
const wazeLL = (lat, lon) => wazeLink(`ll=${lat},${lon}`);
const wazeWeb = (lat, lon) => `https://waze.com/ul?ll=${lat},${lon}&navigate=yes`;
const LT = { predawn: ['Before sunrise', ''], dusk: ['After sunset', ''], afterdark: ['In the dark', ''], golden: ['Golden hour', 'g'],
  glare_east: ['Low sun ahead', ''], glare_west: ['Low sun ahead', ''], scenic_dark: ['Scenic road in poor light', 'w'], minor_dark: ['Not a motorway, after dark', 'w'] };
const KINDT = { mw: 'Motorway', main: 'Main road', scenic: 'Scenic road' };
const lightTags = r => `<span class="lt">${T(KINDT[r.kind] || 'Road')}</span>` + (r.light || []).filter((c, i, a) => a.indexOf(c) === i && LT[c]).map(c => `<span class="lt ${LT[c][1]}">${T(LT[c][0])}</span>`).join('');
/* ---- from V1 lines 1502-1525 ---- */
function shiftPlan(P, off) {
  if (!P || !off) return P;
  const tzs = P.riseTz !== P.setTz ? -60 : 0, rise = pm(P.sunrise), set = pm(P.sunset), dusk = pm(P.dusk);
  let after = false;
  const S = t => t ? hhmm(pm(t) + off) : t;
  const rows = P.rows.map(r => {
    if (r.k === 'tz') { after = true; return { ...r, t: S(r.t) }; }
    const x = { ...r, t: S(r.t), arr: S(r.arr), end: S(r.end) };
    if (r.k === 'drive') {
      // compare on the end-of-day clock (day 15: rows before the border are one hour behind)
      const a = pm(x.t) + (after ? 0 : -tzs), b = pm(x.arr) + (after ? 0 : -tzs), rr = rise - tzs;
      const keep = (r.light || []).filter(c => c === 'glare_east' || c === 'glare_west');
      if (a < rr) keep.push('predawn');
      if (b > set) keep.push(b > dusk ? 'afterdark' : 'dusk');
      if (r.kind === 'scenic' && (a < rr + 15 || b > set - 15)) keep.push('scenic_dark');
      if (r.kind !== 'mw' && (a < rr - 5 || b > dusk)) keep.push('minor_dark');
      if (r.kind === 'scenic' && b > set - 75 && a < set && !keep.includes('scenic_dark')) keep.push('golden');
      x.light = keep;
    }
    return x;
  });
  const warn = [...new Set(rows.flatMap(r => (r.light || []).filter(c => c === 'scenic_dark' || c === 'minor_dark')))];
  return { ...P, rows, start: S(P.start), end: S(P.end), warn, shifted: off };
}
/* ---- from V1 lines 1621-1627 ---- */
const PLATE = { 'ES-A': 'blue', 'ES-AP': 'blue', 'ES-N': 'red', 'FR-A': 'red', 'FR-D': 'yellow', 'FR-M': 'yellow',
  'IT-A': 'green', 'IT-E': 'green', 'IT-SS': 'blue', 'IT-SR': 'blue', 'IT-SP': 'blue',
  'SI-A': 'green', 'HR-A': 'green', 'RS-A': 'green', 'RS-M': 'white', 'RO-DN': 'red', 'RO-A': 'green' };
const TAG = { start: 'Start', stop: 'Stop', road: 'On the road', sleep: 'Overnight', visit: 'Visit, no car', end: 'Finish' };
const warnIcon = `<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1 L11.5 11 L.5 11 Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><rect x="5.3" y="4.4" width="1.4" height="3.6" fill="currentColor"/><rect x="5.3" y="8.8" width="1.4" height="1.3" fill="currentColor"/></svg>`;
const prevEndOf = {};
{ let pe = null; for (const day of TRIP.days) { prevEndOf[day.d] = pe; const v = day.stops.filter(s => s.t !== 'visit'); if (v.length) pe = v[v.length - 1]; } }
/* ---- from V1 lines 1690-1695 ---- */
const MODE_DESC = { fast: 'Motorways wherever possible. Same start time and stops; you arrive earlier.',
  bal: 'Scenic roads where they are worth it, motorway on the dull stretches.',
  cine: 'The most scenic roads open in winter, fitted to daylight. Up to 1.5 h longer.',
  safe: 'For bad weather: low roads and motorways, no passes, cliff roads or fog-prone minor roads. Same overnight towns.' };
const totalFor = m => TRIP.days.reduce((a, d) => a + durMin(planFor(d.d, hasMode(d.d, m) ? m : 'bal')), 0);
let canSaveShared = false, dbRef = null, BUL = {}, BUL_STATE = 'loading';
/* ---- from V1 lines 1747-1767 ---- */
const BCAT = { road: 'Road', closure: 'Closure', works: 'Roadworks', strike: 'Strike', protest: 'Protest', restriction: 'Restriction', border: 'Border', weather: 'Weather', event: 'Event', fuel: 'Fuel', traffic: 'Traffic' };
const safeUrl = u => /^https?:\/\//i.test(String(u || '')) ? esc(u) : '';
const fmtIssued = iso => { try { return new Intl.DateTimeFormat(LOCALE[LANG], { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)); } catch (e) { return esc(iso || ''); } };
const tripDayNow = () => Math.floor((Date.now() - new Date('2026-12-19T00:00:00').getTime()) / 864e5) + 1;
function bulDayHtml(d, withLink) {
  const b = BUL[d], day = TRIP.days[d - 1];
  const items = Array.isArray(b.items) ? b.items : [], wx = Array.isArray(b.weather) ? b.weather : [];
  return `<div class="bul-day"><div class="bul-head"><b>${T('Day {0}', d)} · ${fmtDate(PLAN[d].date)} · ${esc(T(day.from))} → ${esc(T(day.to))}</b>` +
    `<span>${T('issued {0}', fmtIssued(b.issued))}${b.mode && MODE_NAME[b.mode] ? ' · ' + T(MODE_NAME[b.mode]) : ''}</span>${withLink ? `<a href="#d${d}">${T('Open the day')}</a>` : ''}</div>` +
    (b.summary ? `<p>${esc(b.summary)}</p>` : '') +
    (items.length ? `<ul class="bul-items">${items.map(it => `<li class="sev-${['info', 'watch', 'warn'].includes(it.sev) ? it.sev : 'info'}"><span class="bcat">${T(BCAT[it.cat] || 'News')}</span><span><b>${esc(it.title || '')}</b>${it.where ? ` · ${esc(it.where)}` : ''}${it.detail ? `<br>${esc(it.detail)}` : ''}${safeUrl(it.url) ? ` <a href="${safeUrl(it.url)}" target="_blank" rel="noopener">${esc(it.src || T('Source'))} ↗</a>` : ''}</span></li>`).join('')}</ul>`
      : `<p class="bul-empty">${T('Nothing found that affects this day.')}</p>`) +
    (wx.length ? `<div class="bwx-wrap"><table class="bwx"><thead><tr><th>${T('Place')}</th><th>${T('Date')}</th><th>${T('Min / max')}</th><th>${T('Sky')}</th><th>${T('Rain / snow')}</th><th>${T('Wind gusts')}</th></tr></thead><tbody>` +
      wx.map(w => `<tr><td>${esc(w.place || '')}</td><td>${esc(w.date || '')}</td><td>${w.tmin != null ? esc(w.tmin) + '° / ' + esc(w.tmax) + '°' : ''}</td><td>${esc(w.sky || '')}</td><td>${esc(w.precip || '')}</td><td>${esc(w.wind || '')}</td></tr>`).join('') + `</tbody></table></div>` : '') +
    `</div>`;
}
function watchHtml(d) {
  const m = modeOf(d), v = variant(d, m);
  const list = (v && v.check) || (MODESD[d] && MODESD[d].bal && MODESD[d].bal.check) || [];
  return `<h3>${T('News bulletin')}</h3><p class="bul-empty">${T('No bulletin yet. One or two days before, it will check:')} ${list.map(x => esc(T(x))).join(' · ')}.</p>`;
}
/* ---- from V1 lines 1787-1796 ---- */
const SITE = !window.claude && /^https?:$/.test(location.protocol);
async function siteLoad(kind) {
  const out = {};
  await Promise.all(TRIP.days.map(async d => {
    try { const r = await fetch(`data/${kind}/d${String(d.d).padStart(2, '0')}.json`, { cache: 'no-cache' });
      if (r.ok) { const x = await r.json(); if (x && Number(x.d) === d.d) out[d.d] = x; } } catch (e) {}
  }));
  return out;
}
function siteLoop(fn) { fn(); setInterval(fn, 15 * 60e3); document.addEventListener('visibilitychange', () => { if (!document.hidden) fn(); }); window.addEventListener('online', fn); }
/* ---- from V1 lines 1823-1866 ---- */
const havLL = (a, b) => { const r = Math.PI / 180, dp = (b[1] - a[1]) * r, dl = (b[0] - a[0]) * r; const h = Math.sin(dp / 2) ** 2 + Math.cos(a[1] * r) * Math.cos(b[1] * r) * Math.sin(dl / 2) ** 2; return 12742 * Math.asin(Math.sqrt(h)); };
const FIT = DAYS.flatMap(d => d.stops.map(s => ({ ll: [s.lon, s.lat], xy: s.xy })));
function toXY(ll) {
  const near = FIT.map(p => [havLL(p.ll, ll), p]).sort((a, b) => a[0] - b[0]).slice(0, 6).map(x => x[1]);
  // least-squares affine fit lon/lat -> map x/y from the nearest stops
  const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], bx = [0, 0, 0], by = [0, 0, 0];
  for (const p of near) { const v = [p.ll[0], p.ll[1], 1]; for (let i = 0; i < 3; i++) { for (let j = 0; j < 3; j++) A[i][j] += v[i] * v[j]; bx[i] += v[i] * p.xy[0]; by[i] += v[i] * p.xy[1]; } }
  const solve = (M, b) => { const m = M.map((r, i) => [...r, b[i]]); for (let c = 0; c < 3; c++) { let piv = c; for (let r = c + 1; r < 3; r++) if (Math.abs(m[r][c]) > Math.abs(m[piv][c])) piv = r; [m[c], m[piv]] = [m[piv], m[c]]; if (Math.abs(m[c][c]) < 1e-12) return null; for (let r = 0; r < 3; r++) if (r !== c) { const f = m[r][c] / m[c][c]; for (let k = c; k < 4; k++) m[r][k] -= f * m[c][k]; } } return m.map((r, i) => r[3] / r[i]); };
  const cx = solve(A, bx), cy = solve(A, by);
  if (!cx || !cy) return near[0].xy;
  return [cx[0] * ll[0] + cx[1] * ll[1] + cx[2], cy[0] * ll[0] + cy[1] * ll[1] + cy[2]];
}
function chainFor(d, m) {
  const day = TRIP.days[d - 1], pe = prevEndOf[d];
  const seq = stopsFor(day, m).filter(s => s.t !== 'visit');
  return (pe ? [pe] : []).concat(seq).map(s => ({ n: s.n, ll: [s.lon, s.lat] }));
}
function locate(d, m, ll) {
  const ch = chainFor(d, m); if (ch.length < 2) return null;
  const cum = [0]; for (let i = 1; i < ch.length; i++) cum.push(cum[i - 1] + havLL(ch[i - 1].ll, ch[i].ll));
  let best = null;
  for (let i = 1; i < ch.length; i++) {
    const a = ch[i - 1].ll, b = ch[i].ll, kx = Math.cos(ll[1] * Math.PI / 180);
    const ax = a[0] * kx, ay = a[1], bxx = b[0] * kx, byy = b[1], px = ll[0] * kx, py = ll[1];
    const dx = bxx - ax, dy = byy - ay, L = dx * dx + dy * dy;
    const t = L ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L)) : 0;
    const q = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], off = havLL(q, ll);
    if (!best || off < best.off) best = { i, t, off, km: cum[i - 1] + (cum[i] - cum[i - 1]) * t };
  }
  const total = cum[cum.length - 1];
  return { ...best, f: total ? best.km / total : 0, total, next: ch[best.i].n, prev: ch[best.i - 1].n };
}
function plannedAt(P, f) {
  const drives = P.rows.filter(r => r.k === 'drive'), tot = drives.reduce((a, r) => a + r.min, 0);
  let target = f * tot, acc = 0;
  for (const r of P.rows) {
    if (r.k !== 'drive') continue;
    if (acc + r.min >= target) return { clock: pm(r.t) + (target - acc), driveLeft: tot - target, row: r };
    acc += r.min;
  }
  return { clock: pm(lastArr(P)), driveLeft: 0, row: null };
}
const nowMin = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };
const hhmm = m => { m = Math.round(((m % 1440) + 1440) % 1440); return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };
/* ---- from V1 lines 1877-1984 ---- */
let PROG = {};
try { PROG = JSON.parse(localStorage.getItem('w123-progress') || '{}') || {}; } catch (e) { PROG = {}; }
const LIVE = { timer: null, lastAlert: {}, pending: null, lastAuto: {} };
let INTV = {};   // per-day location updates: 0 = manual, else minutes
try { INTV = JSON.parse(localStorage.getItem('w123-interval') || '{}') || {}; } catch (e) { INTV = {}; }
const intervalOf = d => (INTV[d] != null ? +INTV[d] : 0);
const INTERVALS = [5, 10, 15, 30, 60];
function intervalCtl(d) {
  const v = intervalOf(d);
  return `<label>${T('Location updates')} <select data-lint="${d}"><option value="0"${v === 0 ? ' selected' : ''}>${T('Manual')}</option>` +
    INTERVALS.map(n => `<option value="${n}"${v === n ? ' selected' : ''}>${T('Automatic, every {0} min', n)}</option>`).join('') + `</select></label>`;
}
function saveIntv() { try { localStorage.setItem('w123-interval', JSON.stringify(INTV)); } catch (e) {} }
function saveProg(d) {
  try { localStorage.setItem('w123-progress', JSON.stringify(PROG)); } catch (e) {}
  if (dbRef && canSaveShared) {
    const g = PROG[d];
    const body = g ? { d, started: g.started, startMin: g.startMin, startLL: g.startLL, startName: g.startName, delay: g.delay, mode: g.mode,
      last: g.last || null, arrived: g.arrived || null, cleared: false } : { d, cleared: true };
    dbRef.doc('progress/d' + String(d).padStart(2, '0')).set(body).catch(() => {});
  }
}
const getPos = (light, ageMin) => new Promise((res, rej) => {
  if (!navigator.geolocation) return rej({ code: 1 });
  // a button press asks for a fresh GPS fix; automatic updates accept a recent or rough position to save battery
  const o = light ? { enableHighAccuracy: false, timeout: 30000, maximumAge: Math.max(1, ageMin || 2) * 60000 } : { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 };
  navigator.geolocation.getCurrentPosition(p => res({ ll: [p.coords.longitude, p.coords.latitude], acc: p.coords.accuracy }), rej, o);
});
/* The Claude app shows the road book in a protected frame that may not pass location through, even when Android allows it.
   Detect that once, remember it, and switch to tap-or-paste positions so everything keeps working in the app. */
let GEO_BLOCKED = false;
try { GEO_BLOCKED = !SITE && localStorage.getItem('w123-geo') === 'blocked'; } catch (e) {}
try { const fp = document.permissionsPolicy || document.featurePolicy; if (fp && fp.allowsFeature && !fp.allowsFeature('geolocation')) GEO_BLOCKED = true; } catch (e) {}
if (!navigator.geolocation) GEO_BLOCKED = true;
function markBlocked() { if (SITE) { renderAllLive(); return; } GEO_BLOCKED = true; try { localStorage.setItem('w123-geo', 'blocked'); } catch (e) {} renderAllLive(); }
const APP_URL = 'https://adrian32452.github.io/wride/';
const posErr = e => e && e.code === 1 && SITE
  ? T('Location permission is off for this app. On the phone: press and hold the W123 Run icon → App info → Permissions → Location → Allow (in Chrome: ⋮ → Settings → Site settings → Location). Then tap the button again.')
  : e && e.code === 1
  ? T('This view of the road book cannot read the phone\'s location. Tap where you are below, or paste a location.')
  : T('Could not get your location right now. Try again outdoors, or tap where you are below.');
/* positions typed or pasted: "43.2955, -2.2565", Google Maps links with @lat,lon or q=lat,lon, Waze links with ll= or /ul/h<geohash> */
function geohashDecode(h) {
  const B = '0123456789bcdefghjkmnpqrstuvwxyz'; let even = true, lat = [-90, 90], lon = [-180, 180];
  for (const ch of h.toLowerCase()) { const v = B.indexOf(ch); if (v < 0) return null;
    for (let k = 4; k >= 0; k--) { const bit = (v >> k) & 1, r = even ? lon : lat, mid = (r[0] + r[1]) / 2; if (bit) r[0] = mid; else r[1] = mid; even = !even; } }
  return [(lon[0] + lon[1]) / 2, (lat[0] + lat[1]) / 2];
}
function parseLoc(text) {
  const t = String(text || '').trim(); if (!t) return null;
  let m = t.match(/\/ul\/h([0-9b-hjkmnp-z]{5,12})/i); if (m) return geohashDecode(m[1]);
  m = t.match(/(?:ll|q|query|daddr|destination|center)=(-?\d{1,2}\.\d+)(?:%2C|,)\s*(-?\d{1,3}\.\d+)/i) || t.match(/@(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/) || t.match(/(-?\d{1,2}\.\d{2,})\s*[,; ]\s*(-?\d{1,3}\.\d{2,})/);
  if (!m) return null;
  const lat = +m[1], lon = +m[2];
  if (!(lat >= 30 && lat <= 55 && lon >= -12 && lon <= 32)) return null;   // somewhere on this trip's map
  return [lon, lat];
}
function placesFor(d) {   // each stop and the halfway point between consecutive stops
  const ch = chainFor(d, modeOf(d)), out = [];
  ch.forEach((c, i) => {
    out.push({ label: T(c.n), ll: c.ll });
    if (i < ch.length - 1) { const n = ch[i + 1]; out.push({ label: T('Between {0} and {1}', T(c.n), T(n.n)), ll: [(c.ll[0] + n.ll[0]) / 2, (c.ll[1] + n.ll[1]) / 2] }); }
  });
  return out;
}
function assess(d, ll, acc) {
  const m = modeOf(d), P = planFor(d, m); const loc = P && locate(d, m, ll); if (!loc) return null;
  const pl = plannedAt(P, loc.f), now = nowMin(), delta = Math.round(now - pl.clock);
  const g = PROG[d] || {}, base = g.started ? Math.round(g.startMin - pm(P.start)) : 0, rel = delta - base;
  const factor = loc.total ? P.km / loc.total : 1.25, kmLeft = Math.max(0, Math.round((loc.total - loc.km) * factor));
  const afterIdx = pl.row ? P.rows.indexOf(pl.row) : P.rows.length, ahead = P.rows.slice(afterIdx + 1);
  const lastDrive = ahead.map(r => r.k).lastIndexOf('drive');
  const stopsLeft = ahead.slice(0, Math.max(0, lastDrive)).filter(r => r.k === 'stop' || r.k === 'border').reduce((a, r) => a + (r.min || 0), 0);
  const eta = now + pl.driveLeft + stopsLeft, set = pm(P.sunset), dusk = pm(P.dusk), sleep = TRIP.days[d - 1].to;
  const endLL = chainFor(d, m).slice(-1)[0].ll, arrived = havLL(endLL, ll) < 3 && loc.f > 0.9;
  const late = rel > 10, early = rel < -10;
  const tips = [];
  const scenicLate = ahead.filter(r => r.k === 'drive' && r.kind === 'scenic' && pm(r.arr) + Math.max(0, delta) > set - 15);
  if (delta > 10 && scenicLate.length) {
    const need = Math.max(...scenicLate.map(r => pm(r.arr) + delta - (set - 15)));
    const opt = ahead.filter(r => r.k === 'stop' && r.mo === 'O' && r.min).sort((a, b) => b.min - a.min);
    let got = 0; const cut = []; for (const r of opt) { if (got >= need) break; cut.push(r); got += r.min; }
    if (cut.length) tips.push(T('To keep the scenic roads in daylight, cut or shorten: {0}.', cut.map(r => `${esc(T(r.name))} (${durTxt(r.min)})`).join(', ')));
    if (got < need && m !== 'fast' && hasMode(d, 'fast')) tips.push(T('Or switch the rest of today to Fastest on the day card.'));
    if (got < need) tips.push(T('Otherwise you would reach {0} after sunset: take the motorway for that part.', scenicLate.map(r => esc(T(r.to))).join(', ')));
  }
  const darkRisk = ahead.some(r => r.k === 'drive' && r.kind !== 'mw' && pm(r.arr) + delta > dusk);
  if (darkRisk) tips.push(T('You would finish after dark ({0}). Use motorways for the last part and skip optional stops.', hhmm(dusk)));
  if (late && !tips.length) {
    const opt = ahead.filter(r => r.k === 'stop' && r.mo === 'O' && r.min);
    if (opt.length) tips.push(T('To catch up, shorten the optional stops still ahead: {0}.', opt.map(r => `${esc(T(r.name))} (${durTxt(r.min)})`).join(', ')));
    if (!ahead.some(r => r.k === 'drive' && r.kind !== 'mw')) tips.push(T('The rest of today is on motorways, so a later or darker arrival is safe.'));
  }
  if (early && m !== 'cine' && hasMode(d, 'cine')) tips.push(T('You have time to spare: the Cinematic version of today fits if you switch now.'));
  else if (early) tips.push(T('You have time to spare: take an optional stop slowly, or arrive early.'));
  if (window.__wxReady && WX[d] && wxVerdict(d) && wxVerdict(d).level === 'switch' && m !== 'safe' && hasMode(d, 'safe')) tips.unshift(T('The weather check says take the Safe route today; see the Safe option below.'));
  if (!tips.length && !late) tips.push(T('Nothing to change. Keep going.'));
  const head = arrived ? T('Arrived in {0}', T(sleep)) : late ? T('About {0} behind the plan', fmtDur(rel)) : early ? T('About {0} ahead of the plan', fmtDur(-rel)) : T('On schedule');
  const copy = `Day ${d}, ${hhmm(now)}: I'm between ${loc.prev} and ${loc.next} (${ll[1].toFixed(4)}, ${ll[0].toFixed(4)}), ${late ? fmtDur(rel) + ' behind' : early ? fmtDur(-rel) + ' ahead of' : 'on'} plan, ${MODE_NAME[m].toLowerCase()} route${g.started ? ', started ' + hhmm(g.startMin) : ''}.`;
  const html = `<p class="wbig ${late && !arrived ? 'late' : 'ok'}">${head}</p>` +
    `<div class="wstat"><span class="num">${hhmm(now)}<small>${T('now')}</small></span><span class="num">${hhmm(pl.clock + base)}<small>${T('planned here')}</small></span>` +
    `<span class="num">≈${kmLeft} km<small>${esc(T('to {0}', T(sleep)))}</small></span><span class="num">${hhmm(eta)}<small>${T('estimated arrival')}</small></span>` +
    `<span class="num">${set - now > 0 ? fmtDur(set - now) : '0h00'}<small>${T('daylight left')}</small></span></div>` +
    `<p class="wmsg">${esc(T('Between {0} and {1}', T(loc.prev), T(loc.next)))}${loc.off > 15 ? ' · ' + esc(T('about {0} km from the planned route', Math.round(loc.off))) : ''}${acc ? ' · ' + esc(T('accuracy about {0} m', Math.round(acc))) : ''}</p>` +
    (arrived ? '' : `<ul class="wtips">${tips.map(t => `<li>${t}</li>`).join('')}</ul>` + optionsHtml(d, ll)) +
    `<p class="wmsg">${T('To re-plan with Claude, copy this into the chat:')}</p><textarea class="wcopy" readonly>${esc(copy)}</textarea>`;
  return { html, rel, delta, arrived, scenicRisk: delta > 10 && scenicLate.length > 0, darkRisk };
}
/* ---- from V1 lines 1999-2030 ---- */
function optionsFrom(d, ll) {
  const now = nowMin(), cur0 = modeOf(d), cur = hasMode(d, cur0) ? cur0 : 'bal', out = [];
  for (const m of MK) {
    if (!hasMode(d, m)) continue;
    const P = planFor(d, m), loc = locate(d, m, ll); if (!loc) continue;
    const pl = plannedAt(P, loc.f);
    const join = loc.off > 2 ? Math.round(loc.off * 1.3) : 0, joinMin = Math.round(join / 50 * 60);
    const idx = pl.row ? P.rows.indexOf(pl.row) : P.rows.length, ahead = P.rows.slice(idx + 1);
    const lastDrive = ahead.map(r => r.k).lastIndexOf('drive'), mid = ahead.slice(0, Math.max(0, lastDrive));
    const stopsAll = mid.filter(r => r.k === 'stop' || r.k === 'border').reduce((a, r) => a + (r.min || 0), 0);
    const stopsOpt = mid.filter(r => r.k === 'stop' && r.mo === 'O').reduce((a, r) => a + (r.min || 0), 0);
    const drive = Math.round(pl.driveLeft + joinMin), eta = now + drive + stopsAll, etaFast = eta - stopsOpt;
    const shift = now + joinMin - pl.clock, set = pm(P.sunset), dusk = pm(P.dusk);
    const curRow = pl.row && pl.row.kind === 'scenic' ? [pl.row] : [];
    const scenicDark = curRow.concat(ahead).filter(r => r.k === 'drive' && r.kind === 'scenic' && pm(r.arr) + shift > set - 15).length;
    const scenicDarkLean = curRow.concat(ahead).filter(r => r.k === 'drive' && r.kind === 'scenic' && pm(r.arr) + shift - stopsOpt > set - 15).length;
    const minorDark = ahead.some(r => r.k === 'drive' && r.kind !== 'mw' && pm(r.arr) + shift > dusk);
    const kmLeft = Math.max(0, Math.round((loc.total - loc.km) * (loc.total ? P.km / loc.total : 1.25)) + join);
    out.push({ m, cur: m === cur, drive, eta, etaFast, stopsOpt, join, kmLeft, scenicDark, scenicDarkLean, minorDark });
  }
  const base = out.find(o => o.cur);
  for (const o of out) o.diff = base ? o.eta - base.eta : 0;
  return out;
}
function optionsHtml(d, ll) {
  const os = optionsFrom(d, ll); if (os.length < 2) return '';
  const light = o => o.scenicDark ? (o.scenicDarkLean ? `<span class="bad">${T('scenic road after sunset')}</span>` : `<span class="ok">${T('fits if you skip optional stops')}</span>`) : o.minorDark ? `<span class="bad">${T('ends after dark')}</span>` : `<span class="ok">${T('fits')}</span>`;
  return `<div class="opts"><h4>${T('Options from here')}</h4>` + os.map(o => `<div class="opt${o.cur ? ' cur' : ''}">` +
    `<div class="oh"><b>${T(MODE_NAME[o.m])}</b>${o.cur ? `<small>${T('current')}</small>` : `<span class="od">${(o.diff >= 0 ? '+' : '−') + fmtDur(Math.abs(o.diff))} ${T('vs now')}</span>`}</div>` +
    `<div class="ob">${T('Arrival')} <b>${hhmm(o.eta)}</b>${o.stopsOpt ? ` · ${T('Without optional stops')} <b>${hhmm(o.etaFast)}</b>` : ''}<br>${T('Driving left')} ${fmtDur(o.drive)} · ≈${o.kmLeft} km${o.join ? ' · ' + esc(T('joins the route in about {0} km', o.join)) : ''}<br>${T('Daylight')}: ${light(o)}</div>` +
    (o.cur ? '' : `<button type="button" data-lswitch="${d}:${o.m}">${esc(T('Switch to {0}', T(MODE_NAME[o.m])))}</button>`) + `</div>`).join('') + `</div>`;
}
/* ---- from V1 lines 2058-2096 ---- */
function doCheck(d, pos, quiet) {
  const g = PROG[d]; if (!g) return;
  WHERE.ll = pos.ll; drawMe();
  const a = assess(d, pos.ll, pos.acc); if (!a) return;
  g.last = { at: new Date().toISOString(), ll: pos.ll, rel: a.rel };
  g.lastHtml = a.html;
  if (a.arrived) g.arrived = new Date().toISOString();
  const prev = LIVE.lastAlert[d] || { rel: g.delay ? 0 : 0, scenic: false, dark: false };
  if (quiet && !a.arrived && (Math.abs(a.rel - prev.rel) >= 20 || (a.scenicRisk && !prev.scenic) || (a.darkRisk && !prev.dark)))
    alertMe(`${T('Day {0}', d)}: ${a.scenicRisk ? T('a scenic road now ends after sunset.') : a.darkRisk ? T('you would finish after dark.') : a.rel > 0 ? T('now {0} behind.', fmtDur(a.rel)) : T('now {0} ahead.', fmtDur(-a.rel))} <a href="#d${d}">${T('See what to change')}</a>`);
  LIVE.lastAlert[d] = { rel: a.rel, scenic: a.scenicRisk, dark: a.darkRisk };
  saveProg(d); renderLive(d); armAuto();
}
function startDay(d, pos, fromHere) {
  const m = modeOf(d), P = planFor(d, m), now = nowMin(), sp = chainFor(d, m)[0];
  PROG[d] = { started: new Date().toISOString(), startMin: now, startLL: pos ? pos.ll : sp.ll, startName: fromHere ? '@here' : sp.n,
    delay: Math.round(now - pm(P.start)), mode: m };
  LIVE.lastAlert[d] = { rel: 0, scenic: false, dark: false };
  saveProg(d); rerenderSched(d); renderLive(d);
  const SP = shiftPlan(P, PROG[d].delay);
  if (SP && SP.warn && SP.warn.length) alertMe(`${T('Day {0}', d)}: ${T('with this start, a scenic or minor road falls after dark.')} <a href="#d${d}">${T('See what to change')}</a>`);
  if (pos) doCheck(d, pos, false);
  armAuto();
}
function armAuto() {
  if (LIVE.timer) { clearInterval(LIVE.timer); LIVE.timer = null; }
  const active = () => Object.keys(PROG).map(Number).filter(d => PROG[d] && PROG[d].started && !PROG[d].arrived && intervalOf(d) > 0);
  if (!active().length) return;
  LIVE.timer = setInterval(() => {
    if (document.hidden) return;
    const now = Date.now();
    for (const d of active()) {
      const every = intervalOf(d) * 60000, last = LIVE.lastAuto[d] || Date.parse((PROG[d].last && PROG[d].last.at) || PROG[d].started) || 0;
      if (now - last < every) continue;
      LIVE.lastAuto[d] = now;
      getPos(true, Math.min(intervalOf(d), 10) / 2).then(p => doCheck(d, p, true)).catch(() => {});
    }
  }, 60 * 1000);
}
/* ---- from V1 lines 2206-2290 ---- */
const CLIMATE = {
  1: [['Burgos', 8, 0, 3, ['frost']], ['Bilbao', 13, 6, 5, ['atl']]],
  2: [['San Sebastián', 13, 6, 5, ['atl']], ['Biarritz', 13, 6, 5, ['atl']]],
  3: [['Pau', 11, 2, 4, ['frost']], ['Carcassonne', 11, 3, 3, ['wind']]],
  4: [['Pont du Gard', 12, 3, 2, []], ['Menton', 14, 7, 2, []]],
  5: [['Menton', 14, 7, 2, []]],
  6: [['La Spezia', 13, 6, 3, []], ['Lucca', 11, 3, 3, ['fog']]],
  7: [['Castellina in Chianti', 9, 1, 3, ['frost']], ['Figline Valdarno', 10, 2, 3, ['fog']]],
  8: [['Florence', 11, 3, 3, []]],
  9: [['Arezzo', 10, 1, 3, ['frost']], ['Bocca Trabaria', 4, -3, 3, ['snow']], ['San Marino', 7, 1, 3, ['snow']]],
  10: [['Comacchio', 8, 1, 3, ['fog']], ['Mogliano Veneto', 7, 0, 3, ['fog']]],
  11: [['Venice', 8, 2, 3, ['fog', 'acqua']]],
  12: [['Trieste', 10, 5, 3, ['bora']], ['Ljubljana', 4, -3, 3, ['fog', 'frost']]],
  13: [['Zagreb', 5, -2, 3, ['frost']]],
  14: [['Županja', 4, -2, 3, ['fog']], ['Belgrade', 5, -1, 3, ['fog']]],
  15: [['Golubac Fortress', 5, -1, 3, ['fog']], ['Drobeta-Turnu Severin', 5, -2, 3, ['fog', 'frost']]],
  16: [['Craiova', 4, -4, 3, ['frost', 'snow']], ['Bucharest', 3, -4, 3, ['snow']]],
};
const CLIM_NOTE = { frost: 'Frost most mornings', fog: 'Fog is common', snow: 'Snow or ice possible', bora: 'Bora wind gusts possible',
  atl: 'Atlantic rain and wind', acqua: 'Acqua alta possible', wind: 'Strong Cers wind possible' };
const RISK_CLS = { ok: 'ok', watch: 'watch', warn: 'warn' };
let WX = {};
function climateHtml(d) {
  const c = CLIMATE[d]; if (!c) return '';
  return `<div class="wx-clim"><h4>${T('Typical for these dates')}</h4><ul>` + c.map(([p, hi, lo, wet, notes]) =>
    `<li><b>${esc(T(p))}</b> <span class="wx-num">${hi}° / ${lo}°</span> · ${T('rain on about {0} days in 10', wet)}${notes.length ? ' · ' + notes.map(n => esc(T(CLIM_NOTE[n]))).join(' · ') : ''}</li>`).join('') +
    `</ul><p class="wmsg">${T('Approximate long-term averages; the real forecast replaces this from 9 December.')}</p></div>`;
}
function forecastHtml(d) {
  const w = WX[d]; if (!w) return '';
  const test = w.mode === 'test';
  const pts = Array.isArray(w.points) ? w.points : [], legs = Array.isArray(w.legs) ? w.legs : [];
  let h = `<div class="wx-fc${test ? ' test' : ''}"><div class="bul-head"><b>${test ? T('Test forecast') : T('Forecast')}</b>` +
    `<span>${test ? esc(T('for {0}, not your trip date', w.forDate || '')) + ' · ' : ''}${T('issued {0}', fmtIssued(w.issued))} · yr.no</span></div>`;
  if (w.summary) h += `<p>${esc(w.summary)}</p>`;
  if (pts.length) h += `<div class="bwx-wrap"><table class="bwx"><thead><tr><th>${T('Place')}</th><th>${T('Min / max')}</th><th>${T('Sky')}</th><th>${T('Rain / snow')}</th><th>${T('Wind gusts')}</th></tr></thead><tbody>` +
    pts.map(p => `<tr><td>${esc(p.name || '')}${p.role ? ` <small>${esc(T({ start: 'start', scenic: 'scenic point', overnight: 'overnight', stop: 'Stop' }[p.role] || ''))}</small>` : ''}</td><td>${p.tmin != null ? esc(p.tmin) + '° / ' + esc(p.tmax) + '°' : ''}</td><td>${esc(p.sky || '')}</td><td>${esc(p.precip || '')}</td><td>${esc(p.wind || '')}</td></tr>`).join('') + `</tbody></table></div>`;
  if (legs.length) h += `<h4>${T('On each drive')}</h4><ul class="wx-legs">` + legs.map(l =>
    `<li class="r-${RISK_CLS[l.risk] || 'ok'}"><span class="wx-t">${esc(l.t || '')}</span><span><b>${esc(T('Drive to {0}', T(l.to || '')))}</b><br>${esc([l.sky, l.temp != null && l.temp !== '' ? l.temp + '°' : '', l.precip, l.wind, l.vis].filter(Boolean).join(' · '))}${l.note ? `<br><i>${esc(l.note)}</i>` : ''}</span></li>`).join('') + `</ul>`;
  if (w.sunset) h += `<p class="wmsg">${T('Sunset sky:')} ${esc(w.sunset)}</p>`;
  if (w.advice && w.advice.mode && MODE_NAME[w.advice.mode]) {
    const m = w.advice.mode, cur = modeOf(d);
    h += `<p class="wx-adv"><b>${T('Weather suggests: {0}', T(MODE_NAME[m]))}</b>${w.advice.why ? ' · ' + esc(w.advice.why) : ''}` +
      (m !== cur && hasMode(d, m) ? ` <button type="button" data-lswitch="${d}:${m}">${esc(T('Switch to {0}', T(MODE_NAME[m])))}</button>` : '') + `</p>`;
  }
  return h + `</div>`;
}
const HAZ = { snow: 'snow', ice: 'ice', fog: 'fog', wind: 'wind', rain: 'heavy rain', rock: 'rockfall', waves: 'storm waves' };
const HLEV = { ok: 'Clear', watch: 'Watch', switch: 'Take Safe', wait: 'Wait' };
const routeOf = (d, m) => variant(d, m) ? m : 'bal';
function hotTime(d, m, h) {
  const r = routeOf(d, m), key = h.leg[r] || h.leg.fast || h.leg.bal || '', P = planFor(d, m);
  const row = P && key ? P.rows.find(x => x.k === 'drive' && x.to.startsWith(key)) : null;
  return row ? `${row.t}–${row.arr}` : '';
}
const wxVerdict = d => { const w = WX[d]; if (!w) return null; const vs = w.verdicts; return (vs && (vs[modeOf(d)] || vs.bal)) || w.verdict || null; };
function verdictHtml(d) {
  const w = WX[d], v = wxVerdict(d); if (!v || !HLEV[v.level]) return '';
  const cur = modeOf(d), test = w.mode === 'test';
  const head = { ok: T('Weather check: all clear on your route'), watch: T('Weather check: keep an eye on it'),
    switch: T('Weather check: take the Safe route'), wait: T('Weather check: no safe road at the planned time') }[v.level];
  let h = `<div class="wx-verdict v-${v.level}"><p><b>${head}</b>${test ? ' · ' + T('test') : ''}</p>${v.text ? `<p>${esc(v.text)}</p>` : ''}`;
  if (v.level === 'switch' && cur !== 'safe' && hasMode(d, 'safe')) h += `<button type="button" data-lswitch="${d}:safe">${esc(T('Switch to {0}', T('Safe')))}</button>`;
  if (v.level === 'switch' && !hasMode(d, 'safe')) h += `<p>${T('Balanced already uses the safest roads on this day.')}</p>`;
  if (v.level === 'wait') h += `<p>${T('Options: leave later, wait for the snowploughs or the fog to lift, or as a last resort add a night.')}</p>`;
  return h + `</div>`;
}
function hotHtml(d) {
  const hs = (MODESD[d] && MODESD[d].hot) || []; if (!hs.length) return '';
  const m = modeOf(d), r = routeOf(d, m), rs = routeOf(d, 'safe');
  const fc = {}; for (const x of ((WX[d] && Array.isArray(WX[d].hot)) ? WX[d].hot : [])) if (x && x.id) fc[x.id] = x;
  const on = hs.filter(h => h.on.includes(r));
  let h = `<h4>${T('Weather watch points on your route ({0})', T(MODE_NAME[m]))}</h4>`;
  if (!on.length) h += `<p class="wx-avoid">${T('None on this route.')}</p>`;
  else h += `<ul class="wx-hot">` + on.map(x => { const f = fc[x.id], lev = f && HLEV[f.level] ? f.level : '';
    return `<li class="${lev ? 'h-' + lev : ''}"><span class="wx-t">${hotTime(d, m, x)}</span><span><b>${esc(T(x.n))}</b>${x.elev ? ` <span class="wx-num">${x.elev.toLocaleString(LOCALE[LANG])} m</span>` : ''}${lev ? `<span class="hlev">${T(HLEV[lev])}</span>` : ''}` +
      `<br><small>${x.risks.map(k => T(HAZ[k])).join(' · ')}</small>` +
      (f && (f.what || f.note) ? `<br>${esc([f.when, f.what, f.note].filter(Boolean).join(' · '))}` : `<br><small>${esc(T(x.note))}</small>`) +
      (x.alt ? `<br><small>${esc(T(x.alt))}</small>` : '') + `</span></li>`; }).join('') + `</ul>`;
  if (r !== rs) {
    const avoided = on.filter(x => !x.on.includes(rs));
    if (avoided.length) h += `<p class="wx-avoid">${T('The Safe route avoids: {0}.', avoided.map(x => esc(T(x.n))).join(', '))}</p>`;
  }
  return h;
}
