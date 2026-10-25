"""Turn i18n/src/<lang>.txt (index<TAB>translation) into i18n/lang/<lang>.json keyed by the English source."""
import json, os, re, sys, glob
D = os.path.dirname(os.path.abspath(__file__))
M = json.load(open(f"{D}/master.json"))
master, view, tags = M["master"], M["view"], M["tags"]
ph = lambda s: (sorted(re.findall(r"\{\d\}", s)), sorted(re.findall(r"⟦\d+⟧", s)))
ok = True
for f in sorted(glob.glob(f"{D}/src/*.txt")):
    lang = os.path.basename(f)[:-4]
    out, seen, problems = {}, set(), []
    extra = f"{D}/src2/{lang}.txt"
    text = open(f, encoding="utf-8").read() + "\n" + (open(extra, encoding="utf-8").read() if os.path.exists(extra) else "")
    for ln, line in enumerate(text.splitlines(), 1):
        if not line.strip(): continue
        if "\t" not in line: problems.append(f"line {ln}: no tab"); continue
        i, tr = line.split("\t", 1)
        i = int(i)
        if i in seen: problems.append(f"dup {i}")
        seen.add(i)
        if i >= len(view): problems.append(f"bad index {i}"); continue
        if ph(tr) != ph(view[i]): problems.append(f"{i}: placeholders differ: {view[i]!r} -> {tr!r}")
        if tr == view[i]: continue
        h = tr
        for j, t in enumerate(tags[str(i)]): h = h.replace(f"⟦{j}⟧", t)
        out[master[i]] = h
    json.dump(out, open(f"{D}/lang/{lang}.json", "w"), ensure_ascii=False)
    missing = len(view) - len(seen)
    print(f"{lang}: {len(out)} translated, {missing} left in English, {len(problems)} problems")
    for p in problems: print("   ", p); ok = False
sys.exit(0 if ok else 1)
