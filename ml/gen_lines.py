"""Synthetic pattern lines with exact targets, for teaching a small model to read notation.

Every example is (craft, sizes, line text) -> the JSON the reader must return. Targets are
built by the same code that writes the text, so they are right by construction.
Run: python ml/gen_lines.py  -> ml/data/train.jsonl, ml/data/heldout_synth.jsonl
"""
import json, random, os

R = random.Random(7)
SIZESETS = [[], [], [], ["S", "M", "L"], ["Child", "Teen", "Adult S", "Adult L"], ["XS", "S", "M", "L", "XL"], ["Short", "Long"]]


def sz(sizes, base, step=None, spread=None):
    """One number, or a per-size list written like 64 (72, 80)."""
    if not sizes:
        return base, str(base)
    step = step or R.choice([4, 6, 8])
    vals = [base + step * k for k in range(len(sizes))]
    style = R.choice(["paren", "bracket"])
    rest = ", ".join(map(str, vals[1:]))
    return vals, (f"{vals[0]} ({rest})" if style == "paren" else f"{vals[0]} [{rest}]")


def lab(kind, n, m=None):
    word = R.choice({"rnd": ["Rnd", "Round", "R"], "row": ["Row", "Row"]}[kind])
    if m:
        word = {"Rnd": "Rnds", "Round": "Rounds", "R": "R", "Row": "Rows"}[word]
        return f"{word} {n}-{m}"
    return f"{word} {n}"


def stated(c, sizes, txt):
    style = R.choice(["paren", "sts", "dot", "none"] if not sizes else ["sts", "sts", "none"])
    if style == "none":
        return None, ""
    if style == "paren":
        return c, f" ({txt})"
    if style == "dot":
        return c, f". {txt} sts."
    return c, f" — {txt} sts" if R.random() < 0.2 else f". {txt} sts."


def crochet(sizes):
    n = R.randint(2, 30)
    a = R.randint(1, 8)
    t = R.choice([5, 6, 6, 6, 8, 10, 12])
    st = R.choice(["sc", "sc", "hdc", "dc"])
    c = (a + 2) * t
    k = R.randint(0, 9)
    if k == 0:
        m = R.choice([5, 6, 6, 8])
        return f"{lab('rnd', 1)}: {m} sc in {R.choice(['magic ring', 'a magic ring', 'MR', 'mr'])} ({m})", {"k": "setup", "c": m, "s": m}
    if k == 1:
        txt = R.choice(["inc in each st around", "inc around", f"2 {st} in each st around", "inc x 6"]) if True else ""
        if txt.startswith("2 "):
            o = [{"o": [[st, 2, 1]], "r": 1}]
        elif txt == "inc x 6":
            o = [{"o": [["inc", 1]], "t": 6}]
        else:
            o = [{"o": [["inc", 1]], "r": 1}]
        return f"{lab('rnd', n)}: {txt} ({R.randint(10, 30)})", None if False else {"k": "row", "o": o, "s": int(f"{R.randint(10,30)}") if False else None}
    if k in (2, 3):
        inc = R.choice(["inc", "inc", "dec", "invdec", "sc2tog"]) if st == "sc" else R.choice(["inc", "dec"])
        inner = f"{st} {a}, {inc}" if a > 1 else f"{st}, {inc}"
        form = R.choice(["({}) x {}", "({}) * {}", "[{}] {} times", "*{}; rep from * {} more", "({}) {} times", "({})x{}"])
        if form.startswith("*"):
            body = f"*{inner}; rep from * {t - 1} more times"
        else:
            body = form.format(inner, t)
        o = [{"o": [[st, a], [inc, 1]], "t": t}]
        s = (a + (2 if inc == "inc" else 1)) * t
        return f"{lab('rnd', n)}: {body} ({s})", {"k": "row", "o": o, "s": s}
    if k == 4:
        p, q = R.randint(1, 4), R.randint(1, 4)
        inc = R.choice(["inc", "dec"])
        o = [[st, p], [inc, 1], {"o": [[st, a], [inc, 1]], "t": t - 1}, [st, q]]
        lead = f"{st} {p}" if R.random() < 0.6 else f"{st} in next {p} sts"
        sv = R.randint(20, 80)
        return f"{lab('rnd', n)}: {lead}, {inc}, ({st} {a}, {inc}) x {t - 1}, {st} {q} ({sv})", {"k": "row", "o": o, "s": sv}
    if k == 5:
        m2 = n + R.randint(1, 8)
        txt = R.choice([f"{st} around", f"{st} in each st around", f"{st} in each st"])
        return f"{lab('rnd', n, m2)}: {txt} ({c})", {"k": "row", "x": m2 - n + 1, "o": [{"o": [[st, 1]], "r": 1}], "s": c}
    if k == 6:
        txt = R.choice([f"ch 1, turn, {st} across", f"ch 1, turn, {st} in each st across", f"ch 1, turn. {st} in each st to end"])
        return f"{lab('row', n)}: {txt} ({c})", {"k": "row", "o": [["turnch", 1], {"o": [[st, 1]], "r": 1}], "s": c}
    if k == 7:
        ch = R.randint(10, 80)
        return f"{R.choice(['Ch', 'Chain', 'ch'])} {ch}.", {"k": "setup", "c": ch}
    if k == 8:
        s = R.randint(9, 79)
        return f"{lab('row', 1)}: sc in 2nd ch from hook and in each ch across ({s})", {"k": "row", "o": [["sk", 1], {"o": [["sc", 1]], "r": 1}], "s": s}
    return R.choice(["Fasten off, leaving a long tail.", "Stuff firmly.", "Sew the ears to Rnd 8.", "Hook: 3.5 mm (E/4)."]), {"k": "note"}


def knit(sizes):
    n = R.randint(1, 60)
    k = R.randint(0, 12)
    if k == 0:
        v, t = sz(sizes, R.choice([40, 48, 56, 64, 72, 80, 96, 120]))
        return f"{R.choice(['Cast on', 'CO', 'Using long-tail method, cast on'])} {t} sts.", {"k": "setup", "c": v}
    if k == 1:
        a = R.randint(2, 9)
        v, t = sz(sizes, R.choice([40, 48, 56, 63, 70]), 7)
        dec = R.choice(["k2tog", "ssk", "k2tog"])
        s, st = stated(v, sizes, t)
        return f"{lab('rnd', n)}: *K{a}, {dec}; rep from * {R.choice(['around', 'to end'])}{st}", {"k": "row", "o": [{"o": [["k", a], [dec, 1]], "r": 1}], **({"s": s} if s is not None else {})}
    if k == 2:
        a, b = R.choice([(1, 1), (2, 2), (3, 1), (2, 1)])
        return f"{lab(R.choice(['rnd', 'row']), n, n + R.randint(3, 12))}: *K{a}, p{b}; rep from * around.", {"k": "row", "x": None, "o": [{"o": [["k", a], ["p", b]], "r": 1}]}
    if k == 3:
        p = R.randint(1, 4)
        inner = R.choice([[["yo", 1], ["k2tog", 1]], [["k2tog", 1], ["yo", 1]], [["yo", 1], ["ssk", 1]]])
        txt = ", ".join(f"{x[0]}" for x in inner)
        return f"{lab('row', n)}{R.choice(['', ' (RS)'])}: K{p}, *{txt}; rep from * to last {p} sts, k{p}.", {"k": "row", "o": [["k", p], {"o": inner, "r": 1}, ["k", p]]}
    if k == 4:
        p = R.randint(1, 5)
        return f"{lab('row', n)}{R.choice(['', ' (WS)'])}: K{p}, purl to last {p} sts, k{p}.", {"k": "row", "o": [["k", p], {"o": [["p", 1]], "r": 1}, ["k", p]]}
    if k == 5:
        a = R.randint(1, 6)
        m = R.choice(["m1", "m1l", "m1r", "kfb"])
        cost = [["k", a], [m, 1]] if m != "kfb" else [["k", a], ["kfb", 1]]
        return f"{lab('rnd', n)}: K{a}, {m}, k to end.", {"k": "row", "o": cost + [{"o": [["k", 1]], "r": 1}]}
    if k == 6:
        a = R.randint(1, 4)
        return f"{lab('row', n)} (dec): K{a}, ssk, k to last {a + 2} sts, k2tog, k{a}.", {"k": "row", "o": [["k", a], ["ssk", 1], {"o": [["k", 1]], "r": 1}, ["k2tog", 1], ["k", a]]}
    if k == 7:
        b = R.randint(2, 12)
        return f"{lab('row', n)}: BO {b} sts, k to end.", {"k": "row", "o": [["bo", b], {"o": [["k", 1]], "r": 1}]}
    if k == 8:
        a, b = sorted(R.sample(range(1, 40), 2))
        t = R.randint(1, 9)
        words = {1: "once more", 2: "two more times", 3: "three more times"}
        tt = words.get(t, f"{t} more times")
        return f"Repeat {R.choice(['Rows', 'Rnds'])} {a}-{b} {tt}.", {"k": "repeat", "f": a, "to": b, "t": t}
    if k == 9:
        a, b = sorted(R.sample(range(1, 40), 2))
        return f"Repeat {R.choice(['Rows', 'Rnds'])} {a}-{b} until piece measures {R.randint(4, 30)} in.", {"k": "repeat", "f": a, "to": b, "t": 0}
    if k == 10:
        return f"{lab(R.choice(['row', 'rnd']), n)}: {R.choice(['Knit.', 'Knit all sts.', 'Purl.', 'Knit around.'])}", {"k": "row", "o": [{"o": [["p" if "Purl" in "x" else "k", 1]], "r": 1}]}
    if k == 11:
        return R.choice(["Bind off all sts.", "Bind off loosely in pattern."]), {"k": "row", "o": [{"o": [["bo", 1]], "r": 1}]}
    return R.choice(["Gauge: 20 sts and 28 rows = 4 in.", "Weave in ends and block.", "Yarn: 2 skeins of DK weight wool.", "Body"]), {"k": "note"}


def fix(text, target):
    # small repairs for template shortcuts above
    if target.get("k") == "row" and "x" in target and target["x"] is None:
        import re
        m = re.match(r"\w+ (\d+)-(\d+)", text)
        target["x"] = int(m.group(2)) - int(m.group(1)) + 1
    if target.get("k") == "row" and "s" in target and target["s"] is None:
        del target["s"]
    if text.split(":")[-1].strip().startswith("Purl"):
        target["o"] = [{"o": [["p", 1]], "r": 1}]
    if "inc in each st around (" in text or "inc around (" in text or "2 sc in each" in text or "2 hdc in each" in text or "2 dc in each" in text or "inc x 6 (" in text:
        import re
        target["s"] = int(re.search(r"\((\d+)\)\s*$", text).group(1))
    return text, target


def example():
    craft = R.choice(["knit", "crochet"])
    sizes = R.choice(SIZESETS) if craft == "knit" else []
    text, target = (knit if craft == "knit" else crochet)(sizes)
    text, target = fix(text, target)
    return {"craft": craft, "sizes": sizes, "line": text, "target": target}


if __name__ == "__main__":
    os.makedirs("ml/data", exist_ok=True)
    seen = set()
    rows = []
    while len(rows) < 2200:
        e = example()
        if e["line"] in seen:
            continue
        seen.add(e["line"])
        rows.append(e)
    with open("ml/data/train.jsonl", "w") as f:
        for e in rows[:2000]:
            f.write(json.dumps(e) + "\n")
    with open("ml/data/heldout_synth.jsonl", "w") as f:
        for e in rows[2000:]:
            f.write(json.dumps(e) + "\n")
    for e in rows[:8]:
        print(e["line"], "->", json.dumps(e["target"]))
