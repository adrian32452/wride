"""Route every leg along the Natural Earth road network.
Writes mapdata/routed.json: per day, legs with coords, the roads used (name, km, class, country), time at W123 pace,
and one computed alternative (avoid motorways on transit legs, motorway-first on scenic legs)."""
import json, math, os, sys
import networkx as nx
from scipy.spatial import cKDTree
from shapely.geometry import LineString, Point, shape
from shapely.ops import unary_union
from shapely import STRtree, segmentize

S = os.path.dirname(os.path.abspath(__file__))
roads = json.load(open(f"{S}/ne/ne_10m_roads.geojson"))
trip = json.load(open(f"{S}/mapdata/trip.json"))
countries = json.load(open(f"{S}/ne/countries.geojson"))

LON0, LON1, LAT0, LAT1 = -9.5, 28.5, 39.0, 48.5
def hav(a, b):
    R = 6371.0
    la1, lo1, la2, lo2 = map(math.radians, (a[1], a[0], b[1], b[0]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * R * math.asin(math.sqrt(h))

def cls(p):
    t = p.get("type")
    if t and t.startswith("Ferry"): return None
    if p.get("expressway") == 1 or t in ("Major Highway", "Beltway"): return "mw"
    if t == "Secondary Highway": return "main"
    return "minor"
def rname(p, cc=None):
    loc, lab = p.get("local") or p.get("label2"), p.get("label")
    parts = [x for x in (loc, lab) if x]
    return " · ".join(dict.fromkeys(parts)) if parts else None
def prefix(name, cc):
    if not name: return name
    out = []
    for part in name.split(" · "):
        if part.isdigit() or (part[:-1].isdigit() and part[-1].isalpha()):
            part = {"Romania": "DN", "Serbia": "State road ", "Croatia": "D", "Slovenia": "G", "Italy": "SS", "France": "N", "Spain": "N-"}.get(cc, "") + part
        elif cc == "Italy" and part.startswith("S") and part[1:].isdigit(): part = "SS" + part[1:]
        out.append(part)
    return " · ".join(dict.fromkeys(out))

COST = {"transit": {"mw": 1.0, "main": 1.25, "minor": 1.5},
        "scenic":  {"mw": 1.6, "main": 1.0, "minor": 1.0},
        "nomw":    {"mw": 3.0, "main": 1.0, "minor": 1.1}}
SPEED = {"mw": 92, "main": 62, "minor": 48}   # W123 300D realistic averages, km/h

# country polygons for tagging
cgeoms = [(f["properties"]["name"], shape(f["geometry"])) for f in countries["features"] if f.get("geometry")]
ctree = STRtree([g for _, g in cgeoms])
def country_of(pt):
    for i in ctree.query(pt):
        if cgeoms[i][1].contains(pt): return cgeoms[i][0]
    return None

G = {m: nx.Graph() for m in COST}
key = lambda c: (round(c[0], 4), round(c[1], 4))
nodes = {}
def add_line(coords, c, meta):
    for a, b in zip(coords, coords[1:]):
        ka, kb = key(a), key(b)
        if ka == kb: continue
        d = hav(a, b)
        nodes[ka] = a; nodes[kb] = b
        for m in G:
            w = d * COST[m][c]
            if not G[m].has_edge(ka, kb) or G[m][ka][kb]["weight"] > w:
                G[m].add_edge(ka, kb, weight=w, km=d, c=c, meta=meta)

lines, props = [], []
for f in roads["features"]:
    g = f["geometry"]
    if not g: continue
    c = cls(f["properties"])
    if c is None: continue
    ls = [g["coordinates"]] if g["type"] == "LineString" else g["coordinates"] if g["type"] == "MultiLineString" else []
    for ln in ls:
        if len(ln) > 1 and any(LON0 < x < LON1 and LAT0 < y < LAT1 for x, y in ln):
            lines.append(LineString(ln)); props.append((c, rname(f["properties"])))
noded = unary_union(lines)
pieces = list(noded.geoms) if hasattr(noded, "geoms") else [noded]
ltree = STRtree(lines)
rank = {"mw": 0, "main": 1, "minor": 2}
METAS = []          # [name, class, country]
meta_idx = {}
for pc in pieces:
    mid = pc.interpolate(0.5, normalized=True)
    idx = ltree.query(mid.buffer(1e-6))
    if len(idx):
        best = min(idx, key=lambda i: rank[props[i][0]])
        c = props[best][0]
        name = next((props[i][1] for i in sorted(idx, key=lambda i: rank[props[i][0]]) if props[i][1]), None)
    else:
        c, name = "minor", None
    cc = country_of(mid)
    m = (prefix(name, cc), c, cc)
    if m not in meta_idx: meta_idx[m] = len(METAS); METAS.append(list(m))
    add_line(list(segmentize(pc, 0.01).coords), c, meta_idx[m])
print("pieces", len(pieces), "metas", len(METAS), file=sys.stderr)

keys = list(nodes.keys())
pts = [(nodes[k][0] * math.cos(math.radians(nodes[k][1])), nodes[k][1]) for k in keys]
tree = cKDTree(pts)
deg = {k: G["transit"].degree(k) for k in keys}
for i, k in enumerate(keys):
    if deg[k] > 1: continue
    for j in tree.query_ball_point(pts[i], r=0.035):
        if j == i: continue
        k2 = keys[j]
        if G["transit"].has_edge(k, k2): continue
        d = hav(nodes[k], nodes[k2])
        nb = next(iter(G["transit"][k]), None)
        cc, mm = (G["transit"][k][nb]["c"], G["transit"][k][nb]["meta"]) if nb else ("minor", None)
        for m in G: G[m].add_edge(k, k2, weight=d * 1.5, km=d, c=cc, meta=mm)

comp = max(nx.connected_components(G["transit"]), key=len)
ckeys = [k for k in keys if k in comp]
cpts = [(nodes[k][0] * math.cos(math.radians(nodes[k][1])), nodes[k][1]) for k in ckeys]
sktree = cKDTree(cpts)
def snap(lon, lat):
    d, i = sktree.query((lon * math.cos(math.radians(lat)), lat))
    k = ckeys[i]
    return k, hav((lon, lat), nodes[k])

def summarize(g, path):
    roads, by_cls, km = [], {"mw": 0, "main": 0, "minor": 0}, 0
    for a, b in zip(path, path[1:]):
        e = g[a][b]; km += e["km"]; by_cls[e["c"]] += e["km"]
        m = METAS[e["meta"]] if e["meta"] is not None else [None, e["c"], None]
        label = m[0] or {"mw": "Motorway", "main": "Main road", "minor": "Local road"}[m[1]]
        if roads and roads[-1]["n"] == label and roads[-1]["cc"] == m[2]: roads[-1]["km"] += e["km"]
        else: roads.append({"n": label, "km": e["km"], "c": m[1], "cc": m[2]})
    # merge tiny pieces into neighbours, keep the main ones
    roads = [r for r in roads if r["km"] >= 4] or roads[:1]
    merged = []
    for r in roads:
        if merged and merged[-1]["n"] == r["n"] and merged[-1]["cc"] == r["cc"]: merged[-1]["km"] += r["km"]
        else: merged.append(dict(r))
    mins = sum(by_cls[c] / SPEED[c] * 60 for c in by_cls)
    for r in merged: r["km"] = round(r["km"])
    return {"roads": merged[:8], "km": round(km), "mins": round(mins), "mw_share": round(by_cls["mw"] / km, 2) if km else 0}

SCENIC_LEGS = {(2, "Getaria"), (2, "San Sebastián"), (4, "Théoule-sur-Mer"), (5, "Villefranche-sur-Mer"), (5, "Èze"), (5, "Monaco"), (5, "Menton"),
               (7, "Castellina in Chianti"), (7, "Panzano in Chianti"), (7, "Greve in Chianti"), (7, "Figline Valdarno"),
               (9, "Anghiari"), (9, "Bocca Trabaria"), (9, "Urbania"), (9, "San Marino"),
               (15, "Golubac Fortress"), (15, "Lepenski Vir"), (15, "Iron Gates I dam"), (10, "Mogliano Veneto")}

def route_leg(dnum, prev, s, mode, force_local=False, with_alt=True):
    cur = (s["lon"], s["lat"])
    a, da = snap(*prev[0]); b, db = snap(*cur)
    straight = hav(prev[0], cur)
    leg = {"from": prev[1], "to": s["n"], "mode": mode}
    try:
        p = nx.shortest_path(G[mode], a, b, weight="weight")
        coords = [list(prev[0])] + [list(nodes[k]) for k in p] + [list(cur)]
        summ = summarize(G[mode], p)
        ok = da < 15 and db < 15 and summ["km"] < straight * 2.2 + 15 and not (straight < 30 and max(da, db) > 2.5) and not force_local
    except nx.NetworkXNoPath:
        p, ok = None, False
    if ok:
        leg.update(coords=[[round(x, 4), round(y, 4)] for x, y in coords], routed=True, **summ)
        if with_alt:
            amode = "nomw" if mode == "transit" else "transit"
            try:
                q = nx.shortest_path(G[amode], a, b, weight="weight")
                asum = summarize(G[amode], q)
                shared = len(set(zip(p, p[1:])) & set(zip(q, q[1:]))) / max(1, len(p) - 1)
                if shared < 0.75 and asum["km"] <= summ["km"] * 1.35 + 10:
                    acoords = [list(prev[0])] + [list(nodes[k]) for k in q] + [list(cur)]
                    leg["alt"] = dict(label="Avoiding motorways" if amode == "nomw" else "Fastest, using motorways",
                                      coords=[[round(x, 4), round(y, 4)] for x, y in acoords], **asum)
            except nx.NetworkXNoPath:
                pass
    else:
        leg.update(coords=[list(prev[0]), list(cur)], routed=False, km=round(straight * 1.3), mins=round(straight * 1.3 / 45 * 60), roads=[])
    return leg

out, prev, report = {}, None, []
day_start = {}
for day in trip["days"]:
    day_start[day["d"]] = prev
    legs = []
    for s in day["stops"]:
        if s["t"] == "visit": continue
        cur = (s["lon"], s["lat"])
        if prev and hav(prev[0], cur) > 0.5:
            mode = "scenic" if (day["d"], s["n"]) in SCENIC_LEGS else "transit"
            leg = route_leg(day["d"], prev, s, mode, force_local=(day["d"], s["n"]) in {(9, "Urbania")})
            legs.append(leg)
            report.append(f"D{day['d']:>2} {prev[1][:18]:>18} -> {s['n'][:18]:<18} {leg['km']:4} km {leg['mins']:4} min  {'OK ' if leg['routed'] else 'LOCAL'}  roads: {', '.join(r['n'] for r in leg.get('roads', []))[:60]}  alt: {leg['alt']['km'] if 'alt' in leg else '-'}")
        prev = (cur, s["n"])
    out[day["d"]] = legs
json.dump(out, open(f"{S}/mapdata/routed.json", "w"), ensure_ascii=False)

# ---- fastest / cinematic variants (same overnights, so each starts at the previous balanced end) ----
MODES = json.load(open(f"{S}/mapdata/modes.json"))
allstops = {s["n"]: s for d in trip["days"] for s in d["stops"]}
vout = {}
for day in trip["days"]:
    dd = str(day["d"]); vout[dd] = {}
    here = {s["n"]: s for s in day["stops"]}
    for mk in ("fast", "cine", "safe"):
        v = MODES[dd][mk]
        if v.get("same"): continue
        seq = []
        for it in v["stops"]:
            if isinstance(it, str):
                name, _, m = it.partition("|")
                if name not in here: continue          # previous overnight: route starts there anyway
                seq.append({**here[name], "m": m or None})
            else:
                seq.append(it)
        p0 = day_start[day["d"]] or ((seq[0]["lon"], seq[0]["lat"]), seq[0]["n"])
        legs = []
        for s in seq:
            if s.get("t") == "visit": continue
            if hav(p0[0], (s["lon"], s["lat"])) > 0.5:
                mode = "scenic" if s.get("m") == "sc" else "transit"
                legs.append(route_leg(day["d"], p0, s, mode, with_alt=False))
                lg = legs[-1]
                report.append(f"{mk:4} D{day['d']:>2} {p0[1][:18]:>18} -> {s['n'][:18]:<18} {lg['km']:4} km {'OK ' if lg['routed'] else 'LOCAL'} {', '.join(r['n'] for r in lg.get('roads', []))[:60]}")
            p0 = ((s["lon"], s["lat"]), s["n"])
        vout[dd][mk] = legs
json.dump(vout, open(f"{S}/mapdata/routed-modes.json", "w"), ensure_ascii=False)
json.dump(METAS, open(f"{S}/mapdata/road-metas.json", "w"), ensure_ascii=False)
# closure fallback check, Day 15: Belgrade -> Paraćin -> Zaječar -> Negotin -> Iron Gates dam
chk = [((20.461, 44.813), "Belgrade"), ((21.408, 43.861), "Paraćin"), ((22.285, 43.904), "Zaječar"), ((22.530, 44.228), "Negotin"), ((22.530, 44.670), "Iron Gates I dam")]
tot = [0, 0]
for a, b in zip(chk, chk[1:]):
    lg = route_leg(15, a, {"n": b[1], "lon": b[0][0], "lat": b[0][1]}, "transit", with_alt=False); tot[0] += lg["km"]; tot[1] += lg["mins"]
    report.append(f"D15 fallback {a[1]} -> {b[1]} {lg['km']} km {lg['mins']} min {'OK' if lg['routed'] else 'LOCAL'} {', '.join(r['n'] for r in lg.get('roads', []))[:70]}")
report.append(f"D15 fallback total {tot[0]} km {tot[1]} min")
print("\n".join(report))
