import json, time, urllib.request, re
key = [l.split("=",1)[1].strip() for l in open(".env") if l.startswith("GEMINI_API_KEY=")][0]
pattern = """Rnd 1: 6 sc in magic ring (6)
Rnd 2: inc in each st around (12)
Rnd 3: (sc, inc) x 6 (18)
Rnd 4: *sc 2, inc; rep from * around (24)
Rnd 5: sc in next 3, inc, [sc 3, inc] 5 times (30)
Rnd 6-9: sc around (30)
Rnd 10: (sc 3, dec) x 6 (25)
Rnd 11: (sc 2, dec) x 6 (18)
Rnd 12: (sc, dec) x 6 (12)
Rnd 13: dec x 6 (6)"""
q = "You are a crochet tech editor. Check every round's stitch count in this amigurumi pattern. List each round where the stated count is wrong, with the correct count. If all are right, say so.\n\n"+pattern
for trial in range(3):
    body = {"contents":[{"role":"user","parts":[{"text":q}]}],
            "generationConfig":{"thinkingConfig":{"thinkingLevel":"minimal"},"temperature":0.7}}
    req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent",
        data=json.dumps(body).encode(), headers={"x-goog-api-key":key,"Content-Type":"application/json"})
    t=time.time()
    r = json.load(urllib.request.urlopen(req, timeout=120))
    txt = "".join(p.get("text","") for p in r["candidates"][0]["content"]["parts"] if not p.get("thought"))
    print(f"--- trial {trial} {time.time()-t:.1f}s")
    print(txt[:900])
