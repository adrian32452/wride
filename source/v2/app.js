/* ================= V2 app ================= */
window.__wxReady = true;
const $ = s => document.querySelector(s);
const main = $('#main');
const tabsEl = $('#tabbar');
const IMG = n => `${BASE}img/${n}`;
const ICON = {
  today: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 16a8 8 0 1 1 16 0"/><path d="M12 16 7.5 10.5"/><circle cx="12" cy="16" r="1.6" fill="currentColor"/></svg>',
  days: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="3" width="14" height="18" rx="3"/><path d="M5 8h14M9 13h6M9 17h4"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/></svg>',
  pin: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.6A2.6 2.6 0 1 1 12 6.4a2.6 2.6 0 0 1 0 5.2z"/></svg>'
};
const VIEW = { name: 'today', d: null, tab: 'plan', mapDay: 0 };
const STOPKEY = {};   // stop name -> photo key (build.py adds s.p)
const fmtLong = iso => { try { return new Intl.DateTimeFormat(LOCALE[LANG], { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(iso + 'T12:00:00Z')); } catch (e) { return iso; } };
const drives = d => { const P = PLAN[d]; return !!(P && P.rows.some(r => r.k === 'drive')); };
function fabDay() {
  const t = tripDayNow();
  if (t >= 1 && t <= 16) { for (let d = t; d <= 16; d++) if (drives(d)) return d; }
  const open = Object.keys(PROG).map(Number).filter(d => PROG[d] && PROG[d].started && !PROG[d].arrived).sort((a, b) => b - a)[0];
  return open || 1;
}
const offOf = d => { const g = PROG[d], P = planFor(d, modeOf(d)); return g && g.started && P ? Math.round(g.startMin - pm(P.start)) : 0; };
const curPlan = d => shiftPlan(planFor(d, modeOf(d)), offOf(d));
const isToday = d => tripDayNow() === d;

/* ---------- the daylight gauge ---------- */
function gaugeHtml(P, needle) {
  const tzs = P.riseTz !== P.setTz ? -60 : 0;
  const rise = pm(P.sunrise), set = pm(P.sunset) + tzs, dusk = pm(P.dusk) + tzs;
  let off = 0; const segs = [];
  for (const r of P.rows) {
    if (r.k === 'tz') { off = -60; continue; }
    if (!r.min) continue;
    const a = pm(r.t) + off; segs.push([a, a + r.min, r.k === 'drive' ? r.kind : 'stop']);
  }
  const first = segs.length ? segs[0][0] : rise, last = segs.length ? segs[segs.length - 1][1] : dusk;
  const lo = Math.floor(Math.min(rise - 45, first - 15) / 60) * 60, hi = Math.ceil(Math.max(dusk + 20, last + 15) / 60) * 60;
  const X = v => Math.max(0, Math.min(100, (v - lo) / (hi - lo) * 100));
  const box = (a, b, c) => `<i class="${c}" style="left:${X(a).toFixed(2)}%;width:${Math.max(0, X(b) - X(a)).toFixed(2)}%"></i>`;
  let h = box(lo, rise - 35, 'n') + box(rise - 35, rise, 'tw') + box(rise, set, 'dy') + box(set, dusk, 'tw') + box(dusk, hi, 'n');
  h += segs.map(([a, b, k]) => box(a + 1, b - 1, 'seg k-' + k)).join('');
  if (needle != null && needle >= lo && needle <= hi) h += `<i class="needle" style="left:${X(needle).toFixed(2)}%"></i>`;
  const step = hi - lo > 600 ? 180 : 120;
  let ticks = '';
  for (let t = Math.ceil((lo + 30) / step) * step; t < hi - 20; t += step) ticks += `<span style="left:${X(t).toFixed(2)}%">${String(t / 60 % 24).padStart(2, '0')}:00</span>`;
  const label = T('Daylight {0}–{1}; driving and stops drawn on top', P.sunrise, P.sunset);
  return `<div class="gauge"><div class="gface" role="img" aria-label="${esc(label)}">${h}</div><div class="gticks" aria-hidden="true">${ticks}</div>` +
    `<div class="gsun"><span>${T('sunrise')} <b>${P.sunrise}</b></span><span>${T('sunset')} <b>${P.sunset}</b></span><span>${T('dark from {0}', '')}<b>${P.dusk}</b></span></div></div>`;
}

/* ---------- small pieces ---------- */
const stone = (d, lg) => `<span class="stone${lg ? ' lg' : ''}${drives(d) ? '' : ' rest'}" aria-hidden="true">${d}</span>`;
function dayChain(d) {
  const day = TRIP.days[d - 1], m = modeOf(d), seq = stopsFor(day, m), vertices = seq.filter(s => s.t !== 'visit'), pe = prevEndOf[d];
  const chain = (pe ? [`${pe.lat},${pe.lon}`] : []).concat(vertices.map(s => `${s.lat},${s.lon}`));
  return chain.filter((x, i) => i === 0 || x !== chain[i - 1]);
}
function gmapsDay(d) {
  const u = dayChain(d); if (u.length < 2) return '';
  const q = new URLSearchParams({ api: '1', origin: u[0], destination: u[u.length - 1], travelmode: 'driving' });
  if (u.length > 2) q.set('waypoints', u.slice(1, -1).join('|'));
  q.set('hl', LANG);
  return 'https://www.google.com/maps/dir/?' + q.toString();
}
function stopByName(d, name) {
  const day = TRIP.days[d - 1], seq = stopsFor(day, modeOf(d));
  const n = String(name || '').toLowerCase();
  const w0 = n.split(/[\s,(]/)[0];
  return seq.find(s => n.startsWith(String(s.n).toLowerCase().split(',')[0])) || seq.find(s => String(s.n).toLowerCase().startsWith(n.split(' (')[0].split(' via')[0]))
    || seq.find(s => String(s.n).toLowerCase().split(/[\s,(]/)[0] === w0) || seq.filter(s => s.t !== 'via').slice(-1)[0] || null;
}
function verdictLevel(d) { const v = wxVerdict(d); return v ? v.level : null; }
const LAMP = { ok: 'ok', watch: 'watch', switch: 'act', wait: 'act' };
function bulLevel(d) { const b = BUL[d]; if (!b) return null; const it = Array.isArray(b.items) ? b.items : []; return it.some(x => x.sev === 'warn') ? 'act' : it.some(x => x.sev === 'watch') ? 'watch' : 'ok'; }

/* ---------- Today ---------- */
function nextStep(d, P) {
  const g = PROG[d];
  const t = isToday(d) && g && g.started ? nowMin() : (g && g.last ? pm(new Date(g.last.at).toTimeString().slice(0, 5)) : -1);
  if (!g || !g.started) return { kind: 'start', row: P.rows.find(r => r.k === 'drive') };
  if (g.arrived) return { kind: 'done' };
  for (const r of P.rows) {
    if (r.k === 'drive' && pm(r.t) <= t && t < pm(r.arr)) return { kind: 'driving', row: r };
    if (r.k !== 'tz' && pm(r.t) >= t) return { kind: r.k === 'drive' ? 'drive' : 'stop', row: r };
  }
  const lastD = P.rows.filter(r => r.k === 'drive').pop();
  return { kind: 'driving', row: lastD };
}
function arrivalLamp(d, P) {
  const lastDrive = P.rows.filter(r => r.k === 'drive').pop(); if (!lastDrive) return null;
  const st0 = pm(P.start), W = t => { const v = pm(t); return v < st0 - 60 ? v + 1440 : v; };   // times after midnight
  const arr = W(lastDrive.arr), set = pm(P.sunset), dusk = pm(P.dusk);
  const minorLate = P.rows.some(r => r.k === 'drive' && r.kind !== 'mw' && W(r.arr) > dusk);
  const lv = arr <= set - 10 ? 'ok' : minorLate ? 'act' : 'watch';
  const txt = lv === 'ok' ? T('Arrive {0} at {1}, before sunset ({2}).', T(TRIP.days[d - 1].to), lastDrive.arr, P.sunset)
    : lv === 'watch' ? T('Arrive {0} at {1}, after sunset ({2}); the last part is on motorways.', T(TRIP.days[d - 1].to), lastDrive.arr, P.sunset)
    : T('Arrive {0} at {1}: a scenic or minor road falls after dark ({2}).', T(TRIP.days[d - 1].to), lastDrive.arr, P.dusk);
  return { lv, txt };
}
function renderToday() {
  const d = VIEW.d || fabDay(); VIEW.d = d;
  const day = TRIP.days[d - 1], P = curPlan(d), m = modeOf(d), g = PROG[d], tn = tripDayNow();
  let h = '';
  if (tn < 1) h += `<p class="note">${esc(T('The trip starts on {0}: {1} days to go. You can look at any day now.', fmtLong(PLAN[1].date), 1 - tn))}</p>`;
  h += `<div class="stepper"><button type="button" data-step="-1" aria-label="${esc(T('Previous day'))}"${d <= 1 ? ' disabled' : ''}>‹</button>` +
    `<span class="label">${esc(T('Day {0} of 16', d))} · ${fmtDate(PLAN[d].date)}</span>` +
    `<button type="button" data-step="1" aria-label="${esc(T('Next day'))}"${d >= 16 ? ' disabled' : ''}>›</button></div>`;
  h += `<div class="dhead">${stone(d, true)}<div><p class="when">${esc(T('from {0}', T(day.from)))}</p><h1>${esc(T(day.to))}</h1><p class="when">${esc(T(day.title))}</p></div></div>`;
  if (!P || !drives(d)) {
    h += `<div class="block"><p>${T('No driving today; the car stays parked.')}</p><button type="button" class="btn" data-open="${d}">${esc(T('Open the day'))}</button></div>`;
    main.innerHTML = h; return;
  }
  h += `<div><button type="button" class="chip" data-stylesheet="${d}">${T('Route')}: ${T(MODE_NAME[m])} ▾</button></div>`;
  const needle = isToday(d) ? nowMin() : (g && g.last ? pm(new Date(g.last.at).toTimeString().slice(0, 5)) : null);
  h += `<div class="block">${gaugeHtml(P, needle)}</div>`;
  // next step
  const ns = nextStep(d, P);
  let nx = '';
  if (ns.kind === 'done') nx = `<p class="kicker">${esc(T('Day {0} done', d))}</p><p class="what">${esc(T('Arrived {0}.', new Date(g.arrived).toTimeString().slice(0, 5)))}</p>`;
  else if (ns.row) {
    const r = ns.row, dest = r.k === 'drive' ? stopByName(d, r.to) : null;
    const kick = ns.kind === 'start' ? T('Leave {0}', T(chainFor(d, m)[0].n)) : ns.kind === 'driving' ? T('On the way') : T('Next');
    const big = ns.kind === 'driving' ? T('arr. {0}', r.arr) : r.t;
    const what = r.k === 'drive' ? T('Drive to {0}', T(r.to)) : T(r.name);
    const how = r.k === 'drive' ? `${r.km} km · ${durTxt(r.min)} · ${esc(T(r.roads))}` : (r.note ? esc(T(r.note)) : (r.min ? durTxt(r.min) : ''));
    nx = `<p class="kicker">${esc(kick)}</p><p class="big num">${esc(big)}</p><p class="what">${esc(what)}</p><p class="how">${how}</p>`;
    nx += `<div class="btnrow">` + (dest ? `<a class="btn primary" href="${wazeLL(dest.lat, dest.lon)}" target="_blank" rel="noopener">Waze</a>` : '') +
      `<a class="btn" href="${gmapsDay(d)}" target="_blank" rel="noopener">${esc(T('Whole day in Google Maps'))}</a></div>`;
  }
  h += `<div class="block next">${nx}</div>`;
  // lamps
  const al = arrivalLamp(d, P), wv = wxVerdict(d), bl = bulLevel(d);
  const lamps = [];
  if (al) lamps.push(`<div class="lrow"><span class="lamp on ${LAMP[al.lv] || al.lv}"></span><span>${esc(al.txt)}</span></div>`);
  lamps.push(`<div class="lrow"><span class="lamp${wv ? ' on ' + LAMP[wv.level] : ''}"></span><span>${wv
    ? `<b>${esc({ ok: T('Weather check: all clear on your route'), watch: T('Weather check: keep an eye on it'), switch: T('Weather check: take the Safe route'), wait: T('Weather check: no safe road at the planned time') }[wv.level] || '')}</b>${wv.text ? ' ' + esc(wv.text) : ''}` +
      (wv.level === 'switch' && m !== 'safe' && hasMode(d, 'safe') ? ` <button type="button" class="link" data-setmode="${d}:safe">${esc(T('Switch to {0}', T('Safe')))}</button>` : '')
    : esc(T('No forecast yet. From 9 December the weather check fills this in.'))}</span></div>`);
  lamps.push(`<div class="lrow"><span class="lamp${bl ? ' on ' + bl : ''}"></span><span>${BUL[d] ? `<b>${T('News bulletin')}:</b> ${esc(BUL[d].summary || '')}` : esc(T('No news bulletin yet. It starts on 17 December.'))} <button type="button" class="link" data-open="${d}" data-tab="news">${esc(T('Open the day'))}</button></span></div>`);
  h += `<div class="block lamps">${lamps.join('')}</div>`;
  // record
  let rl = '';
  if (g && g.started) {
    const dl = g.delay > 5 ? T('{0} later than planned', fmtDur(g.delay)) : g.delay < -5 ? T('{0} earlier than planned', fmtDur(-g.delay)) : T('on time');
    rl = esc(T('Started {0} from {1}, {2}.', hhmm(g.startMin), g.startName === '@here' ? T('your position') : T(g.startName || day.from), dl));
    if (g.last) rl += ' ' + fabResult(d);
  } else rl = esc(T('Not started yet: recording also starts the day from where you are.'));
  h += `<div class="block"><button type="button" class="btn rec" data-rec="${d}"${g && g.arrived ? ' disabled' : ''}>${ICON.pin} ${T('Record my location now')}</button>` +
    `<p class="recline" aria-live="polite" id="recmsg">${rl}</p>` +
    (GEO_BLOCKED ? '' : `<div class="auto">${intervalCtl(d)}</div>`) +
    (g && g.lastHtml && !g.arrived ? `<details><summary>${T('Details and options')}</summary><div class="live-detail">${g.lastHtml}</div></details>` : '') +
    (g && g.started ? `<button type="button" class="btn" data-reset="${d}">${T('Reset this day')}</button>` : '') + `</div>`;
  main.innerHTML = h;
}

/* ---------- Days ---------- */
function renderDays() {
  const tn = tripDayNow();
  main.innerHTML = `<h1>${T('16 days')}</h1><ul class="dlist">` + TRIP.days.map(day => {
    const d = day.d, P = curPlan(d), lv = verdictLevel(d);
    const right = drives(d) ? `<b>${P.km} km</b><span class="s">${esc(P.drive)}</span>` : `<span class="s">${T('No driving')}</span>`;
    return `<li><button type="button" class="drow${tn === d ? ' today' : ''}" data-open="${d}">${stone(d)}<span><span class="t">${day.from === day.to ? esc(T(day.title)) : `${esc(T(day.from))} → ${esc(T(day.to))}`}</span><br>` +
      `<span class="s">${fmtDate(PLAN[d].date)} · ${esc(T(MODE_NAME[modeOf(d)]))}</span></span><span class="r">${right}${lv ? `<span class="lamp on ${LAMP[lv]}" title="${esc(T(HLEV[lv] || ''))}"></span>` : ''}</span></button></li>`;
  }).join('') + `</ul>`;
}

/* ---------- Day ---------- */
function styleSeg(d) {
  const m = modeOf(d);
  const any = ['fast', 'cine', 'safe'].some(x => variant(d, x));
  if (!any) return `<p class="stylenote">${T('Same route in every mode on this day.')}</p>`;
  const same = m !== 'bal' && !hasMode(d, m);
  const why = same ? ((MODESD[d] && MODESD[d][m] && MODESD[d][m].why) || '') : '';
  return `<div class="seg4" role="group" aria-label="${esc(T('Route for this day'))}">` + MK.map(x => `<button type="button" data-setmode="${d}:${x}" aria-pressed="${x === m}" class="${x !== 'bal' && !hasMode(d, x) ? 'same' : ''}">${T(MODE_NAME[x])}</button>`).join('') + `</div>` +
    (same ? `<p class="stylenote">${esc(why ? T(why) : T('{0} uses the same roads as Balanced on this day.', T(MODE_NAME[m])))}</p>` : cmpText(d, m));
}
function cmpText(d, m) {
  const B = PLAN[d], X = planFor(d, m); if (!B || !X || m === 'bal' || !hasMode(d, m)) return '';
  const dm = durMin(X) - durMin(B);
  return `<p class="stylenote">${T('Compared with balanced: {0} driving, last arrival {1} instead of {2}.', `<b>${dm >= 0 ? '+' : '−'}${fmtDur(Math.abs(dm))}</b>`, `<b>${lastArr(X)}</b>`, lastArr(B))}</p>`;
}
const LTAG = c => ({ predawn: '', dusk: 'warn', afterdark: 'warn', golden: 'gold', glare_east: '', glare_west: '', scenic_dark: 'warn', minor_dark: 'warn' }[c] || '');
function planTab(d) {
  const P = curPlan(d), day = TRIP.days[d - 1], m = modeOf(d), v = variant(d, m); if (!P) return '';
  const rows = P.rows.map(r => {
    if (r.k === 'drive') return `<li class="drive"><span class="tt">${r.t}</span><span><b>${esc(T('Drive to {0}', T(r.to)))}</b><br><span class="meta">${r.km} km · ${durTxt(r.min)} · ${esc(T(r.roads))} · ${T('arr. {0}', r.arr)}</span>` +
      `<span class="tags"><span class="tag">${T(KINDT[r.kind] || 'Road')}</span>${(r.light || []).filter((c, i, a) => a.indexOf(c) === i && LT[c]).map(c => `<span class="tag ${LTAG(c)}">${T(LT[c][0])}</span>`).join('')}</span></span></li>`;
    if (r.k === 'stop') return `<li class="stop"><span class="tt">${r.t}</span><span><b>${esc(T(r.name))}</b>${r.note ? `<br><span class="meta">${esc(T(r.note))}</span>` : ''}<span class="tags"><span class="tag ${r.mo === 'M' ? 'must' : 'opt'}">${T(r.mo === 'M' ? 'Must' : 'Optional')}</span>${r.min ? `<span class="tag">${durTxt(r.min)}</span>` : ''}</span></span></li>`;
    if (r.k === 'border') return `<li class="stop"><span class="tt">${r.t}</span><span><b>${esc(T(r.name))}</b><br><span class="meta">${T('Allow {0} min', r.min)}</span></span></li>`;
    if (r.k === 'tz') return `<li class="stop"><span class="tt">${r.t}</span><span><b>${esc(T(r.name))}</b></span></li>`;
    return '';
  }).join('');
  const flags = (v ? v.flags : day.flags) || [];
  const off = offOf(d);
  return `<div class="block">${gaugeHtml(P, isToday(d) ? nowMin() : null)}` +
    (off ? `<p class="stylenote">${T('Re-timed from your real start ({0} {1}).', off > 0 ? '+' : '−', fmtDur(Math.abs(off)))}</p>` : '') + `</div>` +
    `<div class="block"><ol class="tl">${rows}<li class="end"><span class="tt">${P.end}</span><span><b>${T('Day ends')}</b></span></li></ol></div>` +
    (flags.length ? `<div class="block"><h3>${T('Good to know')}</h3>${flags.map(f => `<p class="small">${esc(T(f))}</p>`).join('')}</div>` : '') +
    `<a class="btn" href="${gmapsDay(d)}" target="_blank" rel="noopener">${esc(T('Whole day in Google Maps'))}</a>`;
}
const TAGN = { start: 'Start', stop: 'Stop', road: 'On the road', sleep: 'Overnight', visit: 'Visit, no car', end: 'Finish' };
function stopsTab(d) {
  const day = TRIP.days[d - 1], seq = stopsFor(day, modeOf(d)).filter(s => s.t !== 'via');
  let h = `<div class="block"><ul class="stops">` + seq.map(s => {
    const ph = s.p && PHOTOS[s.p] && PHOTOS[s.p].t;
    return `<li class="stop">` + (ph ? `<button type="button" class="ph" style="background-image:url('${IMG(s.p + '-t.jpg')}')" data-lbkey="${s.p}" data-lbcap="${esc(T(s.n))}" aria-label="${esc(T('Enlarge photo: {0}', T(s.n)))}"></button>` : `<span class="ph none" aria-hidden="true">${ICON.pin}</span>`) +
      `<div><p class="nm">${esc(T(s.n))}</p><p class="kind">${T(TAGN[s.t] || 'Stop')}</p>${s.note ? `<p class="nt">${esc(T(s.note))}</p>` : ''}<div class="links">` +
      (s.t !== 'visit' && s.t !== 'start' ? `<a href="${wazeLL(s.lat, s.lon)}" target="_blank" rel="noopener">Waze</a>` : '') +
      (s.w ? `<a href="https://en.wikipedia.org/wiki/${encodeURIComponent(s.w).replace(/%2C/g, ',')}" target="_blank" rel="noopener">Wikipedia</a>` : '') + `</div></div></li>`;
  }).join('') + `</ul></div>`;
  const g = GAL[d];
  if (g && g.items.length) {
    h += `<div class="block"><h3>${T('Photos')}</h3><div class="strip">` + g.items.map((it, i) =>
      `<button type="button" data-gal="${d}:${i}" aria-label="${esc(T('{0}, photo {1} of {2}', T(it.label), i + 1, g.items.length))}"><span class="tile" style="background-image:url('${BASE}${g.sprite}');background-position:${-i * 132}px 0;background-size:${g.items.length * 132}px 99px"></span><small>${esc(T(it.label))}</small></button>`).join('') + `</div></div>`;
  }
  const pk = PARK[d] || [];
  if (pk.length) h += `<div class="block"><h3>${T('Parking and stops on the road')}</h3><ul class="park">` + pk.map(p => {
    const [b0, k0] = KIND[p.k] || KIND.park;
    return `<li><span class="pb ${p.k}">${esc(T(b0))}</span><div><p><b>${esc(T(p.n))}</b></p><p class="small muted">${esc(T(p.at))} · ${esc(T(k0))}${p.v ? '' : ' · ' + T('Check on arrival')}</p><p class="small">${esc(T(p.note))}</p>` +
      `<div class="links"><a href="${mapsQ(p.q)}" target="_blank" rel="noopener">Google Maps</a><a href="${wazeQ(p.q)}" target="_blank" rel="noopener">Waze</a>${p.src ? `<a href="${p.src}" target="_blank" rel="noopener">${T('Source')}</a>` : ''}</div></div></li>`;
  }).join('') + `</ul></div>`;
  return h;
}
function weatherTab(d) {
  return `<div class="block wx-slot">${verdictHtml(d)}${forecastHtml(d)}${hotHtml(d)}${climateHtml(d)}</div>` +
    `<details class="block"><summary>${T('How the weather check decides when to take the Safe route')}</summary><ul class="small">` +
    ['Every risky stretch of the day (passes, cliff roads, fog plains, bora and mistral corridors) is checked for the time you would pass it.',
     'Snow falling or settling, freezing rain, or ice on a pass or minor road: take the Safe route.',
     'Fog thick enough to drive in it for long stretches, or gusts above about 70 km/h on an exposed road: take the Safe route.',
     'Heavy rain on cliff roads with rockfall, or an official red weather alert: take the Safe route, or wait if the alert covers every road.',
     'If the Safe route is affected too: leave later, wait for the snowploughs or the fog to lift, or as a last resort add a night. Overnight towns are never changed for you.',
     'Snow forecasts are reliable about 2–3 days ahead and fog is hard to forecast, so the final call is the evening before and the morning itself.'].map(x => `<li>${T(x)}</li>`).join('') + `</ul></details>`;
}
function newsTab(d) {
  return `<div class="block">${BUL[d] ? bulDayHtml(d, false) : watchHtml(d)}</div>`;
}
function renderDay() {
  const d = VIEW.d || 1, day = TRIP.days[d - 1], P = curPlan(d), tab = VIEW.tab || 'plan';
  const hero = day.hero && PHOTOS[day.hero] && PHOTOS[day.hero].h;
  let h = `<div class="stepper"><button type="button" data-openstep="-1" aria-label="${esc(T('Previous day'))}"${d <= 1 ? ' disabled' : ''}>‹</button><span class="label">${esc(T('Day {0} of 16', d))} · ${fmtDate(PLAN[d].date)}</span>` +
    `<button type="button" data-openstep="1" aria-label="${esc(T('Next day'))}"${d >= 16 ? ' disabled' : ''}>›</button></div>`;
  if (hero) h += `<div class="hero" style="background-image:url('${IMG(day.hero + '-h.jpg')}')"><button type="button" data-lbkey="${day.hero}" data-lbcap="${esc(T(day.heroAlt || day.title))}" aria-label="${esc(T('Enlarge photo: {0}', T(day.heroAlt || day.title)))}"></button></div>`;
  h += `<div class="dhead">${stone(d, true)}<div><h1>${esc(T(day.title))}</h1><p class="when">${esc(T(day.from))} → ${esc(T(day.to))} · ${T('Sleep')}: ${esc(T(day.sleep))}</p></div></div>`;
  if (drives(d)) {
    h += styleSeg(d);
    h += `<div class="stats"><div><b>${P.km}</b><span>km</span></div><div><b>${esc(P.drive)}</b><span>${T('driving')}</span></div><div><b>${P.start}</b><span>${T('leave')}</span></div><div><b>${lastArr(P)}</b><span>${T('arrive')}</span></div></div>`;
  }
  const TABS = [['plan', T('Plan')], ['stops', T('Stops')], ['weather', T('Weather')], ['news', T('News')]];
  h += `<div class="dtabs" role="tablist">` + TABS.map(([k, l]) => `<button type="button" role="tab" aria-selected="${k === tab}" data-dtab="${k}">${esc(l)}</button>`).join('') + `</div>`;
  h += `<div role="tabpanel" class="view" style="padding-top:0">${tab === 'plan' ? (drives(d) ? planTab(d) : `<div class="block"><p>${T('No driving today; the car stays parked.')}</p></div>`) : tab === 'stops' ? stopsTab(d) : tab === 'weather' ? weatherTab(d) : newsTab(d)}</div>`;
  main.innerHTML = h;
}

/* ---------- Map ---------- */
let mapBuilt = null, mapVB = [0, 0, MAP.W, MAP.H];
function buildMap() {
  const pts = line => line.map(p => p.join(',')).join(' ');
  let s = MAP.shapes.map(x => `<path class="c-land${x.on ? ' on' : ''}" d="${x.d}"/>`).join('') + `<g id="ctx"></g>`;
  s += MAP.labels.map(l => `<text class="${l.k === 's' ? 'm-sea' : 'm-label'}" x="${l.xy[0]}" y="${l.xy[1]}">${esc(T(l.t))}</text>`).join('');
  for (const D of DAYS) {
    if (D.line.length < 2) continue;
    s += `<g class="r-day" data-day="${D.d}" data-mode="${modeOf(D.d)}">`;
    for (const g of groupsOf(D.d)) {
      const ls = legsFor(D.d, g.m), legs = ls && ls.length ? ls : [{ r: 1, pts: D.line }];
      s += `<g data-ms="${g.ms}">` + legs.map(l => `<polyline class="r-base${l.r ? '' : ' r-local'}" points="${pts(l.pts)}"/>`).join('') + `</g>`;
    }
    for (const st of D.stops) if (st.t === 'stop' || st.t === 'road') s += `<circle class="m-stop" data-ms="${stopModes(D.d, st.n)}" cx="${st.xy[0]}" cy="${st.xy[1]}" r="3.5"/>`;
    for (const [mk, list] of Object.entries(D.mstops || {})) for (const st of list) s += `<circle class="m-stop" data-ms="${mk}" cx="${st.xy[0]}" cy="${st.xy[1]}" r="3.5"/>`;
    for (const st of D.stops) s += `<text class="m-name" data-ms="${stopModes(D.d, st.n)}" x="${st.xy[0]}" y="${st.xy[1]}" dx="0.8em" dy="-0.6em">${esc(T(st.n))}</text>`;
    s += `</g>`;
  }
  const sleeps = new Map();
  for (const D of DAYS) for (const st of D.stops) if (st.t === 'sleep' || st.t === 'end' || (st.t === 'start' && D.d === 1)) {
    const k = st.xy.join(','); if (!sleeps.has(k)) sleeps.set(k, { xy: st.xy, days: [], start: st.t === 'start' });
    if (st.t !== 'start') sleeps.get(k).days.push(D.d);
  }
  for (const g of sleeps.values()) {
    const lab = g.start ? 'S' : g.days.length > 1 ? `${g.days[0]}–${g.days[g.days.length - 1]}` : String(g.days[0]);
    s += `<g class="m-sleep" data-open="${g.start ? 1 : g.days[0]}" role="button" tabindex="0"><circle cx="${g.xy[0]}" cy="${g.xy[1]}" r="${lab.length > 2 ? 11 : 8.5}"/><text x="${g.xy[0]}" y="${g.xy[1]}">${lab}</text></g>`;
  }
  s += `<g class="me" id="me"></g>`;
  return s;
}
function setVB(v) { mapVB = v; const m = $('#map'); if (m) { m.setAttribute('viewBox', v.map(x => x.toFixed(1)).join(' ')); m.classList.toggle('zoomed', v[2] < MAP.W * .45); } }
function dayVB(d) {
  const D = DAYS.find(x => x.d === d); if (!D) return [0, 0, MAP.W, MAP.H];
  const ps = (legsFor(d, modeOf(d)) || []).flatMap(l => l.pts).concat(D.stops.map(s => s.xy));
  let x0 = Math.min(...ps.map(p => p[0])), x1 = Math.max(...ps.map(p => p[0])), y0 = Math.min(...ps.map(p => p[1])), y1 = Math.max(...ps.map(p => p[1]));
  const pad = 40, w = Math.max(160, x1 - x0 + pad * 2), hgt = Math.max(160, y1 - y0 + pad * 2), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const box = document.getElementById('map'), ar = box ? box.clientWidth / box.clientHeight : 1;
  let W2 = w, H2 = hgt; if (W2 / H2 < ar) W2 = H2 * ar; else H2 = W2 / ar;
  return [cx - W2 / 2, cy - H2 / 2, W2, H2];
}
function renderMap() {
  const sel = VIEW.mapDay || 0;
  main.innerHTML = `<div class="mapdays" role="group" aria-label="${esc(T('Day'))}"><button type="button" data-mapday="0" aria-pressed="${sel === 0}">${T('All days')}</button>` +
    TRIP.days.map(d => `<button type="button" data-mapday="${d.d}" aria-pressed="${sel === d.d}">${d.d}</button>`).join('') + `</div>` +
    `<div class="mapwrap"><svg id="map" class="${sel ? 'dim' : ''}" viewBox="0 0 ${MAP.W} ${MAP.H}" role="img" aria-label="${esc(T('Route map'))}">${buildMap()}</svg>` +
    `<div class="mapctl"><button type="button" data-zoom="0.7" aria-label="Zoom in">+</button><button type="button" data-zoom="1.4" aria-label="Zoom out">−</button></div></div>` +
    (sel ? `<button type="button" class="btn" data-open="${sel}">${esc(T('Open the day'))}: ${esc(T(TRIP.days[sel - 1].from))} → ${esc(T(TRIP.days[sel - 1].to))}</button>` : `<p class="note">${T('Tap a day number, or an overnight stop on the map.')}</p>`);
  const svg = $('#map');
  if (sel) svg.querySelectorAll('.r-day').forEach(g => g.classList.toggle('sel', +g.dataset.day === sel));
  setVB(sel ? dayVB(sel) : [0, 0, MAP.W, MAP.H]);
  drawMe();
  if (MAPX) fillCtx(); else fetch(BASE + 'map-extra.json').then(r => r.ok ? r.json() : null).then(X => { if (X) { MAPX = X; fillCtx(); } }).catch(() => {});
  // drag to pan, pinch to zoom
  const ptrs = new Map(); let p0 = null, d0 = null;
  const sp = (x, y) => { const r = svg.getBoundingClientRect(); return [mapVB[0] + (x - r.left) / r.width * mapVB[2], mapVB[1] + (y - r.top) / r.height * mapVB[3]]; };
  svg.addEventListener('pointerdown', e => { svg.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]); if (ptrs.size === 1) p0 = { x: e.clientX, y: e.clientY, vb: mapVB.slice(), moved: false }; if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; d0 = { dist: Math.hypot(a[0] - b[0], a[1] - b[1]), vb: mapVB.slice(), c: sp((a[0] + b[0]) / 2, (a[1] + b[1]) / 2) }; } });
  svg.addEventListener('pointermove', e => {
    if (!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId, [e.clientX, e.clientY]);
    const r = svg.getBoundingClientRect();
    if (ptrs.size === 2 && d0) { const [a, b] = [...ptrs.values()], f = d0.dist / Math.max(20, Math.hypot(a[0] - b[0], a[1] - b[1])); const w = Math.min(MAP.W * 1.2, Math.max(80, d0.vb[2] * f)), hh = w * d0.vb[3] / d0.vb[2]; setVB([d0.c[0] - (d0.c[0] - d0.vb[0]) * w / d0.vb[2], d0.c[1] - (d0.c[1] - d0.vb[1]) * hh / d0.vb[3], w, hh]); if (p0) p0.moved = true; return; }
    if (p0) { const dx = (e.clientX - p0.x) / r.width * p0.vb[2], dy = (e.clientY - p0.y) / r.height * p0.vb[3]; if (Math.abs(e.clientX - p0.x) + Math.abs(e.clientY - p0.y) > 6) p0.moved = true; setVB([p0.vb[0] - dx, p0.vb[1] - dy, p0.vb[2], p0.vb[3]]); }
  });
  const up = e => { ptrs.delete(e.pointerId); if (ptrs.size < 2) d0 = null; };
  svg.addEventListener('pointerup', e => { const moved = p0 && p0.moved; up(e); if (!ptrs.size) { if (!moved) { const t = document.elementFromPoint(e.clientX, e.clientY); const o = t && t.closest('[data-open]'); if (o) openDay(+o.dataset.open); } p0 = null; } });
  svg.addEventListener('pointercancel', up);
}
let MAPX = null;
function fillCtx() {
  const X = MAPX, ctx = document.getElementById('ctx'); if (!X || !ctx) return;
  const CLS = { motorway: 'mw', main: 'main', minor: 'minor', ferry: 'ferry' };
  ctx.innerHTML = `<path class="ctx-lake" d="${X.lakes}"/><path class="ctx-river" d="${X.rivers}"/>` +
    (X.roadGroups || []).filter(r => r.c === 'motorway' || r.c === 'main').map(r => `<path class="rd rd-${CLS[r.c]}" d="${r.d}"/>`).join('') +
    (X.towns || []).filter(t => t.t <= 1).map(t => `<g class="town t${t.t}"><circle cx="${t.xy[0]}" cy="${t.xy[1]}" r="1.4"/><text x="${t.xy[0]}" y="${t.xy[1]}" dx="0.5em" dy="0.35em">${esc(T(t.n))}</text></g>`).join('');
}
let WHERE = { ll: null };
function drawMe() {
  const g = document.getElementById('me'); if (!g) return;
  if (!WHERE.ll) { g.innerHTML = ''; return; }
  const [x, y] = toXY(WHERE.ll);
  g.innerHTML = `<circle class="pulse" cx="${x}" cy="${y}" r="12"/><circle class="dot" cx="${x}" cy="${y}" r="5"/>`;
}

/* ---------- record sheet, style sheet ---------- */
const overlay = $('#overlay');
function closeSheet() { overlay.innerHTML = ''; }
function sheet(inner) { overlay.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true"><span class="grab" aria-hidden="true"></span>${inner}</div>`; const f = overlay.querySelector('button, select, a'); if (f) f.focus({ preventScroll: true }); }
const FAB = { d: null, msg: '' };
function fabResult(d) {
  const g = PROG[d]; if (!g || !g.last) return '';
  const t = new Date(g.last.at).toTimeString().slice(0, 5), rel = g.last.rel || 0;
  const st = g.arrived ? T('Arrived {0}.', t) : rel > 5 ? T('now {0} behind.', fmtDur(rel)) : rel < -5 ? T('now {0} ahead.', fmtDur(-rel)) : T('on time');
  return esc(T('Location recorded at {0}.', t) + ' ' + st.charAt(0).toUpperCase() + st.slice(1));
}
function recordSheet() {
  const d = FAB.d || VIEW.d || fabDay(), g = PROG[d];
  const opts = TRIP.days.filter(x => drives(x.d)).map(x => `<option value="${x.d}"${x.d === d ? ' selected' : ''}>${esc(T('Day {0}', x.d) + ' · ' + fmtDate(PLAN[x.d].date) + ' · ' + T(x.from) + ' → ' + T(x.to))}</option>`).join('');
  const state = !g || !g.started ? T('Not started yet: recording also starts the day from where you are.') : g.arrived ? T('Day {0} done', d) : T('Under way since {0}.', hhmm(g.startMin));
  sheet(`<h2>${T('Record location')}<button type="button" class="iconbtn" data-close aria-label="${esc(T('Close'))}">✕</button></h2>` +
    `<select data-fabday aria-label="${esc(T('Day'))}">${opts}</select><p class="muted">${state}</p>` +
    (GEO_BLOCKED ? `<p>${T('Location is blocked inside the Claude app. Open the home-screen app for real GPS, or pick where you are:')}</p><a class="btn primary" href="${APP_URL}v2/" target="_blank" rel="noopener">${T('Open the home-screen app')}</a>` +
      `<select data-lpick="${d}" aria-label="${esc(T('Pick where you are'))}"><option value="">—</option>${placesFor(d).map((c, i) => `<option value="${i}">${esc(c.label)}</option>`).join('')}</select>`
      : `<button type="button" class="btn rec" data-rec="${d}"${g && g.arrived ? ' disabled' : ''}>${ICON.pin} ${T('Record my location now')}</button>`) +
    `<p class="recline" id="recmsg" aria-live="polite">${FAB.msg}</p><button type="button" class="btn" data-open="${d}" data-close>${esc(T('See details on Day {0}', d))}</button>`);
}
function styleSheet(d) {
  const m = modeOf(d);
  sheet(`<h2>${T('Route for this day:')}<button type="button" class="iconbtn" data-close aria-label="${esc(T('Close'))}">✕</button></h2><div class="stylelist">` +
    MK.map(x => { const P = planFor(d, x), own = hasMode(d, x);
      return `<button type="button" data-setmode="${d}:${x}" data-close aria-pressed="${x === m}"><b>${T(MODE_NAME[x])}</b><span>${T(MODE_DESC[x])}</span>` +
        `<span>${own ? T('{0} driving, last arrival {1}.', fmtDur(durMin(P)), lastArr(P)) : esc(T('{0} uses the same roads as Balanced on this day.', T(MODE_NAME[x])))}</span></button>`; }).join('') + `</div>`);
}
function record(d) {
  FAB.d = d; FAB.msg = esc(T('Finding your position…'));
  const msg = document.getElementById('recmsg'); if (msg) msg.innerHTML = FAB.msg;
  getPos().then(pos => {
    if (!PROG[d] || !PROG[d].started) { const sp = chainFor(d, modeOf(d))[0]; startDay(d, pos, havLL(sp.ll, pos.ll) > 15); }
    else doCheck(d, pos, false);
    FAB.msg = fabResult(d);
    try { if (navigator.vibrate) navigator.vibrate(60); } catch (e) {}
    refresh();
  }).catch(err => { if (err && err.code === 1) markBlocked(); FAB.msg = esc(posErr(err)); refresh(); });
}

/* ---------- hooks used by the shared code ---------- */
function renderLive() { refresh(); }
function rerenderSched() { refresh(); }
function renderAllLive() { refresh(); }
function alertMe(text) { $('#toasttext').innerHTML = text; $('#toast').hidden = false; try { if (navigator.vibrate) navigator.vibrate([150, 80, 150]); } catch (e) {} }
$('#toastclose').addEventListener('click', () => { $('#toast').hidden = true; });
let wxAlerted = false;
function wxAlert() {
  if (wxAlerted) return;
  const iso = x => x.toISOString().slice(0, 10), now = new Date(), days = [iso(now), iso(new Date(now.getTime() + 864e5))];
  for (const day of TRIP.days) {
    const w = WX[day.d], v = wxVerdict(day.d), P = PLAN[day.d];
    if (!v || !w || w.mode !== 'forecast' || !P || !days.includes(P.date)) continue;
    if ((v.level === 'switch' && modeOf(day.d) !== 'safe' && hasMode(day.d, 'safe')) || v.level === 'wait') {
      wxAlerted = true;
      alertMe(`${T('Day {0}', day.d)}: ${v.level === 'wait' ? T('Weather check: no safe road at the planned time') : T('Weather check: take the Safe route')} <a href="#/day/${day.d}/weather">${T('Open the day')}</a>`);
      return;
    }
  }
}

/* ---------- theme ---------- */
let THEME = 'auto';
try { THEME = localStorage.getItem('w123v2-theme') || 'auto'; } catch (e) {}
function applyTheme() {
  const r = document.documentElement;
  if (THEME === 'auto') r.removeAttribute('data-theme'); else r.dataset.theme = THEME;
  // automatic night: after dusk or before sunrise on a trip day
  const d = tripDayNow(), P = PLAN[d], n = nowMin();
  r.dataset.autoNight = THEME === 'auto' && P && (n > pm(P.dusk) || n < pm(P.sunrise) - 20) ? '1' : '0';
  $('#theme').textContent = THEME === 'night' ? '☾' : THEME === 'day' ? '☀' : 'A';
  $('#theme').title = T(THEME === 'night' ? 'Night display' : THEME === 'day' ? 'Day display' : 'Automatic: night display after dark');
}
$('#theme').addEventListener('click', () => { THEME = THEME === 'auto' ? 'night' : THEME === 'night' ? 'day' : 'auto'; try { localStorage.setItem('w123v2-theme', THEME); } catch (e) {} applyTheme(); });
setInterval(applyTheme, 5 * 60e3);

/* ---------- router ---------- */
function parseHash() {
  const h = location.hash.replace(/^#\/?/, '').split('/');
  if (h[0] === 'day' && +h[1] >= 1 && +h[1] <= 16) Object.assign(VIEW, { name: 'day', d: +h[1], tab: ['plan', 'stops', 'weather', 'news'].includes(h[2]) ? h[2] : 'plan' });
  else if (h[0] === 'days') VIEW.name = 'days';
  else if (h[0] === 'map') { VIEW.name = 'map'; VIEW.mapDay = +h[1] || 0; }
  else { VIEW.name = 'today'; if (+h[1] >= 1 && +h[1] <= 16) VIEW.d = +h[1]; }
}
function go(hash) { if (location.hash !== hash) location.hash = hash; else render(); }
function openDay(d, tab) { closeSheet(); VIEW.d = d; go(`#/day/${d}/${tab || 'plan'}`); }
function renderTabs() {
  const cur = VIEW.name === 'day' ? 'days' : VIEW.name;
  tabsEl.innerHTML = [['today', T('Today'), ICON.today, '#/today'], ['days', T('Days'), ICON.days, '#/days'], ['map', T('Map'), ICON.map, '#/map']]
    .map(([k, l, ic, href]) => `<button type="button" class="tab" data-go="${href}"${cur === k ? ' aria-current="page"' : ''}>${ic}<span>${esc(l)}</span></button>`).join('') +
    `<button type="button" class="tab rec" data-recsheet>${ICON.pin}<span>${esc(T('Record'))}</span></button>`;
}
let lastName = '';
function render() {
  parseHash();
  if (VIEW.name === 'today') renderToday(); else if (VIEW.name === 'days') renderDays(); else if (VIEW.name === 'day') renderDay(); else renderMap();
  renderTabs();
  if (lastName !== VIEW.name + VIEW.d) { window.scrollTo(0, 0); lastName = VIEW.name + VIEW.d; }
}
function refresh() {
  const y = window.scrollY;
  if (VIEW.name === 'map') { drawMe(); } else render();
  window.scrollTo(0, y);
  if (overlay.innerHTML && overlay.querySelector('[data-fabday]')) recordSheet();
}
window.addEventListener('hashchange', render);

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const t = e.target;
  const gl = t.closest('[data-go]'); if (gl) { go(gl.dataset.go); return; }
  if (t.closest('[data-recsheet]')) { FAB.msg = ''; FAB.d = VIEW.d || fabDay(); recordSheet(); return; }
  const rc = t.closest('[data-rec]'); if (rc) { record(+rc.dataset.rec); return; }
  const sm = t.closest('[data-setmode]');
  if (sm) {
    const [d, m] = sm.dataset.setmode.split(':'), dn = +d;
    if (m === MODE.global) delete MODE.days[dn]; else MODE.days[dn] = m;
    saveModes(); if (PROG[dn]) { PROG[dn].mode = m; saveProg(dn); }
    if (sm.hasAttribute('data-close')) closeSheet();
    refresh(); return;
  }
  const op = t.closest('[data-open]'); if (op) { openDay(+op.dataset.open, op.dataset.tab); return; }
  if (t.closest('[data-close]')) { closeSheet(); return; }
  const ss = t.closest('[data-stylesheet]'); if (ss) { styleSheet(+ss.dataset.stylesheet); return; }
  const st = t.closest('[data-step]'); if (st) { VIEW.d = Math.max(1, Math.min(16, (VIEW.d || 1) + +st.dataset.step)); go(`#/today/${VIEW.d}`); return; }
  const os = t.closest('[data-openstep]'); if (os) { openDay(Math.max(1, Math.min(16, VIEW.d + +os.dataset.openstep)), VIEW.tab); return; }
  if (t.closest('[data-days]')) { go('#/days'); return; }
  const dt = t.closest('[data-dtab]'); if (dt) { go(`#/day/${VIEW.d}/${dt.dataset.dtab}`); return; }
  const md = t.closest('[data-mapday]'); if (md) { go(md.dataset.mapday === '0' ? '#/map' : `#/map/${md.dataset.mapday}`); return; }
  const zm = t.closest('[data-zoom]'); if (zm) { const f = +zm.dataset.zoom, v = mapVB, w = Math.min(MAP.W * 1.2, Math.max(80, v[2] * f)), h = w * v[3] / v[2]; setVB([v[0] + (v[2] - w) / 2, v[1] + (v[3] - h) / 2, w, h]); return; }
  const rs = t.closest('[data-reset]'); if (rs) { const d = +rs.dataset.reset; delete PROG[d]; delete LIVE.lastAlert[d]; saveProg(d); WHERE.ll = null; armAuto(); FAB.msg = ''; refresh(); return; }
  const sw = t.closest('[data-lswitch]');
  if (sw) { const [d, m] = sw.dataset.lswitch.split(':'), dn = +d; if (m === MODE.global) delete MODE.days[dn]; else MODE.days[dn] = m; saveModes(); if (PROG[dn]) { PROG[dn].mode = m; saveProg(dn); } refresh(); return; }
  const lk = t.closest('[data-lbkey]'); if (lk) { lbOpen([{ src: IMG(lk.dataset.lbkey + '-h.jpg'), alt: IMG(lk.dataset.lbkey + '-t.jpg'), label: lk.dataset.lbcap, f: PHOTOS[lk.dataset.lbkey] && PHOTOS[lk.dataset.lbkey].f }], 0); return; }
  const ga = t.closest('[data-gal]'); if (ga) { const [d, i] = ga.dataset.gal.split(':').map(Number); lbOpen(GAL[d].items.map(it => ({ src: BASE + 'g/' + it.base + '.jpg', label: T(it.label), f: it.f })), i); return; }
  const lb = t.closest('[data-lb]'); if (lb) { const n = +lb.dataset.lb; if (!n) $('#lb').close(); else { LB.i = (LB.i + n + LB.items.length) % LB.items.length; lbShow(); } return; }
});
document.addEventListener('change', e => {
  const t = e.target;
  const fd = t.closest('[data-fabday]'); if (fd) { FAB.d = +fd.value; FAB.msg = ''; recordSheet(); return; }
  const li = t.closest('[data-lint]'); if (li) { const d = +li.dataset.lint; INTV[d] = +li.value; saveIntv(); LIVE.lastAuto[d] = Date.now(); armAuto(); return; }
  const pk = t.closest('[data-lpick]');
  if (pk && pk.value !== '') { const d = +pk.dataset.lpick, idx = +pk.value, c = placesFor(d)[idx]; if (!c) return; const pos = { ll: c.ll.slice(), acc: null }; if (!PROG[d] || !PROG[d].started) startDay(d, pos, idx !== 0); else doCheck(d, pos, false); FAB.d = d; FAB.msg = fabResult(d); refresh(); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.innerHTML) closeSheet(); });

/* ---------- lightbox ---------- */
const LB = { items: [], i: 0 };
function lbShow() { const it = LB.items[LB.i]; $('#lbimg').style.backgroundImage = `url('${it.src}')${it.alt ? `, url('${it.alt}')` : ''}`; $('#lbcap').innerHTML = esc(it.label || '') + (it.f ? ` <a href="${commons(it.f)}" target="_blank" rel="noopener">${T('Photo credit')}</a>` : ''); }
function lbOpen(items, i) { LB.items = items; LB.i = i; lbShow(); const dl = $('#lb'); if (dl.showModal) dl.showModal(); else dl.setAttribute('open', ''); }

/* ---------- language ---------- */
$('#lang').innerHTML = LANGS.map(([k, n]) => `<option value="${k}"${k === LANG ? ' selected' : ''}>${n}</option>`).join('');
$('#lang').addEventListener('change', e => { try { localStorage.setItem('w123-lang', e.target.value); } catch (x) {} location.hash = ''; location.reload(); });

/* ---------- modes saved (shared with V1) ---------- */
async function saveModes() {
  try { localStorage.setItem('w123-mode', JSON.stringify(MODE)); } catch (e) {}
  if (!dbRef || !canSaveShared) return;
  try { await dbRef.doc('prefs/route').set({ global: MODE.global, days: { ...MODE.days }, updated: new Date().toISOString() }); } catch (e) {}
}

/* ---------- data: Claude database when inside Claude, files next to the site otherwise ---------- */
(async () => {
  const C = window.claude; let db = null; try { db = C && C.use ? await C.use('db') : null; } catch (e) { db = null; }
  if (!db) {
    if (SITE) siteLoop(async () => {
      const [b, w] = await Promise.all([siteLoad('bulletins'), siteLoad('weather')]);
      if (Object.keys(b).length || !Object.keys(BUL).length) BUL = b;
      if (Object.keys(w).length || !Object.keys(WX).length) WX = w;
      refresh(); wxAlert();
    });
    return;
  }
  dbRef = db;
  try { const u = await C.use('user'); canSaveShared = !!(u && await u.canEdit()); } catch (e) { canSaveShared = false; }
  db.collection('bulletins').onSnapshot(snap => { const n = {}; for (const doc of snap.docs) { const x = doc.data(); if (x && +x.d >= 1 && +x.d <= 16) n[+x.d] = x; } BUL = n; refresh(); }, () => {});
  db.collection('weather').onSnapshot(snap => { const n = {}; for (const doc of snap.docs) { const x = doc.data(); if (x && +x.d >= 1 && +x.d <= 16) n[+x.d] = x; } WX = n; refresh(); wxAlert(); }, () => {});
  db.doc('prefs/route').onSnapshot(snap => {
    if (!snap.exists) return; const x = snap.data() || {}; if (!MK.includes(x.global)) return;
    const n = { global: x.global, days: { ...(x.days || {}) } }; if (JSON.stringify(n) === JSON.stringify(MODE)) return;
    MODE = n; try { localStorage.setItem('w123-mode', JSON.stringify(MODE)); } catch (e) {} refresh();
  }, () => {});
})();

$('#lang').setAttribute('aria-label', T('Language')); $('#theme').setAttribute('aria-label', T('Day or night display')); tabsEl.setAttribute('aria-label', T('Sections'));
/* ---------- start ---------- */
{ const lastD = Object.keys(PROG).map(Number).filter(d => PROG[d] && PROG[d].last).sort((a, b) => b - a)[0]; if (lastD) WHERE.ll = PROG[lastD].last.ll; }
applyTheme();
render();
armAuto();
