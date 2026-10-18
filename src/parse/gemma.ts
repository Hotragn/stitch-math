// Gemma reads the pattern. It names stitches, repeats and the counts the pattern
// states. It never counts. Every answer is checked against a shape before use.

import { createHash } from "node:crypto";
import type { Line, Num, Op, Group, Parsed } from "../engine/check.ts";
import type { Craft, Custom } from "../engine/stitches.ts";
import { norm } from "../engine/stitches.ts";
import { span } from "../trace.ts";

const MODEL = process.env.GEMMA_MODEL ?? "gemma-4-26b-a4b-it";
const CHUNK = 10;

export type Usage = { calls: number; inTokens: number; outTokens: number; ms: number; cached: number; retries: number };

const RULES = `You read knitting and crochet patterns and turn each numbered line into JSON. You are a careful reader, not an editor.
NEVER count stitches, NEVER fix the pattern, NEVER change a number. Copy every number exactly as written, even if it looks wrong.

Each line starts with an id like [L12]. Per line, output one object with "i" (the number from that id, e.g. 12; not the row or round number) and "k" (kind):
- "row": a row or round worked. Fields:
  "o": the row's stitches in order, as a list of items:
     ["st", n]       stitch st worked n times, into n stitches ("sc in next 3" -> ["sc",3]; "k2" -> ["k",2]; "k2tog" -> ["k2tog",1])
     ["st", n, 1]    n stitches all worked into ONE stitch ("2 sc in next st" -> ["sc",2,1]; "5 dc in same st" -> ["dc",5,1])
     {"o": [items], "t": n}   repeat these items n times in total ("(sc, inc) x 6" -> t 6; "rep from * 3 more times" -> t 4)
     {"o": [items], "r": 1}   repeat these items to fill the rest of the row ("rep from * around", "to end", "across", "to last 3 sts"); list the stitches after the repeat as the next items
  "x": how many rows this line covers ("Rnds 6-9" -> 4). Omit if 1.
  "s": the stitch count the pattern states at the end of this line (in parentheses or "56 sts"), else omit. Numbers in parentheses right after a row range are other sizes' row ranges, not stitch counts.
- "setup": starts a stitch count. "Cast on 64 sts" -> {"k":"setup","c":64}. "6 sc in magic ring (6)" -> {"k":"setup","c":6,"s":6}. "Ch 21" -> {"k":"setup","c":21}. "Pick up and knit 90 sts" -> {"k":"setup","c":90}.
- "repeat": "Repeat Rnds 3-4 five more times" -> {"k":"repeat","f":3,"to":4,"t":5} (t = the extra times only). "Repeat Rows 5-8 until piece measures 60 in" -> {"k":"repeat","f":5,"to":8,"t":0}.
- "note": headings, materials, gauge, finishing, assembly, anything that is not a row.
- "skip": a row you cannot express this way (charts, "work in pattern as established", "at the same time", short rows, unclear text). Add "why" in under 8 words.

Examples (the [L..] id is the "i"):
"Rnd 3: (sc, inc) x 6 (18)" -> {"i":4,"k":"row","o":[{"o":[["sc",1],["inc",1]],"t":6}],"s":18}
"Row 5 (RS): K3, *yo, k2tog; rep from * to last 3 sts, k3." -> {"i":5,"k":"row","o":[["k",3],{"o":[["yo",1],["k2tog",1]],"r":1},["k",3]]}
"Row 6: K3, purl to last 3 sts, k3." -> {"i":8,"k":"row","o":[["k",3],{"o":[["p",1]],"r":1},["k",3]]}  ("purl to last N", "knit to end", "sc across" are always open repeats)
"Rows 3-100: repeat Row 2." -> {"k":"repeat","f":2,"to":2,"t":98}
"Knit, increasing 2 (0, 2) sts evenly." -> {"k":"row","o":[{"o":[["k",1]],"r":1},["m1",[2,0,2]]]}
"sc evenly around" or any row with no exact stitch numbers -> {"k":"skip","why":"no exact counts"}
"Rnds 12-40 (12-44, 12-48): Knit." -> {"i":6,"k":"row","x":[29,33,37],"o":[{"o":[["k",1]],"r":1}]}
"Rnd 1: *K6, k2tog; rep from * around. 56 (63, 70) sts." -> {"i":7,"k":"row","o":[{"o":[["k",6],["k2tog",1]],"r":1}],"s":[56,63,70]}

Stitch names: write them as the pattern does, lowercased (sc, hdc, dc, inc, dec, invdec, sc2tog, ch, sk, k, p, k2tog, ssk, yo, m1l, kfb, sl, bo, co, cdd...).
Special cases: "inc in each st around" -> {"o":[["inc",1]],"r":1}. "sc around" / "knit around" / "k to end" -> {"o":[["sc",1]],"r":1} (or ["k",1]).
"Row 1: sc in 2nd ch from hook and in each ch across" -> [{"o":[["sk",1]]},{"o":[["sc",1]],"r":1}].
"ch 1, turn" (not counted) -> ["turnch",1]. "ch 3 (counts as first dc)" -> ["chasst",1]. "join with sl st" -> ["join",1]. "BO 5 sts" -> ["bo",5]. "Bind off all sts" -> {"o":[{"o":[["bo",1]],"r":1}]}. "place 30 sts on hold" -> ["hold",30].
SIZES: if a number differs by size, like "K6 (7, 8, 9)" or "64 [72, 80] sts", write an array in size order: [6,7,8,9]. A dash for a size means 0. A number with no size variants stays a plain number.`;

const META = `Also return top-level fields:
"craft": "knit" or "crochet",
"sizes": the size names in order (like ["XS","S","M"] or ["Child","Adult"]), or [] if one size,
"custom": special stitches the pattern defines with a stitch effect, as {"name": [stitches used, stitches made]}, e.g. "CDD: sl2, k1, p2sso (2 sts decreased)" -> {"cdd":[3,1]}. {} if none.`;

function linesBlock(text: string[], idx: number[]): string {
  return idx.map((i) => `[L${i}] ${text[i]}`).join("\n");
}

type Meta = { craft: Craft; sizes: string[]; custom: Custom };

const cache = new Map<string, unknown>();
const key = (s: string) => createHash("sha256").update(MODEL + s).digest("hex");

async function callGemma(prompt: string, usage: Usage, label: string): Promise<unknown> {
  const k = key(prompt);
  if (cache.has(k)) { usage.cached++; return cache.get(k); }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { thinkingConfig: { thinkingLevel: "minimal" }, temperature: 0, responseMimeType: "application/json", maxOutputTokens: 4096 },
  };
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    const t0 = Date.now();
    try {
      const out = await span("gen_ai.chat", `chat ${MODEL}`, { "gen_ai.request.model": MODEL, "gen_ai.system": "google_ai_studio", "stitch.chunk": label, "stitch.attempt": attempt }, async (sp) => {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
          method: "POST", headers: { "x-goog-api-key": apiKey, "content-type": "application/json" },
          body: JSON.stringify(body), signal: AbortSignal.timeout(90_000),
        });
        if (!res.ok) throw Object.assign(new Error(`Gemma HTTP ${res.status}`), { status: res.status });
        const j: any = await res.json();
        const parts = j.candidates?.[0]?.content?.parts ?? [];
        const txt = parts.filter((p: any) => !p.thought).map((p: any) => p.text ?? "").join("");
        const u = j.usageMetadata ?? {};
        usage.inTokens += u.promptTokenCount ?? 0; usage.outTokens += u.candidatesTokenCount ?? 0;
        sp?.setAttribute?.("gen_ai.usage.input_tokens", u.promptTokenCount ?? 0);
        sp?.setAttribute?.("gen_ai.usage.output_tokens", u.candidatesTokenCount ?? 0);
        return JSON.parse(txt.trim().replace(/^```(?:json)?/, "").replace(/```$/, "").trim());
      });
      usage.calls++; usage.ms += Date.now() - t0;
      cache.set(k, out);
      if (process.env.DEBUG_RAW) console.error(`[raw ${label}]`, JSON.stringify(out).slice(0, 3000));
      return out;
    } catch (e: any) {
      lastErr = e; usage.retries++;
      const wait = e?.status === 429 ? 4000 * (attempt + 1) : 800 * (attempt + 1);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastErr;
}

// ---- shape checks: the model's JSON must look exactly like this, or the line is "not checked"

const isNum = (v: unknown): v is Num => (typeof v === "number" && Number.isInteger(v) && v >= 0) || (Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === "number" && Number.isInteger(x) && x >= 0));

type Item = unknown;

// Plain items and fixed repeats become ops; open repeats ("r") are only allowed at the top of a row.
function toOps(raw: Item[]): Op[] | null {
  if (!Array.isArray(raw) || !raw.length) return null;
  const ops: Op[] = [];
  for (const o of raw) {
    if (Array.isArray(o) && typeof o[0] === "string" && isNum(o[1])) ops.push({ st: o[0], n: o[1], same: o[2] === 1 || o[2] === true });
    else if (o && typeof o === "object" && !Array.isArray(o)) {
      const inner = (o as any).o ?? (o as any).g;
      if ((o as any).r) return null; // an open repeat nested inside another repeat isn't something we can count
      const g = toOps(inner); if (!g) return null;
      const t = (o as any).t ?? 1;
      if (!isNum(t)) return null;
      ops.push({ group: g, times: t });
    } else return null;
  }
  return ops;
}

function toGroups(raw: any): Group[] | null {
  const items: Item[] = Array.isArray(raw.o) ? raw.o : Array.isArray(raw.g) ? raw.g : [];
  if (!items.length) return null;
  if (raw.r) { const ops = toOps(items); return ops ? [{ ops, rest: true }] : null; }
  const groups: Group[] = [];
  let run: Item[] = [];
  const flush = () => { if (run.length) { const ops = toOps(run); if (!ops) throw 0; groups.push({ ops, times: 1 }); run = []; } };
  try {
    for (const it of items) {
      if (it && typeof it === "object" && !Array.isArray(it) && (it as any).r) {
        flush();
        const ops = toOps((it as any).o ?? (it as any).g); if (!ops) return null;
        groups.push({ ops, rest: true });
      } else run.push(it);
    }
    flush();
  } catch { return null; }
  if (groups.filter((g) => g.rest).length > 1) return null;
  return groups;
}

export function toLine(raw: any): Line | null {
  if (!raw || typeof raw.i !== "number") return null;
  const i = raw.i;
  switch (raw.k) {
    case "note": return { i, kind: "note" };
    case "skip": return { i, kind: "unsupported", why: String(raw.why ?? "can't read this line yet").slice(0, 80) };
    case "setup": return isNum(raw.c) ? { i, kind: "setup", count: raw.c, stated: isNum(raw.s) ? raw.s : null } : null;
    case "repeat": return typeof raw.f === "number" && typeof raw.to === "number" ? { i, kind: "repeat", from: raw.f, to: raw.to, times: isNum(raw.t) ? raw.t : 0 } : null;
    case "row": {
      const groups = toGroups(raw); if (!groups) return null;
      if (raw.x != null && !isNum(raw.x)) return null;
      return { i, kind: "row", groups, reps: raw.x ?? 1, stated: isNum(raw.s) ? raw.s : null };
    }
  }
  return null;
}

function toMeta(raw: any): Meta {
  const craft: Craft = raw?.craft === "crochet" ? "crochet" : "knit";
  const sizes = Array.isArray(raw?.sizes) ? raw.sizes.filter((s: unknown) => typeof s === "string").slice(0, 12) : [];
  const custom: Custom = {};
  if (raw?.custom && typeof raw.custom === "object") {
    for (const [k, v] of Object.entries(raw.custom)) {
      if (Array.isArray(v) && v.length === 2 && v.every((x) => Number.isInteger(x) && x >= 0 && x <= 12)) custom[norm(k)] = { in: v[0] as number, out: v[1] as number };
    }
  }
  return { craft, sizes, custom };
}

export function splitLines(pattern: string): string[] {
  return pattern.replace(/\r/g, "").split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter((l) => l.length > 0).slice(0, 400);
}

export async function readPattern(pattern: string): Promise<{ parsed: Parsed; usage: Usage; meta: Meta }> {
  const text = splitLines(pattern);
  const usage: Usage = { calls: 0, inTokens: 0, outTokens: 0, ms: 0, cached: 0, retries: 0 };
  const all = text.map((_, i) => i);

  // Meta first, from the lines that mention sizes or special stitches, plus the start.
  const metaIdx = [...new Set([...all.slice(0, 25), ...all.filter((i) => /size|special|abbrev|stitch(es)? used|cdd|=|:/i.test(text[i]) && i < 80)])].slice(0, 45).sort((a, b) => a - b);
  const metaRaw = await callGemma(`${META}\nReturn only {"craft":..,"sizes":..,"custom":..}.\n\nPattern lines:\n${linesBlock(text, metaIdx)}`, usage, "meta");
  const meta = toMeta(metaRaw);
  const ctx = `Pattern craft: ${meta.craft}. Sizes in order: ${meta.sizes.length ? meta.sizes.join(", ") : "one size"}.`;

  const chunks: number[][] = [];
  for (let s = 0; s < all.length; s += CHUNK) chunks.push(all.slice(s, s + CHUNK));
  const lines = new Map<number, Line>();
  await Promise.all(chunks.map(async (idx, c) => {
    const ask = (ids: number[]) => callGemma(`${RULES}\n\n${ctx}\nReturn {"lines":[...]} with exactly one object for each [L..] id below, using that id's number as "i".\n\nLines:\n${linesBlock(text, ids)}`, usage, `chunk ${c}`);
    let raw: any = await ask(idx).catch(() => null);
    // Ids from the model are a hint. If it answered one object per line sent, trust the order instead.
    const got = (r: any, sent: number[]) => {
      const list: any[] = Array.isArray(r?.lines) ? r.lines : [];
      const idsOk = list.every((l) => sent.includes(l?.i));
      const use = !idsOk && list.length === sent.length ? list.map((l, k) => ({ ...l, i: sent[k] })) : list;
      for (const l of use) { const L = toLine(l); if (L && sent.includes(L.i) && !lines.has(L.i)) lines.set(L.i, L); }
    };
    got(raw, idx);
    const missing = idx.filter((i) => !lines.has(i));
    if (missing.length) got(await ask(missing).catch(() => null), missing); // one re-ask for lines that failed the shape check
  }));

  const out: Line[] = all.map((i) => lines.get(i) ?? { i, kind: "unsupported", why: "the reader's answer for this line didn't pass the shape check" });
  return { parsed: { craft: meta.craft, sizes: meta.sizes, custom: meta.custom, lines: out, text }, usage, meta };
}
