import json, hashlib, urllib.parse, subprocess, os, sys, time
from PIL import Image
photos = json.load(open('photos.json'))
heroes = {"burgos","getaria","carcassonne","esterel1","eze","pisa","florence","chianti","trabaria","ravenna","venice","miramare","zagreb","belgrade","kazan","bucharest"}
UA = "W123RoadBook/1.0 (personal trip page built with Claude; ad.hoc)"
def url(name, w):
    h = hashlib.md5(name.encode('utf-8')).hexdigest()
    q = urllib.parse.quote(name)
    return f"https://upload.wikimedia.org/wikipedia/commons/thumb/{h[0]}/{h[:2]}/{q}/{w}px-{q}"
fails = []
for key, name in photos.items():
    sizes = [("t", 500)] + ([("h", 960)] if key in heroes else [])
    for tag, w in sizes:
        out = f"out/img/{key}-{tag}.jpg"
        if os.path.exists(out): continue
        tmp = out + ".dl"
        ok = False
        for attempt in range(4):
            r = subprocess.run(["curl","-sS","-L","-o",tmp,"-w","%{http_code}","--max-time","40","-A",UA,url(name,w)],capture_output=True,text=True)
            if r.stdout == "200": ok = True; break
            if r.stdout == "429": time.sleep(20)
            else: break
        if not ok:
            fails.append((key, tag, r.stdout, r.stderr[-60:])); continue
        try:
            im = Image.open(tmp).convert("RGB")
            if tag == "t": im.thumbnail((480, 480))
            im.save(out, "JPEG", quality=78, optimize=True, progressive=True)
            os.remove(tmp)
        except Exception as e:
            fails.append((key, tag, "decode", str(e)[:60]))
        time.sleep(6)
print("fails:", fails)
tot = sum(os.path.getsize("out/img/"+f) for f in os.listdir("out/img") if f.endswith(".jpg"))
print(len([f for f in os.listdir("out/img") if f.endswith('.jpg')]), "files", round(tot/1024), "KB")
