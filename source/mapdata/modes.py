"""Fastest and cinematic variants per day. Balanced = the existing plan.
Overnight towns never change. Fastest keeps the start time and the stops on its road; you arrive earlier.
Cinematic may run up to ~1.5 h longer, but scenic legs must fit in daylight.

Each variant:
  stops:  card + route sequence. A string reuses the balanced stop of that name;
          a dict adds a stop (t: stop/road/via; 'via' = hidden routing waypoint). m: 'mw' or 'sc' for the leg into it.
  steps:  timed-plan steps. drive tuples end with a kind: mw | main | scenic.
  roads, flags, check (things the news bulletin should check 1-2 days ahead).
"""
import json, os
S = os.path.dirname(os.path.abspath(__file__))

def st(n, lat, lon, t="stop", note="", w="", m=None):
    d = {"n": n, "lat": lat, "lon": lon, "t": t, "note": note, "w": w}
    if m: d["m"] = m
    return d

V = {}

V[1] = {"fast": {"same": True}, "cine": {"same": True, "why": "Not with an 11:30 start: Frías and the waterfall need daylight."}}
# (cinematic Day 1 via Frías / Salto del Nervión dropped: 11:30 start leaves no daylight for it)

V[2] = {"fast": {
    "stops": ["Bilbao", "Getaria", "San Sebastián", "Biarritz"],
    "steps": [("drive", "Zumaia", 70, 60, "AP-8", "mw"),
              ("stop", "Itzurun flysch cliffs", 45, "O", ""),
              ("drive", "Getaria", 12, 20, "N-634", "main"),
              ("stop", "Getaria harbour", 60, "O", ""),
              ("drive", "San Sebastián (Illunbe P+R)", 30, 35, "N-634 / AP-8", "mw"),
              ("stop", "La Concha + pintxos lunch", 150, "O", "Bus 28 into town"),
              ("drive", "Biarritz", 50, 50, "AP-8 / A63", "mw"),
              ("stop", "Rocher de la Vierge at sunset", 60, "M", "")],
    "roads": [["ES-AP", "AP-8"], ["ES-N", "N-634"], ["FR-A", "A63"]],
    "flags": ["AP-8 toll"],
    "check": ["AP-8 and A63 roadworks", "San Sebastián ZBE"]},
  "cine": {
    "stops": ["Bilbao",
              st("Lekeitio", 43.3633, -2.5050, "stop", "Fishing harbour with a church on the quay and an island you can walk to at low tide.", "Lekeitio", "sc"),
              st("Mutriku", 43.3076, -2.3848, "via", m="sc"),
              "Getaria|sc", "San Sebastián|sc",
              st("Jaizkibel ridge road", 43.3480, -1.8580, "road", "GI-3440 along the ridge above the sea, with viewpoints towards France; timed for the late-afternoon light.", "Jaizkibel", "sc"),
              st("Hondarribia", 43.3684, -1.7958, "stop", "Walled old town on the border river.", "Hondarribia", "sc"),
              "Biarritz"],
    "steps": [("drive", "Lekeitio", 60, 70, "BI-635 / BI-2238 via Gernika", "scenic"),
              ("stop", "Lekeitio harbour", 20, "O", ""),
              ("drive", "Zumaia", 45, 65, "Cliff road via Ondarroa and Mutriku (BI-3438 / GI-638)", "scenic"),
              ("stop", "Itzurun flysch cliffs", 30, "O", ""),
              ("drive", "Getaria", 12, 20, "N-634", "scenic"),
              ("stop", "Getaria: grilled-fish lunch", 90, "O", ""),
              ("drive", "San Sebastián (Illunbe P+R)", 30, 40, "N-634 / GI-20", "main"),
              ("stop", "La Concha walk", 60, "O", "Bus 28 into town"),
              ("drive", "Hondarribia via the Jaizkibel ridge", 30, 55, "GI-3440 Jaizkibel road, viewpoint stops", "scenic"),
              ("stop", "Hondarribia old town", 30, "O", ""),
              ("drive", "Biarritz", 35, 40, "A63", "mw")],
    "notes": {"Biarritz": "Evening arrival on the A63."},
    "roads": [["ES-N", "BI-2238"], ["ES-N", "GI-638"], ["ES-N", "N-634"], ["ES-N", "GI-3440"], ["FR-A", "A63"]],
    "flags": ["San Sebastián ZBE: unlabelled cars banned 24/7", "Jaizkibel at golden hour replaces the Biarritz sunset"],
    "check": ["Coast roads BI-3438 / GI-638 and GI-3440 closures", "San Sebastián ZBE"]}}

V[3] = {"fast": {"same": True}, "cine": {
    "stops": ["Biarritz", "Pau, Boulevard des Pyrénées",
              st("Saint-Gaudens", 43.108, 0.723, "via", m="mw"),
              st("Saint-Girons", 42.985, 1.146, "road", "Start of the D117 through the Ariège foothills, with the Pyrenees to the south.", "Saint-Girons,_Ariège", "sc"),
              st("Foix", 42.9653, 1.6070, "stop", "Three-towered castle on a rock above the town; lunch below it.", "Foix", "sc"),
              st("Mirepoix", 43.0878, 1.8747, "stop", "Medieval square ringed by timber arcades.", "Mirepoix,_Ariège", "sc"),
              "Carcassonne"],
    "steps": [("drive", "Pau", 115, 90, "A63 / A64", "mw"),
              ("stop", "Boulevard des Pyrénées", 60, "O", ""),
              ("drive", "Saint-Girons", 155, 130, "A64, then D117 into the Ariège foothills", "main"),
              ("drive", "Foix", 45, 50, "D117 along the foothills", "scenic"),
              ("stop", "Foix: lunch below the castle", 60, "O", ""),
              ("drive", "Mirepoix", 35, 40, "D119", "scenic"),
              ("stop", "Mirepoix arcaded square", 20, "O", ""),
              ("drive", "Carcassonne", 55, 55, "D119 / D6113", "main"),
              ("stop", "Floodlit Cité walk", 120, "M", "Evening, P1/P2 free after 20:00")],
    "roads": [["FR-A", "A64"], ["FR-D", "D117"], ["FR-D", "D119"]],
    "flags": ["Avoids Toulouse and its ZFE entirely"],
    "check": ["D117 Saint-Girons–Foix closures", "French strikes or fuel shortages"]}}

V[4] = {"fast": {
    "stops": ["Carcassonne", "Pont du Gard", "Menton"],
    "steps": [("drive", "Pont du Gard", 225, 165, "A61 / A9", "mw"),
              ("stop", "Pont du Gard", 45, "O", "€9 car park"),
              ("drive", "Menton", 305, 250, "A9 / A8, lunch break on the way", "mw")],
    "roads": [["FR-A", "A61"], ["FR-A", "A9"], ["FR-A", "A8"]],
    "flags": ["No Estérel corniche in this mode", "Stay on the motorway past Montpellier and Marseille (ZFE)"],
    "check": ["A9 / A8 traffic and roadworks", "French strikes or fuel shortages"]},
  "cine": {"same": True, "why": "Balanced already includes the Estérel corniche; there is no daylight left for more."}}

V[6] = {"fast": {"same": True}, "cine": {
    "stops": ["Menton",
              st("La Spezia", 44.110, 9.830, "via", m="mw"),
              st("Portovenere", 44.0505, 9.8357, "stop", "Painted harbour and the San Pietro church on the rocks at the tip of the gulf.", "Porto_Venere", "sc"),
              "Pisa, Piazza dei Miracoli", "Lucca"],
    "steps": [("drive", "La Spezia", 225, 200, "A10 / A12, break on the way", "mw"),
              ("drive", "Portovenere", 13, 30, "SP530 coast road", "scenic"),
              ("stop", "Portovenere: lunch and San Pietro church", 60, "O", ""),
              ("drive", "Pisa (Via Pietrasantina P+R)", 90, 90, "SP530, then A12", "main"),
              ("stop", "Piazza dei Miracoli", 90, "M", "Shuttle from the P+R"),
              ("drive", "Lucca", 25, 30, "A11", "mw"),
              ("stop", "Evening on the city walls", 60, "O", "")],
    "roads": [["IT-A", "A10"], ["IT-A", "A12"], ["IT-SP", "SP530"], ["IT-A", "A11"]],
    "flags": ["24 Dec: early closing; book Christmas Eve dinner", "Pisa and Lucca ZTL: park outside the walls"],
    "check": ["SP530 Portovenere road rockfall closures", "A10 / A12 roadworks"]}}

V[9] = {"fast": {
    "stops": ["Figline Valdarno", "Arezzo", "Anghiari",
              st("Sansepolcro", 43.570, 12.140, "via", m="mw"),
              st("Cesena", 44.137, 12.243, "via", m="mw"),
              "San Marino"],
    "steps": [("drive", "Arezzo", 50, 45, "A1 (Valdarno to Arezzo)", "mw"),
              ("stop", "Piazza Grande", 90, "M", "Parcheggio Pietri + lift"),
              ("drive", "Anghiari", 30, 40, "SR73", "main"),
              ("stop", "Anghiari + quick lunch", 60, "O", ""),
              ("drive", "San Marino", 165, 135, "E45 via Sansepolcro and Cesena, A14, SS72", "mw")],
    "roads": [["IT-A", "A1"], ["IT-E", "E45"], ["IT-A", "A14"], ["IT-SS", "SS72"]],
    "flags": ["No Bocca Trabaria in this mode", "E45 roadworks near Verghereto: check ahead"],
    "check": ["E45 Sansepolcro–Cesena roadworks and lane closures"]},
  "cine": {"same": True, "why": "Balanced already takes the Bocca Trabaria pass."}}

V[10] = {"fast": {
    "stops": ["San Marino", "Comacchio",
              st("Ferrara", 44.835, 11.620, "via", m="mw"),
              st("Padova", 45.400, 11.880, "via", m="mw"),
              "Mogliano Veneto"],
    "steps": [("drive", "Comacchio", 120, 120, "A14 to Ravenna, then SS309 Romea (do not enter Ravenna)", "main"),
              ("stop", "Comacchio canals", 60, "O", "Old diesels banned in the town 08:30–18:30 on weekdays: park outside the town sign"),
              ("drive", "Mogliano Veneto (hotel)", 160, 115, "Ferrara–Mare expressway, A13, A4", "mw")],
    "roads": [["IT-A", "A14"], ["IT-SS", "SS309"], ["IT-A", "A13"], ["IT-A", "A4"]],
    "flags": ["Avoids Chioggia and the SS309 Romea north of Comacchio", "Mon 28 Dec: old diesels are banned 08:30–18:30 in the towns of the Po plain, Comacchio included: see Rules"],
    "check": ["Veneto and Emilia-Romagna diesel ban days", "A13 / A4 traffic"]},
  "cine": {"same": True, "why": "Balanced already follows the Po delta on the Romea."}}

V[12] = {"fast": {"same": True}, "cine": {
    "stops": ["Mogliano Veneto", "Aquileia", "Miramare Castle|sc", "Trieste|sc",
              st("Strada Napoleonica, Opicina", 45.6873, 13.7869, "stop", "Cliff-edge walk above Trieste with the whole gulf below.", "Opicina", "sc"),
              st("Štanjel", 45.8235, 13.8443, "stop", "Stone hilltop village in the Karst.", "Štanjel", "sc"),
              "Ljubljana"],
    "steps": [("drive", "Aquileia", 100, 85, "A4", "mw"),
              ("stop", "Basilica mosaics", 60, "O", ""),
              ("drive", "Miramare Castle", 45, 45, "SS14 coast road", "scenic"),
              ("stop", "Miramare gardens", 45, "O", ""),
              ("drive", "Trieste", 8, 15, "SS14", "scenic"),
              ("stop", "Piazza Unità + lunch", 90, "M", "Molo IV car park"),
              ("drive", "Strada Napoleonica, Opicina", 8, 20, "Up to Opicina", "scenic"),
              ("stop", "Strada Napoleonica viewpoint walk", 20, "O", "Views over Trieste and the gulf"),
              ("drive", "Štanjel", 35, 45, "Karst roads via Sežana", "scenic"),
              ("stop", "Štanjel hilltop village", 30, "O", ""),
              ("drive", "Ljubljana", 75, 65, "H4 Vipava valley, then A1 (e-vignette)", "mw")],
    "roads": [["IT-A", "A4"], ["IT-SS", "SS14"], ["SI-A", "H4"], ["SI-A", "A1"]],
    "flags": ["Slovenian e-vignette from the border (€16, 7 days)"],
    "check": ["Karst road closures (bora wind)", "Slovenian e-vignette"]}}

V[13] = {"fast": {"same": True}, "cine": {
    "stops": ["Ljubljana",
              st("Kostanjevica na Krki", 45.8463, 15.4247, "stop", "Tiny town on an island in the Krka river.", "Kostanjevica_na_Krki", "mw"),
              st("Samobor", 45.8011, 15.7110, "stop", "Pastel square at the foot of the hills; try the kremšnita.", "Samobor", "sc"),
              "Zagreb"],
    "steps": [("drive", "Kostanjevica na Krki", 105, 85, "A2", "mw"),
              ("stop", "Kostanjevica na Krki river island", 30, "O", ""),
              ("drive", "Samobor", 40, 45, "Krka valley via Brežice, Bregana", "scenic"),
              ("stop", "Samobor: square and kremšnita", 45, "O", ""),
              ("drive", "Zagreb", 25, 30, "Samobor road", "main"),
              ("stop", "Upper Town, then the New Year's Eve party", 240, "M", "Garage Tuškanac; book the hotel early")],
    "roads": [["SI-A", "A2"], ["HR-D", "Samobor road"]],
    "flags": ["31 Dec: book the hotel early; shops close early", "Croatian winter equipment (15 Nov–15 Apr)"],
    "check": ["New Year's Eve closures in Samobor", "Croatian winter equipment"]}}

V[14] = {"fast": {"same": True}, "cine": {
    "stops": ["Zagreb",
              st("Županja", 45.07, 18.70, "via", m="mw"),
              st("Vukovar", 45.3510, 19.0010, "stop", "War-scarred water tower kept as a memorial above the Danube.", "Vukovar_water_tower", "sc"),
              st("Ilok", 45.2225, 19.3780, "road", "Wine town on a bluff over the Danube; border bridge to Serbia.", "Ilok", "sc"),
              st("Petrovaradin Fortress", 45.2522, 19.8622, "stop", "Fortress above the Danube facing Novi Sad.", "Petrovaradin_Fortress", "sc"),
              "Belgrade"],
    "steps": [("drive", "Vukovar", 285, 210, "A3 to Županja, then D55 / D2", "mw"),
              ("stop", "Vukovar water tower and the Danube", 30, "O", "1 Jan: view from outside"),
              ("drive", "Ilok", 37, 40, "D2 along the Danube", "scenic"),
              ("border", "Croatia → Serbia (Ilok–Bačka Palanka)", 30),
              ("drive", "Petrovaradin Fortress, Novi Sad", 45, 50, "State road 12 along the Danube", "main"),
              ("stop", "Petrovaradin Fortress", 30, "O", "Danube view over Novi Sad"),
              ("drive", "Belgrade", 95, 70, "A1", "mw"),
              ("stop", "Kalemegdan, floodlit", 60, "O", "Garage Obilićev venac")],
    "roads": [["HR-A", "A3"], ["HR-D", "D2"], ["RS-M", "State road 12"], ["RS-A", "A1"]],
    "flags": ["Ilok–Bačka Palanka border: confirm it is open on 1 Jan", "Serbian border: Green Card and passports", "1 Jan: almost everything closed; a good day to drive"],
    "check": ["Ilok–Bačka Palanka border crossing hours and queues", "Danube fog on D2 and state road 12"]}}

V[16] = {"fast": {"same": True}, "cine": {
    "stops": ["Drobeta-Turnu Severin",
              st("Brâncuși ensemble, Târgu Jiu", 45.0336, 23.2763, "stop", "The Endless Column, the Gate of the Kiss and the Table of Silence.", "Sculptural_Ensemble_of_Constantin_Brâncuși_at_Târgu_Jiu", "mw"),
              st("Horezu Monastery", 45.1617, 24.0103, "stop", "UNESCO-listed Brâncovenesc monastery below the mountains.", "Horezu_Monastery", "sc"),
              st("Râmnicu Vâlcea", 45.1000, 24.3693, "via", m="sc"),
              st("Pitești", 44.8565, 24.8692, "via", m="mw"),
              "Bucharest"],
    "steps": [("drive", "Brâncuși ensemble, Târgu Jiu", 95, 100, "DN67", "main"),
              ("stop", "Brâncuși ensemble", 40, "O", "Endless Column and Table of Silence"),
              ("drive", "Horezu Monastery", 55, 65, "DN67 below the Căpățânii mountains", "scenic"),
              ("stop", "Horezu Monastery", 30, "O", ""),
              ("drive", "Râmnicu Vâlcea", 45, 50, "DN67", "scenic"),
              ("drive", "Pitești", 60, 70, "DN7", "main"),
              ("stop", "Lunch and fuel", 40, "O", ""),
              ("drive", "Bucharest", 110, 75, "A1", "mw")],
    "start": "08:30",
    "notes": {"Bucharest": "Arrive late afternoon, before dark."},
    "roads": [["RO-DN", "DN67"], ["RO-DN", "DN7"], ["RO-A", "A1"]],
    "flags": ["Rovinietă still valid", "Stops are optional: drive straight through if you prefer"],
    "check": ["DN67 landslide closures", "DN7 / A1 traffic on the Sunday return"]}}

BAL_CHECK = {
 1: ["Madrid ZBE", "A-1 and AP-68 traffic", "Bilbao ZBE weekend rules"],
 2: ["N-634 coast road closures", "San Sebastián ZBE"],
 3: ["A64 / A61 traffic", "French strikes or fuel shortages"],
 4: ["A9 / A8 traffic", "D559 Estérel corniche closures (rockfall, fire risk)"],
 5: ["Corniche road closures", "Events in Monaco"],
 6: ["A10 / A12 traffic and roadworks", "24 Dec opening hours in Pisa"],
 7: ["SR222 closures", "Christmas Day closures"],
 8: ["Train strikes in Tuscany", "26 Dec museum hours"],
 9: ["SS73bis Bocca Trabaria snow or ice", "Italian winter-equipment orders"],
 10: ["Veneto and Emilia-Romagna diesel ban days", "SS309 Romea closures or fog"],
 11: ["Acqua alta forecast", "Train strikes in the Veneto"],
 12: ["A4 traffic", "Karst road closures (bora wind)", "Slovenian e-vignette"],
 13: ["A2 / A3 traffic", "New Year's Eve closures in Zagreb"],
 14: ["Bajakovo–Batrovci border queues", "Fog on the A3"],
 15: ["Danube road closures", "Iron Gates border queues", "2 Jan holiday opening hours"],
 16: ["DN6 / A1 traffic", "Romanian rovinietă"],
}
for d in range(1, 17):
    V.setdefault(d, {})
    for m in ("fast", "cine"):
        V[d].setdefault(m, {"same": True})
exec(open(os.path.join(S, "safe_block.py")).read())
for d in range(1, 17):
    V.setdefault(d, {"fast": {"same": True}, "cine": {"same": True}})
    V[d]["bal"] = {"check": BAL_CHECK[d]}
    for m in ("fast", "cine"):
        V[d].setdefault(m, {"same": True})
json.dump({str(k): v for k, v in sorted(V.items())}, open(f"{S}/modes.json", "w"), ensure_ascii=False, indent=1)
print("variants:", {d: [m for m in ("fast", "cine", "safe") if not V[d][m].get("same")] for d in V})
