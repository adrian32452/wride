"""Build V2: v2/shell.html + v2/lib.js (shared logic forked from V1) + v2/app.js, with the same data as V1."""
import json, os, glob, re
S = os.path.dirname(os.path.abspath(__file__))
src = open(f"{S}/out/route-book.html", encoding="utf-8").read()   # V1 build: take the injected data from it
def grab(name):
    m = re.search(r"const " + name + r" = (.*?);\n", src, re.S)
    return m.group(1)
shell = open(f"{S}/v2/shell.html", encoding="utf-8").read()
lib = open(f"{S}/v2/lib.js", encoding="utf-8").read()
app = open(f"{S}/v2/rules.js", encoding="utf-8").read() + "\n" + open(f"{S}/v2/app.js", encoding="utf-8").read()
# data from the V1 build (already enriched by build.py)
for name, ph in [("MAP", "/*MAPDATA*/null"), ("TRIP", "/*TRIPDATA*/null"), ("PHOTOS", "/*PHOTODATA*/{}"), ("GAL", "/*GALDATA*/{}"),
                 ("PARK", "/*PARKDATA*/{}"), ("PLAN", "/*PLANDATA*/{}"), ("I18N", "/*I18NDATA*/{}"), ("MODESD", "/*MODEDATA*/{}")]:
    assert ph in lib, ph
    lib = lib.replace(ph, grab(name), 1)
lib = lib.replace("fetch(`data/${kind}", "fetch(`${BASE}data/${kind}")
bases = "const BASE = /\\/v2\\/?(index\\.html)?$/.test(location.pathname) ? '../' : '';"
out = shell.replace("/*BASES*/", bases).replace("/*LIB*/", lib).replace("/*APP*/", app)
os.makedirs(f"{S}/out/v2", exist_ok=True)
open(f"{S}/out/v2/index.html", "w", encoding="utf-8").write(out)
open(f"{S}/out/v2/check.js", "w").write(out.split("<script>")[1].split("</script>")[0])
print("v2 built", len(out) // 1024, "KB")
