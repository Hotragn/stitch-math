import json, time, urllib.request, re
key = [l.split("=",1)[1].strip() for l in open(".env") if l.startswith("GEMINI_API_KEY=")][0]
PROMPT = """You convert crochet or knitting pattern lines into JSON. Do not count stitches yourself and do not fix the pattern.
For each line return {"label": str, "stated": int|null, "groups": [{"ops": [{"st": str, "n": int}], "times": int|null, "rest": bool}]}
- "st" is the stitch as written, lowercased (sc, inc, dec, hdc, dc, k, p, k2tog, ssk, yo, m1, kfb, ch, sl st, mr-sc...).
- "n" is how many times that stitch is worked in a row.
- "times" is the repeat count if the group is repeated a fixed number of times, else null.
- "rest": true if the group repeats "around"/"to end"/"across" without a fixed number.
- "stated" is the stitch count the pattern states for that line (usually in parentheses), else null.
Return {"lines": [...]} only.

Lines:
"""
lines = """Rnd 1: 6 sc in magic ring (6)
Rnd 2: inc in each st around (12)
Rnd 3: (sc, inc) x 6 (18)
Rnd 4: *sc 2, inc; rep from * around (24)
Rnd 5: sc in next 3, inc, [sc 3, inc] 5 times (30)
Rnd 6-9: sc around (30)
Rnd 10: (sc 3, dec) x 6 (25)
Row 3: K2, *k2tog, yo; rep from * to last 2 sts, k2 (40 sts)"""
body = {"contents":[{"role":"user","parts":[{"text":PROMPT+lines}]}],
        "generationConfig":{"thinkingConfig":{"thinkingLevel":"minimal"},"temperature":0,"responseMimeType":"application/json"}}
req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent",
    data=json.dumps(body).encode(), headers={"x-goog-api-key":key,"Content-Type":"application/json"})
t=time.time()
r = json.load(urllib.request.urlopen(req, timeout=90))
txt = "".join(p.get("text","") for p in r["candidates"][0]["content"]["parts"] if not p.get("thought"))
print(f"{time.time()-t:.1f}s", r.get("usageMetadata"))
txt = re.sub(r"^```(json)?|```$","",txt.strip()).strip()
d = json.loads(txt)
for ln in d["lines"]: print(json.dumps(ln))
