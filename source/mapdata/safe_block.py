
# ---------------- Safe: bad-weather variant (same overnight towns) ----------------
import copy
SAME_SAFE = "Balanced already uses the safest roads on this day."
def safe_from_fast(d, flags, check=None):
    v = copy.deepcopy(V[d]["fast"]); v["flags"] = flags
    if check: v["check"] = check
    return v

SAFE = {
 2: {"stops": ["Bilbao", "San Sebastián", "Biarritz"],
     "steps": [("drive", "San Sebastián (Illunbe P+R)", 100, 80, "AP-8 inland", "mw"),
               ("stop", "La Concha + pintxos lunch", 150, "O", "Bus 28 into town"),
               ("drive", "Biarritz", 50, 50, "AP-8 / A63", "mw"),
               ("stop", "Rocher de la Vierge, from a safe distance", 45, "M", "")],
     "roads": [["ES-AP", "AP-8"], ["FR-A", "A63"]],
     "flags": ["Zumaia cliffs and Getaria skipped: storm waves and gusts hit the coast road", "San Sebastián ZBE: unlabelled cars banned 24/7"]},
 4: safe_from_fast(4, ["No Estérel corniche: the D559 is exposed to wind and rockfall in storms", "Stay on the motorway past Montpellier and Marseille (ZFE)"]),
 5: {"stops": ["Villefranche-sur-Mer", "Èze", "Monaco", "Menton"],
     "steps": [("drive", "Villefranche-sur-Mer", 25, 40, "Basse Corniche", "main"),
               ("stop", "Villefranche harbour and citadel", 75, "O", "Free parking Nov–Mar"),
               ("drive", "Èze", 10, 20, "Moyenne Corniche", "main"),
               ("stop", "Èze village + lunch", 90, "M", ""),
               ("drive", "Monaco", 10, 25, "M6007", "main"),
               ("stop", "Monaco Rock and harbour", 120, "M", "Parking des Pêcheurs"),
               ("drive", "Menton along the Basse Corniche", 12, 30, "M6098 by the sea", "main")],
     "roads": [["FR-M", "Basse Corniche"], ["FR-M", "M6007"], ["FR-M", "M6098"]],
     "flags": ["Back to Menton along the sea instead of the Grande Corniche"]},
 7: {"stops": ["Lucca", "Castellina in Chianti", "Panzano in Chianti", "Greve in Chianti",
               {"n": "A1 Firenze Impruneta", "lat": 43.716, "lon": 11.237, "t": "via", "note": "", "w": "", "m": "mw"},
               "Figline Valdarno"],
     "steps": [("drive", "Castellina in Chianti", 110, 105, "Firenze–Siena dual carriageway to Poggibonsi, then SR222", "scenic"),
               ("stop", "Castellina village walk", 45, "O", "Christmas Day: outdoors, villages lit up"),
               ("drive", "Panzano in Chianti", 12, 20, "SR222", "scenic"),
               ("stop", "Christmas lunch above the vineyards", 120, "M", "Book ahead"),
               ("drive", "Greve in Chianti", 7, 15, "SR222", "scenic"),
               ("stop", "Greve piazza", 45, "O", ""),
               ("drive", "Figline Valdarno (hotel)", 50, 50, "SR222 north, then A1 Firenze Impruneta → Incisa", "mw")],
     "roads": [["IT-SR", "SR222"], ["IT-A", "A1"]],
     "flags": ["Back to Figline on the A1 instead of the SP16 over the hills"]},
 9: safe_from_fast(9, ["No Bocca Trabaria: the E45 is lower and gritted, but it still crosses the Apennines",
                       "In heavy snow there is no low road to San Marino: wait for the ploughs"]),
 10: safe_from_fast(10, ["Motorways instead of the SS309 Romea: fog on a dual carriageway, no oncoming traffic",
                         "Mon 28 Dec: old diesels are banned 08:30–18:30 in the towns of the Po plain, Comacchio included: see Rules"]),
 12: {"stops": ["Mogliano Veneto", "Aquileia", "Trieste", "Ljubljana"],
      "steps": [("drive", "Aquileia", 100, 85, "A4", "mw"),
                ("stop", "Basilica mosaics", 60, "O", ""),
                ("drive", "Trieste", 45, 45, "A4 / RA13, avoiding the coast road", "mw"),
                ("stop", "Piazza Unità + lunch", 90, "M", "Molo IV car park"),
                ("drive", "Ljubljana", 95, 90, "A1 Slovenia (e-vignette)", "mw")],
      "roads": [["IT-A", "A4"], ["IT-A", "RA13"], ["SI-A", "A1"]],
      "flags": ["Miramare skipped: the coast road takes the full force of the bora", "Slovenian e-vignette from the border (€16, 7 days)"]},
}
for d in range(1, 17):
    V.setdefault(d, {})
    V[d]["safe"] = SAFE.get(d, {"same": True, "why": SAME_SAFE})

# ---------------- weather watch points ----------------
# on: route variants that pass it ('bal' also covers modes that are the same as balanced).
# leg: start of the timed-plan drive row ('to') that passes it, per variant.
# yr: place to look up on yr.no.  alt: what to do if it is dangerous or closed.
def hp(id, n, lat, lon, risks, on, leg, yr, note, alt="", elev=None):
    return {"id": id, "n": n, "lat": lat, "lon": lon, "risks": risks, "on": on, "leg": leg, "yr": yr, "note": note, "alt": alt, "elev": elev}
WAIT = "If it is bad on every road, leave later or wait for the snowploughs; adding a night is the last resort."
HOT = {
 1: [hp("somosierra", "Somosierra pass (A-1)", 41.135, -3.580, ["snow", "ice", "fog", "wind"], ["bal", "cine"], {"bal": "Burgos", "cine": "Burgos"}, "Somosierra",
        "Highest point of the whole trip. The A-1 is ploughed first, but in heavy snow lorries are held and chains can be required.",
        "If the A-1 is closed: A-6 / AP-6 through the Guadarrama tunnels and the A-62 via Valladolid to Burgos, about 1 h longer. If both are closed, wait in Madrid.", 1444),
     hp("a1-plateau", "A-1 plateau, Aranda–Burgos", 41.85, -3.70, ["fog", "ice"], ["bal", "cine", "safe"], {"bal": "Burgos", "cine": "Burgos"}, "Lerma",
        "Freezing fog is common on the high plateau on December mornings.", "Leave later, once the fog lifts."),
     hp("orduna", "Orduña pass", 42.994, -3.009, ["snow", "ice", "fog"], ["cine"], {"cine": "Salto del Nervión"}, "Orduña",
        "Minor mountain road; the Safe route stays on the AP-68 motorway through the lower Ebro valley.", "", 900)],
 2: [hp("n634", "N-634 cliff road, Zumaia–Getaria", 43.30, -2.22, ["wind", "rain", "waves"], ["bal", "cine", "fast"], {"bal": "Zumaia", "cine": "Zumaia", "fast": "Getaria"}, "Zumaia",
        "Storm waves and gusts hit the coast road; the Safe route uses the AP-8 inland."),
     hp("jaizkibel", "Jaizkibel ridge road", 43.348, -1.858, ["wind", "fog"], ["cine"], {"cine": "Hondarribia"}, "Hondarribia",
        "Exposed ridge road; pointless in fog.")],
 3: [hp("lauragais", "A61, Lauragais (Castelnaudary)", 43.32, 1.95, ["wind"], ["bal"], {"bal": "Carcassonne"}, "Castelnaudary",
        "Strong cross-winds (Cers, Autan) blow across the motorway; slow down.", "Slow down to 80 km/h; nothing to switch to."),
     hp("d117", "D117 Ariège foothills", 42.98, 1.40, ["snow", "ice"], ["cine"], {"cine": "Foix"}, "Saint-Girons",
        "Foothill road, icy in the shade on cold mornings.")],
 4: [hp("a9", "A9, Narbonne–Montpellier", 43.25, 3.20, ["wind"], ["bal", "fast", "safe"], {"bal": "Pont du Gard", "fast": "Pont du Gard"}, "Narbonne",
        "Tramontane gusts along the coast motorway.", "Slow down; nothing to switch to."),
     hp("rhone", "Rhône crossing near Arles", 43.68, 4.63, ["wind"], ["bal", "fast", "safe"], {"bal": "Saint-Raphaël", "fast": "Menton"}, "Arles",
        "Mistral gusts on the Rhône delta.", "Slow down; nothing to switch to."),
     hp("esterel", "Estérel corniche (D559)", 43.47, 6.90, ["wind", "rain", "rock"], ["bal"], {"bal": "Théoule-sur-Mer"}, "Théoule-sur-Mer",
        "Cliff road; rockfall and closures in heavy rain, spray in storms. Safe stays on the A8.")],
 5: [hp("gcorniche", "Grande Corniche", 43.73, 7.40, ["fog", "ice", "wind"], ["bal"], {"bal": "Menton via the Grande Corniche"}, "La Turbie",
        "High corniche road; often in cloud. Safe returns along the sea.")],
 6: [hp("liguria", "A10 Ligurian coast, Savona–Genoa", 44.31, 8.48, ["rain", "wind"], ["bal", "cine"], {"bal": "Pisa", "cine": "La Spezia"}, "Savona",
        "Exposed viaducts; Liguria issues heavy-rain alerts (allerta rossa) that close roads.", "On a red alert, leave later or wait until it is lifted."),
     hp("sp530", "SP530 to Portovenere", 44.06, 9.84, ["rain", "rock"], ["cine"], {"cine": "Portovenere"}, "Portovenere",
        "Cliff road with rockfall closures after heavy rain.")],
 7: [hp("sr222", "SR222 Chianti ridge", 43.47, 11.29, ["ice", "fog", "snow"], ["bal", "safe"], {"bal": "Castellina in Chianti"}, "Castellina in Chianti",
        "Gritted regional road, but icy in the shade on a cold Christmas morning.", "Leave an hour later so the sun has worked on the ice."),
     hp("sp16", "SP16 over the hills, Greve–Figline", 43.60, 11.38, ["ice", "fog", "snow"], ["bal"], {"bal": "Figline Valdarno"}, "Greve in Chianti",
        "Minor hill road, in the dark if lunch runs late. Safe goes back on the A1.")],
 9: [hp("trabaria", "Bocca Trabaria pass", 43.597, 12.212, ["snow", "ice", "fog"], ["bal"], {"bal": "Bocca Trabaria"}, "Borgo Pace",
        "Mountain pass, often snowy in late December; winter equipment required.", "", 1049),
     hp("e45", "E45 Apennine crossing (Verghereto)", 43.80, 12.05, ["snow", "ice", "fog"], ["fast"], {"fast": "San Marino"}, "Verghereto",
        "Lower than the Bocca Trabaria and gritted, but still an Apennine crossing.", WAIT)],
 10: [hp("romea-s", "SS309 Romea, Ravenna–Comacchio", 44.60, 12.22, ["fog"], ["bal", "fast"], {"bal": "Comacchio", "fast": "Comacchio"}, "Comacchio",
        "Two-lane road with lorries; fog is frequent in the delta.", "Leave later, once the fog lifts (often late morning)."),
      hp("romea-n", "SS309 Romea, Comacchio–Chioggia", 45.00, 12.27, ["fog"], ["bal"], {"bal": "Mogliano Veneto"}, "Chioggia",
        "Notorious for fog and head-on crashes. Safe takes the motorways instead."),
      hp("a13", "A13 Ferrara–Padova", 45.05, 11.80, ["fog"], ["fast"], {"fast": "Mogliano Veneto"}, "Rovigo",
        "Fog across the Po valley, but on a motorway.", "Leave later, once the fog lifts (often late morning).")],
 12: [hp("costiera", "Trieste coast road (SS14)", 45.72, 13.68, ["wind", "rock"], ["bal", "cine"], {"bal": "Miramare Castle", "cine": "Miramare Castle"}, "Trieste",
        "Takes the full force of the bora. Safe skips it."),
      hp("karst", "A1 across the Karst (Razdrto)", 45.76, 14.05, ["wind", "snow", "ice"], ["bal", "safe"], {"bal": "Ljubljana"}, "Razdrto",
        "The bora can close this stretch to light vehicles; DARS posts wind restrictions.", "In a strong bora, wait in Trieste until the gusts drop."),
      hp("vipava", "Vipava valley expressway (H4)", 45.85, 13.95, ["wind"], ["cine"], {"cine": "Ljubljana"}, "Ajdovščina",
        "The first road to close in a strong bora.")],
 13: [hp("a2", "A2 Krka valley", 45.85, 15.10, ["fog", "ice"], ["bal", "cine"], {"bal": "Zagreb", "cine": "Kostanjevica na Krki"}, "Novo mesto",
        "Valley fog and black ice on cold mornings.", "Leave later; the plan starts at 10:30 anyway.")],
 14: [hp("slavonia", "A3 across Slavonia", 45.15, 18.00, ["fog", "ice"], ["bal", "cine"], {"bal": "Bajakovo border", "cine": "Vukovar"}, "Slavonski Brod",
        "Long flat motorway with dense fog banks.", "Leave later, once the fog lifts."),
      hp("d2", "D2 along the Danube", 45.30, 19.10, ["fog"], ["cine"], {"cine": "Ilok"}, "Vukovar",
        "River fog. Safe stays on the A3 motorway.")],
 15: [hp("djerdap", "Danube road through the Iron Gates gorge", 44.55, 22.05, ["rock", "ice", "fog", "snow"], ["bal"], {"bal": "Iron Gates dam via the Kazan gorge"}, "Donji Milanovac",
        "Cliffs and tunnels along the river: rockfall after rain or thaw, ice in the shade.",
        "If the gorge road is closed: A1 south to Paraćin, then via Zaječar and Negotin to the Iron Gates crossing: about 335 km, 1–2 h longer. Check that route before leaving.")],
 16: [hp("oltenia", "Southern plain, Craiova–Pitești–Bucharest", 44.43, 24.37, ["snow", "wind", "fog"], ["bal", "cine"], {"bal": "Bucharest", "cine": "Bucharest"}, "Slatina",
        "Blizzards (viscol) can close roads across the plain; CNAIR posts closures.", WAIT),
      hp("dn67", "DN67 below the mountains", 45.10, 23.70, ["rock", "snow", "ice"], ["cine"], {"cine": "Horezu Monastery"}, "Horezu",
        "Landslides and icy bends. Safe stays on the plain.")],
}
# 'on' lists route variants; a mode without its own variant on a day drives the balanced route.
for d, hs in HOT.items():
    for h in hs:
        if "fast" in h["on"] and d in SAFE and SAFE[d].get("steps") == V[d]["fast"].get("steps") and "safe" not in h["on"]: h["on"].append("safe")
    V.setdefault(d, {})["hot"] = hs
