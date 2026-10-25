import json, os
S = os.path.dirname(os.path.abspath(__file__))
photos = json.load(open(f"{S}/photos.json"))
trip = json.load(open(f"{S}/mapdata/trip.json"))
stopkey = {"Madrid":"madrid","Burgos Cathedral":"burgos","Bilbao":"bilbao","Getaria":"getaria","San Sebastián":"sansebastian","Biarritz":"biarritz",
 "Pau, Boulevard des Pyrénées":"pau","Carcassonne":"carcassonne","Pont du Gard":"pontdugard","Saint-Raphaël":"esterel1","Théoule-sur-Mer":"esterel2",
 "Menton":"menton","Villefranche-sur-Mer":"villefranche","Èze":"eze","Monaco":"monaco","Pisa, Piazza dei Miracoli":"pisa","Lucca":"lucca",
 "Florence":"florence","Greve in Chianti":"greve","Panzano in Chianti":"chianti","Castellina in Chianti":"chianti","Arezzo":"arezzo","Anghiari":"anghiari","Bocca Trabaria":"trabaria",
 "Urbania":"urbania","San Marino":"sanmarino","Ravenna, San Vitale":"ravenna","Chioggia":"chioggia","Venice":"venice","Aquileia":"aquileia",
 "Miramare Castle":"miramare","Trieste":"trieste","Ljubljana":"ljubljana","Zagreb":"zagreb","Belgrade":"belgrade","Golubac Fortress":"golubac",
 "Lepenski Vir":"lepenski","Iron Gates I dam":"irongates","Drobeta-Turnu Severin":"drobeta","Craiova":"craiova","Bucharest":"bucharest"}
heroes = {1:("burgos","Burgos Cathedral"),2:("getaria","Getaria on the Basque coast"),3:("carcassonne","La Cité, Carcassonne"),
 4:("esterel1","Corniche de l'Estérel, D559"),5:("eze","Èze from the Grande Corniche"),6:("pisa","Piazza dei Miracoli, Pisa"),
 7:("chianti","Vineyards in Chianti"),8:("florence","Florence from Piazzale Michelangelo"),9:("trabaria","Bocca Trabaria pass"),
 10:("comacchio","Comacchio"),11:("venice","Rialto Bridge, Venice"),12:("miramare","Miramare Castle, Trieste"),
 13:("zagreb","Upper Town, Zagreb"),14:("belgrade","Sava meets the Danube, Belgrade"),15:("kazan","Kazan gorge, Danube"),16:("bucharest","Romanian Athenaeum, Bucharest")}
for d in trip["days"]:
    for s in d["stops"]:
        if s["n"] in stopkey: s["p"] = stopkey[s["n"]]
    d["hero"], d["heroAlt"] = heroes[d["d"]]
img = f"{S}/out/img"
pdata = {k: {"f": f, "t": os.path.exists(f"{img}/{k}-t.jpg"), "h": os.path.exists(f"{img}/{k}-h.jpg")} for k, f in photos.items()}
t = open(f"{S}/mapdata/template.html").read()
t = t.replace("/*MAPDATA*/null", open(f"{S}/mapdata/map.json").read()).replace("/*TRIPDATA*/null", json.dumps(trip, ensure_ascii=False)).replace("/*PHOTODATA*/{}", json.dumps(pdata, ensure_ascii=False))
open(f"{S}/out/route-book.html","w").write(t)
open(f"{S}/out/check.js","w").write(t.split("<script>")[1].split("</script>")[0])
used = sorted(f for f in os.listdir(img) if f.endswith(".jpg"))
json.dump(used, open(f"{S}/out/used.json","w"))
print("missing thumbs:", [k for k,v in pdata.items() if not v["t"]], "missing heroes:", [h for h,_ in heroes.values() if not pdata.get(h,{}).get("h")], "files:", len(used))

# ---- gallery sprites + parking ----
from PIL import Image as _I
GALLERY = json.load(open(f"{S}/gallery.json"))
manp = f"{S}/out/g/manifest.json"
MAN = json.load(open(manp)) if os.path.exists(manp) else {}
LABEL = {"madrid":"Madrid","burgos":"Burgos Cathedral","bilbao":"Bilbao","road2":"N-634 coast road","getaria":"Getaria","sansebastian":"San Sebastián",
 "biarritz":"Biarritz","pau":"Pau","carcassonne":"Carcassonne","pontdugard":"Pont du Gard","esterel":"Estérel corniche (D559)","menton":"Menton",
 "villefranche":"Villefranche-sur-Mer","eze":"Èze","monaco":"Monaco","pisa":"Pisa","lucca":"Lucca","florence":"Florence","greve":"Greve in Chianti",
 "chianti":"Chianti","arezzo":"Arezzo","anghiari":"Anghiari & Sansepolcro","trabaria":"Bocca Trabaria","urbania":"Urbania","sanmarino":"San Marino",
 "ravenna":"Ravenna, San Vitale","chioggia":"Chioggia","venice":"Venice","aquileia":"Aquileia","miramare":"Miramare Castle","trieste":"Trieste",
 "ljubljana":"Ljubljana","zagreb":"Zagreb","belgrade":"Belgrade","golubac":"Golubac Fortress","lepenski":"Lepenski Vir","road15":"Danube gorge & Kazan",
 "irongates":"Iron Gates dam","drobeta":"Drobeta-Turnu Severin","craiova":"Craiova","bucharest":"Bucharest"}
DAYKEYS = {1:["madrid","burgos","bilbao"],2:["road2","getaria","sansebastian","biarritz"],3:["pau","carcassonne"],4:["pontdugard","esterel","menton"],
 5:["villefranche","eze","monaco"],6:["pisa","lucca"],7:["chianti","greve"],8:["florence"],9:["arezzo","anghiari","trabaria","urbania","sanmarino"],
 10:[],11:["venice"],12:["aquileia","miramare","trieste","ljubljana"],13:["zagreb"],14:["belgrade"],
 15:["golubac","lepenski","road15","irongates","drobeta"],16:["craiova","bucharest"]}
GAL = {}
gdir = f"{S}/out/g"
for d, keys in DAYKEYS.items():
    items = []
    for k in keys:
        for i, f in enumerate(GALLERY.get(k, [])):
            b = f"{k}-{i}"
            if MAN.get(b, {}).get("ok") and os.path.exists(f"{gdir}/{b}.jpg"):
                items.append({"base": b, "label": LABEL[k], "f": f})
    if not items: continue
    sp = _I.new("RGB", (320 * len(items), 240), (30, 36, 44))
    for n, it in enumerate(items):
        im = _I.open(f"{gdir}/{it['base']}.jpg").convert("RGB")
        r = max(320 / im.width, 240 / im.height)
        im = im.resize((max(320, round(im.width * r)), max(240, round(im.height * r))), _I.LANCZOS)
        l, t = (im.width - 320) // 2, (im.height - 240) // 2
        sp.paste(im.crop((l, t, l + 320, t + 240)), (n * 320, 0))
    sp.save(f"{gdir}/sprite-{d}.jpg", "JPEG", quality=72, optimize=True, progressive=True)
    GAL[d] = {"sprite": f"g/sprite-{d}.jpg", "items": items}
PARK = json.load(open(f"{S}/parking.json"))
t = open(f"{S}/out/route-book.html").read()
import glob
I18N = {os.path.basename(f)[:-5]: json.load(open(f)) for f in glob.glob(f"{S}/i18n/lang/*.json")}
t = t.replace("/*I18NDATA*/{}", json.dumps(I18N, ensure_ascii=False))
t = t.replace("/*MODEDATA*/{}", open(f"{S}/mapdata/modes.json").read())
t = t.replace("/*GALDATA*/{}", json.dumps(GAL, ensure_ascii=False)).replace("/*PARKDATA*/{}", json.dumps(PARK, ensure_ascii=False)).replace("/*PLANDATA*/{}", open(f"{S}/plan.json").read())
open(f"{S}/out/route-book.html","w").write(t)
open(f"{S}/out/check.js","w").write(t.split("<script>")[1].split("</script>")[0])
gfiles = sorted({"g/" + it["base"] + ".jpg" for g in GAL.values() for it in g["items"]} | {g["sprite"] for g in GAL.values()})
json.dump(gfiles, open(f"{S}/out/gfiles.json","w"))
print("gallery photos:", sum(len(g["items"]) for g in GAL.values()), "sprites:", len(GAL), "gfiles:", len(gfiles))
