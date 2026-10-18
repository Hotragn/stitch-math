// Baseline for the eval: a hand-written reader with no model at all.
// It handles the common notations and gives up on the rest.

import type { Line, Op, Group, Num, Parsed } from "../engine/check.ts";
import type { Craft } from "../engine/stitches.ts";
import { lookup } from "../engine/stitches.ts";
import { splitLines } from "./gemma.ts";

// A stated count at the end of a line: "(18)" or "56 (63, 70) sts" / "40 sts".
const STATED_TAIL = /(?:\s*\((\d+)\)|[.,]?\s*(\d+(?:\s*[\(\[][\d,\s]+[\)\]])?)\s*(?:sts?|stitches))\s*\.?\s*$/i;
const NUMS = String.raw`\d+(?:\s*[\(\[]\s*[\d\-–]+(?:\s*,\s*[\d\-–]+)*\s*[\)\]])?`;
function num(s: string): Num | null {
  const m = s.match(/(\d+)\s*(?:[\(\[]\s*([\d\-–,\s]+)[\)\]])?/);
  if (!m) return null;
  if (!m[2]) return Number(m[1]);
  return [Number(m[1]), ...m[2].split(",").map((x) => (/^\s*[-–]\s*$/.test(x) ? 0 : Number(x.trim())))];
}

function sizesOf(text: string[]): string[] {
  const l = text.find((t) => /^sizes?\s*:/i.test(t));
  if (!l) return [];
  return l.replace(/^sizes?\s*:/i, "").split(/[(),\[\]]/).map((x) => x.trim()).filter(Boolean);
}

function stitch(craft: Craft, tok: string): Op | null {
  let t = tok.trim().toLowerCase().replace(/\.$/, "");
  const nx = t.match(/^([a-z][a-z0-9]*) in (?:the )?next (\d+)\s*(?:sts?|stitches)?$/);
  if (nx && lookup(craft, nx[1])) return { st: nx[1], n: Number(nx[2]) };
  t = t.replace(/ in (?:the )?next st$/, "");
  t = t.replace(/\b(in|into)\s+(each|next|the next)?\s*(st|sts|stitch|stitches)?\b/g, "").replace(/\s+/g, " ").trim();
  let m = t.match(/^(\d+)\s+([a-z0-9]+)\s+in\s+(next|same|one)/);
  if (m && lookup(craft, m[2])) return { st: m[2], n: Number(m[1]), same: true };
  m = t.match(/^([a-z][a-z0-9]*)\s*(\d+)?$/);           // k2, sc 3, inc, k2tog
  if (m && lookup(craft, m[1])) return { st: m[1], n: m[2] ? Number(m[2]) : 1 };
  m = t.match(/^(\d+)\s*([a-z][a-z0-9]*)$/);              // 6 sc
  if (m && lookup(craft, m[2])) return { st: m[2], n: Number(m[1]) };
  if (lookup(craft, t.replace(/\s/g, ""))) return { st: t.replace(/\s/g, ""), n: 1 };
  return null;
}

function opsOf(craft: Craft, body: string): Op[] | null {
  const ops: Op[] = [];
  // fixed repeats "(sc, inc) x 6" / "[sc 3, inc] 5 times"
  const parts = body.split(/,(?![^()\[\]]*[)\]])/);
  for (const p of parts) {
    const g = p.trim().match(/^[\(\[](.+)[\)\]]\s*(?:x|×|\*)?\s*(\d+)(?:\s*times)?$/i);
    if (g) { const inner = opsOf(craft, g[1]); if (!inner) return null; ops.push({ group: inner, times: Number(g[2]) }); continue; }
    const x = p.trim().match(/^(.+?)\s*x\s*(\d+)$/i); // "dec x 6"
    if (x) { const o = stitch(craft, x[1]); if (!o) return null; ops.push({ group: [o], times: Number(x[2]) }); continue; }
    if (!p.trim()) continue;
    const o = stitch(craft, p); if (!o) return null; ops.push(o);
  }
  return ops.length ? ops : null;
}

function rowOf(craft: Craft, instr: string): Group[] | null {
  let s = instr.replace(STATED_TAIL, "").trim().replace(/\.$/, "");
  // "*k2, p2; rep from * around" or "... to last 3 sts, k3"
  const rep = s.match(/^(.*?)\*(.+?);?\s*rep(?:eat)? from \*\s*(around|to end|across|to last \d+ sts?)(?:,\s*(.*))?$/i);
  if (rep) {
    const before = rep[1].replace(/,\s*$/, "").trim(), inner = opsOf(craft, rep[2]), after = (rep[4] ?? "").trim();
    if (!inner) return null;
    const g: Group[] = [];
    if (before) { const b = opsOf(craft, before); if (!b) return null; g.push({ ops: b }); }
    g.push({ ops: inner, rest: true });
    if (after) { const a = opsOf(craft, after); if (!a) return null; g.push({ ops: a }); }
    return g;
  }
  if (/^(knit|purl)$/i.test(s)) return [{ ops: [{ st: /knit/i.test(s) ? "k" : "p", n: 1 }], rest: true }];
  const around = s.match(/^([a-z0-9]+)\s+(?:in each st\s*)?(?:around|to end|across)$/i) ?? s.match(/^([a-z0-9]+)\s+in each st$/i);
  if (around) { const st = /^knit$/i.test(around[1]) ? "k" : /^purl$/i.test(around[1]) ? "p" : around[1]; return lookup(craft, st) ? [{ ops: [{ st, n: 1 }], rest: true }] : null; }
  const ops = opsOf(craft, s);
  return ops ? [{ ops }] : null;
}

export function readRegex(pattern: string): Parsed {
  const text = splitLines(pattern);
  const craft: Craft = /\b(sc|hdc|dc|magic ring|crochet|hook)\b/i.test(pattern) ? "crochet" : "knit";
  const lines: Line[] = text.map((t, i): Line => {
    const sm = t.match(STATED_TAIL);
    const st = sm ? num(sm[1] ?? sm[2]) : null;
    let m = t.match(new RegExp(String.raw`^(?:cast on|co)\s+(${NUMS})`, "i"));
    if (m) return { i, kind: "setup", count: num(m[1])! };
    m = t.match(/^(?:rnd|round|row)s?\s*1\s*:\s*(\d+)\s*sc in (?:a )?(?:magic ring|mr)/i);
    if (m) return { i, kind: "setup", count: Number(m[1]), stated: st };
    m = t.match(/^ch\s*(\d+)\.?$/i);
    if (m) return { i, kind: "setup", count: Number(m[1]) };
    m = t.match(/^(?:rnds?|rounds?|rows?)\s*(\d+)(?:\s*[-–]\s*(\d+))?\s*(?:\([^)]*\))?\s*:\s*(.+)$/i);
    if (!m) return { i, kind: "note" };
    const reps = m[2] ? Number(m[2]) - Number(m[1]) + 1 : 1;
    const groups = rowOf(craft, m[3]);
    if (!groups) return { i, kind: "unsupported", why: "the rules don't know this phrasing" };
    return { i, kind: "row", groups, reps, stated: st };
  });
  return { craft, sizes: sizesOf(text), lines, text };
}
