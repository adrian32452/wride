"""Phase 2: timed day-by-day plan. Writes plan.json consumed by build.py."""
import json, math, datetime as dt, os

S = os.path.dirname(os.path.abspath(__file__))
START = dt.date(2026, 12, 19)  # Sat 19 Dec 2026 -> Sun 3 Jan 2027

def sunset(lat, lon, date, tz):
    """NOAA approximation, returns local HH:MM."""
    n = date.timetuple().tm_yday
    g = 2 * math.pi / 365 * (n - 1)
    eqt = 229.18 * (0.000075 + 0.001868 * math.cos(g) - 0.032077 * math.sin(g) - 0.014615 * math.cos(2 * g) - 0.040849 * math.sin(2 * g))
    decl = 0.006918 - 0.399912 * math.cos(g) + 0.070257 * math.sin(g) - 0.006758 * math.cos(2 * g) + 0.000907 * math.sin(2 * g) - 0.002697 * math.cos(3 * g) + 0.00148 * math.sin(3 * g)
    la = math.radians(lat)
    ha = math.degrees(math.acos(math.cos(math.radians(90.833)) / (math.cos(la) * math.cos(decl)) - math.tan(la) * math.tan(decl)))
    mins = 720 - 4 * (lon - ha) - eqt + tz * 60
    return f"{int(mins // 60):02d}:{int(mins % 60):02d}"

def hm(m): m = round(m); return f"{m // 60:02d}:{m % 60:02d}"
def p(s): h, m = s.split(":"); return int(h) * 60 + int(m)

# Each day: start time, then a list of steps.
#  ("drive", to, km, minutes, roads)   minutes = W123 pace incl. a short break per ~2h
#  ("stop", name, minutes, "M"|"O", note)
#  ("tz", +1)   clock change at a border
#  ("border", name, minutes)
D = {
1: ("11:30", 43.263, -2.935, 1, [
    ("drive", "Burgos", 245, 170, "A-1 autovía"),
    ("stop", "Burgos Cathedral + lunch", 120, "O", "Plaza Mayor car park"),
    ("drive", "Bilbao", 160, 115, "AP-1 / AP-68"),
    ("stop", "Floodlit Guggenheim and Casco Viejo pintxos", 150, "M", "Museum last entry 18:30")]),
2: ("09:00", 43.483, -1.559, 1, [
    ("drive", "Zumaia", 80, 90, "N-634 coast road"),
    ("stop", "Itzurun flysch cliffs", 45, "O", ""),
    ("drive", "Getaria", 12, 20, "N-634"),
    ("stop", "Getaria harbour", 60, "O", ""),
    ("drive", "San Sebastián (Illunbe P+R)", 30, 40, "N-634 / GI-20"),
    ("stop", "La Concha + pintxos lunch", 150, "O", "Bus 28 into town"),
    ("drive", "Biarritz", 50, 60, "AP-8 / A63"),
    ("stop", "Rocher de la Vierge at sunset", 60, "M", "")]),
3: ("08:30", 43.206, 2.364, 1, [
    ("drive", "Pau", 115, 90, "A63 / A64"),
    ("stop", "Boulevard des Pyrénées", 60, "O", ""),
    ("drive", "Carcassonne", 290, 255, "A64 / A61, lunch break on the way"),
    ("stop", "Floodlit Cité walk", 120, "M", "Evening, P1/P2 free after 20:00")]),
4: ("07:15", 43.775, 7.498, 1, [
    ("drive", "Pont du Gard", 225, 165, "A61 / A9"),
    ("stop", "Pont du Gard", 45, "O", "€9 car park"),
    ("drive", "Saint-Raphaël", 230, 195, "A9 / A8, lunch break on the way"),
    ("drive", "Théoule-sur-Mer via the Estérel corniche", 30, 75, "D559 with viewpoint stops"),
    ("stop", "Corniche viewpoints (inside the drive)", 0, "M", "Cap Dramont, Cap Roux, Esquillon"),
    ("drive", "Menton", 75, 75, "A8")]),
5: ("09:30", 43.775, 7.498, 1, [
    ("drive", "Villefranche-sur-Mer", 25, 40, "Basse Corniche"),
    ("stop", "Villefranche harbour and citadel", 75, "O", "Free parking Nov–Mar"),
    ("drive", "Èze", 10, 20, "Moyenne Corniche"),
    ("stop", "Èze village + lunch", 90, "M", ""),
    ("drive", "Monaco", 10, 25, "M6007"),
    ("stop", "Monaco Rock and harbour", 120, "M", "Parking des Pêcheurs"),
    ("drive", "Menton via the Grande Corniche", 20, 45, "M2564, viewpoints")]),
6: ("08:30", 43.843, 10.503, 1, [
    ("drive", "Pisa (Via Pietrasantina P+R)", 290, 270, "A10 / A12, lunch break on the way"),
    ("stop", "Piazza dei Miracoli", 120, "M", "Shuttle from the P+R"),
    ("drive", "Lucca", 25, 35, "SS12"),
    ("stop", "Evening on the city walls", 60, "O", "")]),
7: ("08:30", 43.620, 11.470, 1, [
    ("drive", "Castellina in Chianti", 110, 105, "Firenze–Siena dual carriageway to Poggibonsi, then SR222"),
    ("stop", "Castellina village walk", 45, "O", "Christmas Day: outdoors, villages lit up"),
    ("drive", "Panzano in Chianti", 12, 20, "SR222"),
    ("stop", "Christmas lunch above the vineyards", 120, "M", "Book ahead"),
    ("drive", "Greve in Chianti", 7, 15, "SR222"),
    ("stop", "Greve piazza", 45, "O", ""),
    ("drive", "Figline Valdarno (hotel)", 20, 30, "SP16 over the hills")]),
8: ("09:00", 43.770, 11.256, 1, [
    ("stop", "Train Figline → Firenze SMN", 40, "M", "Holiday timetable; car stays at the hotel"),
    ("stop", "Florence: Uffizi, Ponte Vecchio, Baptistery, Cupola", 450, "M", "26 Dec: museums open, Cathedral closed"),
    ("stop", "Train back to Figline", 40, "M", "")]),
9: ("08:00", 43.936, 12.447, 1, [
    ("drive", "Arezzo", 50, 45, "A1 (Valdarno to Arezzo)"),
    ("stop", "Piazza Grande", 90, "M", "Parcheggio Pietri + lift"),
    ("drive", "Anghiari", 30, 40, "SR73"),
    ("stop", "Anghiari + quick lunch", 60, "O", ""),
    ("drive", "Bocca Trabaria (1,049 m)", 35, 50, "SS73bis"),
    ("stop", "Pass photo stop", 10, "O", ""),
    ("drive", "San Marino via Urbania", 95, 120, "SS73bis / SP / SS72")]),
10: ("09:00", 45.562, 12.236, 1, [
    ("drive", "Comacchio", 120, 120, "A14 to Ravenna, then SS309 Romea (do not enter Ravenna)"),
    ("stop", "Comacchio canals", 60, "O", "Under 30,000 people: not on the ban list"),
    ("drive", "Mogliano Veneto (hotel)", 125, 140, "SS309 Romea past Chioggia, Passante A4")]),
11: ("09:30", 45.438, 12.336, 1, [
    ("stop", "Train Mogliano → Venezia S. Lucia", 20, "M", "Car stays parked"),
    ("stop", "Venice: Grand Canal, Rialto, San Marco", 420, "M", "Check the acqua alta forecast")]),
12: ("08:30", 46.057, 14.506, 1, [
    ("drive", "Aquileia", 100, 85, "A4"),
    ("stop", "Basilica mosaics", 60, "O", ""),
    ("drive", "Miramare Castle", 45, 45, "SS14 coast road"),
    ("stop", "Miramare gardens", 45, "O", ""),
    ("drive", "Trieste", 8, 15, "SS14"),
    ("stop", "Piazza Unità + lunch", 90, "M", "Molo IV car park"),
    ("drive", "Ljubljana", 95, 90, "A1 Slovenia (e-vignette)")]),
13: ("10:30", 45.815, 15.982, 1, [
    ("stop", "Morning in Ljubljana old town", 0, "O", "New Year's Eve: shops close early"),
    ("drive", "Zagreb", 140, 115, "A2 / A3"),
    ("stop", "Upper Town, then the New Year's Eve party", 240, "M", "Garage Tuškanac; book the hotel early")]),
14: ("08:30", 44.813, 20.461, 1, [
    ("drive", "Bajakovo border", 300, 225, "A3, empty on 1 Jan; motorway fuel stations open"),
    ("border", "Croatia → Serbia (Bajakovo–Batrovci)", 45),
    ("drive", "Belgrade", 120, 95, "A3 Serbia"),
    ("stop", "Kalemegdan at dusk", 90, "M", "Garage Obilićev venac")]),
15: ("08:00", 44.637, 22.660, 2, [
    ("drive", "Golubac Fortress", 130, 120, "Požarevac / Veliko Gradište"),
    ("stop", "Golubac Fortress", 45, "O", "2 Jan is a holiday: may be closed, view from outside"),
    ("drive", "Lepenski Vir", 40, 55, "Danube road"),
    ("stop", "Lepenski Vir", 40, "O", ""),
    ("drive", "Iron Gates dam via the Kazan gorge", 60, 90, "Danube road with lay-bys"),
    ("border", "Serbia → Romania (Iron Gates I dam)", 45),
    ("tz", 60),
    ("drive", "Drobeta-Turnu Severin", 12, 20, "DN6")]),
16: ("09:00", 44.427, 26.103, 2, [
    ("drive", "Craiova", 110, 90, "DN6"),
    ("stop", "Lunch and fuel", 45, "O", ""),
    ("drive", "Bucharest", 240, 180, "DEx12 / A1")]),
}

TZ_NAME = {1: "CET", 2: "EET"}
import re
MODES = json.load(open(f"{S}/mapdata/modes.json"))
TRIP = json.load(open(f"{S}/mapdata/trip.json"))

def sun(lat, lon, date, tz, rise, zen=90.833):
    n = date.timetuple().tm_yday; g = 2 * math.pi / 365 * (n - 1)
    eqt = 229.18 * (0.000075 + 0.001868 * math.cos(g) - 0.032077 * math.sin(g) - 0.014615 * math.cos(2 * g) - 0.040849 * math.sin(2 * g))
    decl = 0.006918 - 0.399912 * math.cos(g) + 0.070257 * math.sin(g) - 0.006758 * math.cos(2 * g) + 0.000907 * math.sin(2 * g) - 0.002697 * math.cos(3 * g) + 0.00148 * math.sin(3 * g)
    la = math.radians(lat)
    ha = math.degrees(math.acos(math.cos(math.radians(zen)) / (math.cos(la) * math.cos(decl)) - math.tan(la) * math.tan(decl)))
    return 720 - 4 * (lon + ha if rise else lon - ha) - eqt + tz * 60

SCENIC_RE = re.compile(r"N-634|D559|Corniche|M2564|SR222|SP16|SS73bis|SS14|Danube road|SR73|SS72")
MW_RE = re.compile(r"\bA-?\d|\bAP-|E45|Passante|autovía|dual carriageway|motorway", re.I)
def kind_of(roads):
    if SCENIC_RE.search(roads): return "scenic"
    if MW_RE.search(roads): return "mw"
    return "main"

def bearing(a, b):
    y = math.sin(math.radians(b[1] - a[1])) * math.cos(math.radians(b[0]))
    x = math.cos(math.radians(a[0])) * math.sin(math.radians(b[0])) - math.sin(math.radians(a[0])) * math.cos(math.radians(b[0])) * math.cos(math.radians(b[1] - a[1]))
    return (math.degrees(math.atan2(y, x)) + 360) % 360

def build(d, start, lat, lon, tz, steps, prev):
    date = START + dt.timedelta(days=d - 1)
    plat, plon, ptz = prev
    rise = sun(plat, plon, date, ptz, True)
    sset = sun(lat, lon, date, tz, False); dusk = sun(lat, lon, date, tz, False, 96)
    head = bearing((plat, plon), (lat, lon))
    t = p(start); rows = []; drive_min = km = 0
    clock_tz = ptz; shift = 0     # minutes to add to row clock to compare with end-of-day local time
    if ptz != tz: shift = (tz - ptz) * 60
    warn = []
    for st in steps:
        if st[0] == "drive":
            _, to, k, mins, roads = st[:5]
            kind = st[5] if len(st) > 5 else kind_of(roads)
            a, b = t + shift, t + mins + shift
            r_rise = rise + (tz - ptz) * 60 if True else rise   # sunrise in end-of-day clock
            light = []
            if a < r_rise: light.append("predawn")
            if b > sset: light.append("afterdark" if b > dusk else "dusk")
            if kind == "scenic" and (a < r_rise + 15 or b > sset - 15): light.append("scenic_dark")
            if kind != "mw" and (a < r_rise - 5 or b > dusk): light.append("minor_dark")
            if kind != "scenic" and 45 <= head <= 135 and a < r_rise + 75 and b > r_rise: light.append("glare_east")
            if kind != "scenic" and 225 <= head <= 315 and b > sset - 75 and a < sset: light.append("glare_west")
            if kind == "scenic" and b > sset - 75 and a < sset: light.append("golden")
            rows.append({"k": "drive", "t": hm(t), "to": to, "km": k, "min": mins, "roads": roads, "arr": hm(t + mins), "kind": kind, "light": light})
            for c in light:
                if c in ("scenic_dark", "minor_dark"): warn.append(c)
            t += mins; drive_min += mins; km += k
        elif st[0] == "stop":
            _, name, mins, mo, note = st
            rows.append({"k": "stop", "t": hm(t), "name": name, "min": mins, "mo": mo, "note": note, "end": hm(t + mins)})
            t += mins
        elif st[0] == "border":
            _, name, mins = st
            rows.append({"k": "border", "t": hm(t), "name": name, "min": mins, "end": hm(t + mins)})
            t += mins
        elif st[0] == "tz":
            t += st[1]; shift -= st[1]
            rows.append({"k": "tz", "t": hm(t), "name": "Clocks forward 1 hour (Romanian time)"})
    r_rise = rise + (tz - ptz) * 60
    return {"date": date.isoformat(), "dow": date.strftime("%a"), "dlabel": date.strftime("%a %-d %b"),
            "start": start, "rows": rows, "end": hm(t), "drive": hm(drive_min).lstrip("0").replace(":", "h") if drive_min else "0h",
            "km": km, "sunset": hm(sset), "sunrise": hm(rise), "dusk": hm(dusk), "tz": TZ_NAME[ptz],
            "riseTz": TZ_NAME[ptz], "setTz": TZ_NAME[tz], "warn": sorted(set(warn)),
            "daylight": hm(sset - r_rise).lstrip("0").replace(":", "h")}

out = {}
prev = (40.4168, -3.7038, 1)
for d, (start, lat, lon, tz, steps) in D.items():
    out[d] = build(d, start, lat, lon, tz, steps, prev)
    out[d]["modes"] = {}
    for mk in ("fast", "cine", "safe"):
        v = MODES[str(d)][mk]
        if v.get("same"): continue
        vsteps = [tuple(x) for x in v["steps"]]
        if d == 15: vsteps = vsteps  # no variants on day 15
        out[d]["modes"][mk] = build(d, v.get("start", start), lat, lon, tz, vsteps, prev)
    prev = (lat, lon, tz)

json.dump(out, open(f"{S}/plan.json", "w"), ensure_ascii=False, indent=1)
for d, v in out.items():
    for mk, x in [("bal", v)] + list(v["modes"].items()):
        lights = sorted({c for r in x["rows"] if r["k"] == "drive" for c in r["light"]})
        print(f"D{d:>2} {mk:4} {x['start']}→{x['end']} drive {x['drive']:>5} {x['km']:>3} km | rise {x['sunrise']} set {x['sunset']} dusk {x['dusk']} | {', '.join(lights)}{'  ⚠ ' + ','.join(x['warn']) if x['warn'] else ''}")
