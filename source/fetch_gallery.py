import json, hashlib, urllib.parse, subprocess, os, time
from PIL import Image
G = json.load(open('gallery.json'))
UA = "W123RoadBook/1.0 (personal trip page; contact ad.buturache via claude.ai)"
def url(name, w=960):
    h = hashlib.md5(name.encode('utf-8')).hexdigest(); q = urllib.parse.quote(name)
    return f"https://upload.wikimedia.org/wikipedia/commons/thumb/{h[0]}/{h[:2]}/{q}/{w}px-{q}"
man = json.load(open('out/g/manifest.json')) if os.path.exists('out/g/manifest.json') else {}
order = []
for rnd in range(12):
    for key, files in G.items():
        if rnd < len(files): order.append((key, rnd, files[rnd]))
for key, i, name in order:
    if True:
        base = f"{key}-{i}"
        if man.get(base, {}).get("ok"): continue
        tmp = f"out/g/{base}.dl"; ok = False; code = ""
        for attempt in range(6):
            r = subprocess.run(["curl","-sS","-L","-o",tmp,"-w","%{http_code}","--max-time","45","-A",UA,url(name)],capture_output=True,text=True)
            code = r.stdout
            if code == "200": ok = True; break
            if code == "429": time.sleep(60 + attempt*30); continue
            if code in ("400","404"):  # file may be smaller than 960: try original-size-capped 640
                r = subprocess.run(["curl","-sS","-L","-o",tmp,"-w","%{http_code}","--max-time","45","-A",UA,url(name,640)],capture_output=True,text=True)
                code = r.stdout; ok = code == "200"
            break
        if ok:
            try:
                im = Image.open(tmp).convert("RGB")
                im.thumbnail((1280, 960)); im.save(f"out/g/{base}.jpg","JPEG",quality=76,optimize=True,progressive=True)
                t = im.copy(); t.thumbnail((420, 320)); t.save(f"out/g/{base}-t.jpg","JPEG",quality=74,optimize=True)
                man[base] = {"ok": True, "f": name, "w": im.width, "h": im.height}
            except Exception as e:
                man[base] = {"ok": False, "f": name, "err": str(e)[:60]}
            if os.path.exists(tmp): os.remove(tmp)
        else:
            man[base] = {"ok": False, "f": name, "err": code}
            if os.path.exists(tmp): os.remove(tmp)
        json.dump(man, open('out/g/manifest.json','w'), ensure_ascii=False)
        print(base, "ok" if man[base]["ok"] else man[base].get("err"), flush=True)
        time.sleep(10)
print("DONE", sum(1 for v in man.values() if v["ok"]), "ok of", len(man), flush=True)
