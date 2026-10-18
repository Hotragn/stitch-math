import json, time, urllib.request
key = [l.split("=",1)[1].strip() for l in open(".env") if l.startswith("GEMINI_API_KEY=")][0]
# Hand-written multi-size hat crown with 2 seeded errors:
#  (a) size 3 casts on 76, and *k6, k2tog* needs a multiple of 8 (76/8 = 9.5)
#  (b) Rnd 13 size 4 says 68 but 77 -> 66
pattern = """Sizes: Child (Teen, Adult S, Adult L)
Cast on 64 (72, 76, 88) sts. Join to work in the round.
Rnds 1-10: *K2, p2; rep from * around.
Rnd 11: *K6, k2tog; rep from * around. 56 (63, 66, 77) sts.
Rnd 12: Knit.
Rnd 13: *K5, k2tog; rep from * around. 48 (54, 57, 68) sts.
Rnd 14: Knit.
Rnd 15: *K4, k2tog; rep from * around. 40 (45, 48, 55) sts.
Rnd 16: Knit.
Rnd 17: *K3, k2tog; rep from * around. 32 (36, 39, 44) sts.
Rnd 18: *K2, k2tog; rep from * around. 24 (27, 30, 33) sts.
Rnd 19: *K1, k2tog; rep from * around. 16 (18, 21, 22) sts.
Rnd 20: K2tog around. 8 (9, 10, 11) sts."""
q = "You are a knitting tech editor. Check every round's stitch count for every size in this pattern, including whether each repeat fits the stitches on the needle. List every problem with the size and the correct number. If all are right, say so.\n\n"+pattern
for trial in range(3):
    body = {"contents":[{"role":"user","parts":[{"text":q}]}],
            "generationConfig":{"thinkingConfig":{"thinkingLevel":"minimal"},"temperature":0.7}}
    req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent",
        data=json.dumps(body).encode(), headers={"x-goog-api-key":key,"Content-Type":"application/json"})
    t=time.time()
    r = json.load(urllib.request.urlopen(req, timeout=120))
    txt = "".join(p.get("text","") for p in r["candidates"][0]["content"]["parts"] if not p.get("thought"))
    print(f"--- trial {trial} {time.time()-t:.1f}s")
    print(txt[:1600])
