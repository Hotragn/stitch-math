// The checker. Input: what the model read from each line (stitch ops, repeats,
// the count the pattern states). Output: what the arithmetic says, for every size.
// Nothing here calls a model.

import { resolve, type Craft, type Custom } from "./stitches.ts";

export type Num = number | number[]; // one number, or one per size
export type Op = { st: string; n: Num; same?: boolean } | { group: Op[]; times: Num };
export type Group = { ops: Op[]; times?: Num | null; rest?: boolean };

export type Line =
  | { i: number; kind: "row"; reps?: Num; groups: Group[]; stated?: Num | null }
  | { i: number; kind: "setup"; count: Num; stated?: Num | null }
  | { i: number; kind: "repeat"; from: number; to: number; times: Num }
  | { i: number; kind: "note" }
  | { i: number; kind: "unsupported"; why: string };

export type Parsed = { craft: Craft; sizes: string[]; custom?: Custom; lines: Line[]; text: string[] };

export type Status = "ok" | "error" | "warn" | "unchecked" | "info";
export type Cell = { before: number | null; after: number | null; stated: number | null; status: Status; msg?: string };
export type LineResult = { i: number; text: string; label: string | null; cells: Cell[]; kind: Line["kind"] };
export type Finding = { i: number; size: number; kind: string; msg: string; fix?: string };
export type Report = { sizes: string[]; lines: LineResult[]; findings: Finding[]; checked: number; total: number };

class CheckError extends Error {
  kind: string;
  constructor(kind: string, msg: string) { super(msg); this.kind = kind; }
}

const at = (n: Num | null | undefined, s: number): number | null =>
  n == null ? null : Array.isArray(n) ? (n[s] ?? null) : n;

// One pass of a list of ops for size s: [stitches used, stitches made].
const isTurn = (op: Op | undefined) => !!op && "st" in op && /^(turn|donotturn|dontturn)$/.test(op.st.toLowerCase().replace(/[^a-z]/g, ""));

function opsCost(ops: Op[], craft: Craft, custom: Custom, s: number): [number, number] {
  let u = 0, m = 0;
  for (let k = 0; k < ops.length; k++) {
    const op = ops[k];
    // Crochet convention: "ch 1, turn" (or "ch 1, do not turn") at a row edge is a turning chain, not a stitch.
    if (craft === "crochet" && "st" in op && /^ch(ain)?$/i.test(op.st) && (isTurn(ops[k + 1]) || isTurn(ops[k - 1]))) continue;
    if (isTurn(op)) continue;
    if ("group" in op) {
      const t = at(op.times, s);
      if (t == null || t < 0) throw new CheckError("unreadable", "a nested repeat has no count");
      const [gu, gm] = opsCost(op.group, craft, custom, s);
      u += gu * t; m += gm * t;
      continue;
    }
    const st = resolve(craft, op.st, custom);
    if (!st) throw new CheckError("unknown-stitch", `"${op.st}" isn't a stitch I know`);
    const n = at(op.n, s);
    if (n == null || n < 0) throw new CheckError("unreadable", `no count for ${op.st}`);
    if (op.same) { u += st.in > 0 ? st.in : 0; m += st.out * n; } // n stitches into one stitch
    else { u += st.in * n; m += st.out * n; }
  }
  return [u, m];
}

// One row for size s, starting from `before` live stitches.
export function rowAfter(groups: Group[], craft: Craft, custom: Custom, s: number, before: number): { after: number; warn?: string } {
  let fixedUse = 0, fixedMake = 0;
  let open: { use: number; make: number } | null = null;
  for (const g of groups) {
    const [u, m] = opsCost(g.ops, craft, custom, s);
    if (g.rest) {
      if (open) throw new CheckError("unreadable", "two open repeats in one row");
      open = { use: u, make: m };
    } else {
      const t = at(g.times ?? 1, s) ?? 1;
      fixedUse += u * t; fixedMake += m * t;
    }
  }
  if (open) {
    const left = before - fixedUse;
    if (open.use <= 0) throw new CheckError("unreadable", "a repeat that uses no stitches can't fill the row");
    if (left < 0) throw new CheckError("too-few", `the row needs at least ${fixedUse} sts, but there are ${before}`);
    if (left % open.use !== 0) {
      throw new CheckError("repeat-fit",
        `the repeat uses ${open.use} sts, but ${left} sts are left for it (${before}${fixedUse ? ` − ${fixedUse}` : ""}), and ${left} isn't a multiple of ${open.use}`);
    }
    return { after: fixedMake + (left / open.use) * open.make };
  }
  if (fixedUse > before) throw new CheckError("too-few", `the row uses ${fixedUse} sts, but there are only ${before}`);
  if (fixedUse < before) {
    const spare = before - fixedUse;
    const after = craft === "knit" ? fixedMake + spare : fixedMake;
    return { after, warn: `the row works ${fixedUse} of ${before} sts and leaves ${spare} unworked` };
  }
  return { after: fixedMake };
}

const label = (t: string): string | null => t.match(/^\s*((?:rnds?|rounds?|rows?|r)\s*\d+(?:\s*[-–]\s*\d+)?)/i)?.[1] ?? null;

// Row numbers a line covers, from its own text ("Rnds 6-9" -> 6..9).
function rowNums(t: string): [number, number] | null {
  const m = t.match(/^\s*(?:rnds?|rounds?|rows?|r)\s*(\d+)(?:\s*(?:[-–]|to)\s*(\d+))?/i);
  if (!m) return null;
  return [Number(m[1]), Number(m[2] ?? m[1])];
}

type Step = { line: Line; groups?: Group[]; reps?: Num; stated: boolean };

export function check(p: Parsed): Report {
  const S = Math.max(1, p.sizes.length);
  const custom = p.custom ?? {};
  const findings: Finding[] = [];
  const results: LineResult[] = p.lines.map((l) => ({ i: l.i, text: p.text[l.i] ?? "", label: label(p.text[l.i] ?? ""), kind: l.kind, cells: [] }));
  const byIndex = new Map(p.lines.map((l, k) => [l.i, k]));

  // Wrong number of sizes on a line is itself a finding.
  const sizeCountOk = (v: Num | null | undefined) => !Array.isArray(v) || v.length === S;

  for (let s = 0; s < S; s++) {
    let live: number | null = null;
    for (let k = 0; k < p.lines.length; k++) {
      const line = p.lines[k];
      const res = results[k];
      const stated = "stated" in line ? at(line.stated, s) : null;
      const cell: Cell = { before: live, after: null, stated, status: "unchecked" };
      res.cells[s] = cell;

      if (line.kind === "note") { cell.status = "info"; cell.after = live; continue; }
      if (line.kind === "unsupported") { cell.msg = line.why; live = stated ?? null; cell.after = live; continue; }

      if ("stated" in line && !sizeCountOk(line.stated) && s === 0) {
        findings.push({ i: line.i, size: -1, kind: "sizes", msg: `This line gives ${(line.stated as number[]).length} counts, but the pattern has ${S} sizes.` });
      }

      try {
        if (line.kind === "setup") {
          const c = at(line.count, s);
          if (c == null) throw new CheckError("unreadable", "no stitch count");
          cell.after = c;
        } else if (line.kind === "row") {
          if (live == null) throw new CheckError("no-start", "there's no known stitch count to start from");
          let n = live; let warn: string | undefined;
          const reps = at(line.reps ?? 1, s) ?? 1;
          let afterFirst = n;
          for (let r = 0; r < reps; r++) {
            const out = rowAfter(line.groups, p.craft, custom, s, n);
            n = out.after; warn ??= out.warn;
            if (r === 0) afterFirst = n;
          }
          cell.after = n;
          if (warn) { cell.status = "warn"; cell.msg = warn; }
          if (stated != null && stated !== n && reps > 1 && stated === afterFirst) {
            cell.status = "warn"; cell.msg = `the stated ${stated} matches the first of these rows, not the last (${n})`;
          }
        } else if (line.kind === "repeat") {
          if (live == null) throw new CheckError("no-start", "there's no known stitch count to start from");
          const block = p.lines.filter((l) => {
            const r = rowNums(p.text[l.i] ?? "");
            return l.kind === "row" && r && r[0] >= line.from && r[1] <= line.to;
          }) as Extract<Line, { kind: "row" }>[];
          if (!block.length) throw new CheckError("unreadable", `can't find rows ${line.from} to ${line.to}`);
          const t = at(line.times, s) ?? 1;
          const pass = (start: number) => {
            let n = start;
            for (const b of block) {
              const reps = at(b.reps ?? 1, s) ?? 1;
              for (let q = 0; q < reps; q++) n = rowAfter(b.groups, p.craft, custom, s, n).after;
            }
            return n;
          };
          let n = live;
          if (t === 0) {
            // "repeat until it measures X": fine only if the block ends where it started
            n = pass(live);
            if (n !== live) throw new CheckError("drift", `these rows turn ${live} sts into ${n}, so repeating them "until it measures" makes the count depend on length`);
          } else for (let r = 0; r < t; r++) n = pass(n);
          cell.after = n;
        }
        if (cell.status === "unchecked") cell.status = "ok";
        const reptWarn = cell.status === "warn" && cell.msg?.startsWith("the stated");
        if (stated != null && cell.after != null && stated !== cell.after && !reptWarn) {
          cell.msg = `the instructions make ${cell.after} sts; the pattern says ${stated}` + (cell.status === "warn" && cell.msg ? ` (and ${cell.msg})` : "");
          cell.status = "error";
        }
      } catch (e) {
        if (!(e instanceof CheckError)) throw e;
        if (e.kind === "unknown-stitch" || e.kind === "unreadable" || e.kind === "no-start") {
          cell.status = "unchecked"; cell.msg = e.message;
        } else {
          cell.status = "error"; cell.msg = e.message;
          const f: Finding = { i: line.i, size: s, kind: e.kind, msg: cap(e.message) + "." };
          if (line.kind === "row" && stated != null && cell.before != null) {
            const start = startFor(line.groups, p.craft, custom, s, stated);
            if (start != null && start !== cell.before) f.fix = `With ${start} sts before this row, it works and makes the stated ${stated}. Check the count going into it (${cell.before}).`;
          }
          findings.push(f);
        }
        cell.after = stated ?? null;
      }

      // Carry forward. On a mismatch, look at the next counted row to decide
      // whether the stated count is a typo or the instructions are wrong.
      if (cell.status === "error" && stated != null && cell.after != null && stated !== cell.after) {
        const verdict = lookAhead(p, k, s, cell.after, stated, custom);
        const f: Finding = { i: line.i, size: s, kind: "count", msg: `${cap(cell.msg!)}.` };
        if (verdict === "typo") { f.fix = `Every later round agrees with ${cell.after}, so ${stated} looks like a typo. Change it to ${cell.after}.`; live = cell.after; }
        else if (verdict === "instructions") { f.fix = `The next row expects ${stated}, so the stitches in this row are probably what's wrong.`; live = stated; }
        else { live = stated; }
        findings.push(f);
        cell.after = live;
      } else {
        live = cell.after;
      }
    }
  }

  const checked = results.filter((r) => r.kind !== "note" && r.cells.every((c) => c.status === "ok" || c.status === "error" || c.status === "warn")).length;
  const total = results.filter((r) => r.kind !== "note").length;
  return { sizes: p.sizes.length ? p.sizes : ["One size"], lines: results, findings, checked, total };
}

// Which starting count would make this row work and end at `target`? (for a fix hint)
function startFor(groups: Group[], craft: Craft, custom: Custom, s: number, target: number): number | null {
  for (let start = 1; start <= 2000; start++) {
    try { const o = rowAfter(groups, craft, custom, s, start); if (!o.warn && o.after === target) return start; } catch { /* keep looking */ }
  }
  return null;
}

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

function lookAhead(p: Parsed, k: number, s: number, computed: number, stated: number, custom: Custom): "typo" | "instructions" | "unknown" {
  for (let j = k + 1; j < p.lines.length; j++) {
    const l = p.lines[j];
    if (l.kind === "setup") return "unknown";
    if (l.kind !== "row") continue;
    const st = at(l.stated, s);
    const run = (start: number) => {
      try {
        let n = start;
        const reps = at(l.reps ?? 1, s) ?? 1;
        for (let r = 0; r < reps; r++) {
          const out = rowAfter(l.groups, p.craft, custom, s, n);
          if (out.warn) return null; // leftovers mean this start doesn't fit cleanly
          n = out.after;
        }
        return n;
      } catch { return null; }
    };
    const a = run(computed), b = run(stated);
    if (st == null) {
      // No stated count here: a repeat that only fits one start still tells us something.
      if (a != null && b == null) return "typo";
      if (b != null && a == null) return "instructions";
      continue;
    }
    if (a === st && b !== st) return "typo";
    if (b === st && a !== st) return "instructions";
    return "unknown";
  }
  return "unknown";
}
