// Score line readers by what matters: does the read give the same stitch counts as the gold read?
// node ml/score.ts            -> scores LoRA and base predictions (from Tinker) on both held-out sets
// GEMMA_LOCAL=1 node ml/score.ts --e4b  -> also reads every held-out line with Gemma 4 E4B (Ollama)
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { toLine } from "../src/parse/gemma.ts";
import { check, type Line, type Parsed } from "../src/engine/check.ts";

for (const l of readFileSync(".env", "utf8").split("\n")) { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim(); }
const jl = (f: string) => existsSync(f) ? readFileSync(f, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l)) : [];

function parseJson(t: string): any { try { return JSON.parse(String(t).trim().replace(/^```(json)?/, "").replace(/```$/, "").trim()); } catch { return null; } }

// The counts a single line produces for every size, from a given starting count per size.
function outcome(line: Line | null, sizes: string[], craft: "knit" | "crochet", before: (number | null)[]): string {
  if (!line) return "unreadable";
  if (line.kind === "note") return "note";
  if (line.kind === "unsupported") return "skip";
  const S = Math.max(1, sizes.length);
  const text = ["x"];
  const lines: Line[] = before.some((b) => b != null) ? [{ i: 0, kind: "setup", count: before.map((b) => b ?? 0).slice(0, S) as number[] }, { ...line, i: 1 } as Line] : [{ ...line, i: 0 } as Line];
  const p: Parsed = { craft, sizes, lines, text: lines.map(() => "x") };
  const r = check(p);
  const last = r.lines[r.lines.length - 1];
  return JSON.stringify({ k: line.kind, after: last.cells.map((c) => c.after), stated: last.cells.map((c) => c.stated), st: last.cells.map((c) => c.status === "unchecked" ? "u" : "c") });
}

const report: string[] = [];

// Synthetic held-out: gold is exact by construction.
const synth = jl("ml/data/heldout_synth.jsonl");
const synthBefore = (e: any) => (e.sizes.length ? e.sizes.map((_: string, k: number) => 120 + 12 * k) : [120]);
function scoreSynth(preds: any[], who: string) {
  let same = 0;
  for (const e of preds) {
    const b = synthBefore(e);
    const g = outcome(toLine({ i: 0, ...e.target }), e.sizes, e.craft, b);
    const p = parseJson(e.pred);
    const o = outcome(p ? toLine({ i: 0, ...p }) : null, e.sizes, e.craft, b);
    if (g === o) same++;
  }
  return `| ${who} | synthetic held-out | ${same}/${preds.length} (${Math.round((100 * same) / Math.max(1, preds.length))}%) |`;
}

// Real lines from the 8 clean patterns: gold is Gemma 4 26B's read, which checks with zero findings.
const real = jl("ml/data/real_lines.jsonl");
const beforeOf = new Map<string, (number | null)[]>();
for (const pat of [...new Set(real.map((r) => r.pattern))]) {
  const rows = real.filter((r) => r.pattern === pat).sort((a, b) => a.i - b.i);
  const p: Parsed = { craft: rows[0].craft, sizes: rows[0].sizes, lines: rows.map((r) => r.gold), text: [] };
  const maxI = Math.max(...rows.map((r) => r.i));
  p.text = Array.from({ length: maxI + 1 }, (_, i) => rows.find((r) => r.i === i)?.line ?? "");
  const rep = check(p);
  for (const l of rep.lines) beforeOf.set(`${pat}:${l.i}`, l.cells.map((c) => c.before));
}
function scoreReal(preds: any[], who: string) {
  let same = 0;
  const misses: string[] = [];
  for (const e of preds) {
    const b = beforeOf.get(`${e.pattern}:${e.i}`) ?? [null];
    const g = outcome(e.gold, e.sizes, e.craft, b);
    const p = parseJson(e.pred);
    const o = outcome(p ? toLine({ i: e.i, ...p }) : null, e.sizes, e.craft, b);
    if (g === o) same++; else if (misses.length < 6) misses.push(`${e.line.slice(0, 60)}`);
  }
  return { row: `| ${who} | real lines (8 patterns) | ${same}/${preds.length} (${Math.round((100 * same) / Math.max(1, preds.length))}%) |`, misses };
}

report.push("| Reader | Set | Lines that give the same counts as gold |", "| --- | --- | --- |");
const extraMiss: string[] = [];
for (const who of ["base", "lora"]) {
  const s = jl(`ml/data/preds_heldout_synth_${who}.jsonl`); if (s.length) report.push(scoreSynth(s, who === "lora" ? "Qwen3.5-4B + Tinker LoRA" : "Qwen3.5-4B, no fine-tune"));
  const r = jl(`ml/data/preds_real_${who}.jsonl`); if (r.length) { const x = scoreReal(r, who === "lora" ? "Qwen3.5-4B + Tinker LoRA" : "Qwen3.5-4B, no fine-tune"); report.push(x.row); extraMiss.push(`${who} misses: ${x.misses.join(" | ")}`); }
}

if (process.argv.includes("--e4b")) {
  // Gemma 4 E4B on this laptop, with the app's own reading prompt, one line at a time.
  const { readPattern } = await import("../src/parse/gemma.ts");
  const runOne = async (e: any, isReal: boolean) => {
    const head = e.sizes.length ? `Sizes: ${e.sizes[0]} (${e.sizes.slice(1).join(", ")})\n` : "";
    const { parsed } = await readPattern(head + e.line);
    const L = parsed.lines[parsed.lines.length - 1];
    return { ...e, pred: JSON.stringify(lineToRaw(L)) };
  };
  const out: any[] = [], outR: any[] = [];
  if (!process.argv.includes("--real-only")) for (const e of synth) out.push(await runOne(e, false));
  for (const e of real) outR.push(await runOne(e, true));
  if (out.length) writeFileSync("ml/data/preds_heldout_synth_e4b.jsonl", out.map((x) => JSON.stringify(x)).join("\n"));
  writeFileSync("ml/data/preds_real_e4b.jsonl", outR.map((x) => JSON.stringify(x)).join("\n"));
}
for (const who of ["e4b"]) {
  const s = jl(`ml/data/preds_heldout_synth_${who}.jsonl`); if (s.length) report.push(scoreSynth(s, "Gemma 4 E4B (Ollama, the app's prompt)"));
  const r = jl(`ml/data/preds_real_${who}.jsonl`); if (r.length) { const x = scoreReal(r, "Gemma 4 E4B (Ollama, the app's prompt)"); report.push(x.row); extraMiss.push(`e4b misses: ${x.misses.join(" | ")}`); }
}

// Back from the engine's Line to the reader's raw shape, so E4B reads go through the same toLine.
function lineToRaw(L: Line): any {
  if (L.kind === "note") return { k: "note" };
  if (L.kind === "unsupported") return { k: "skip", why: L.why };
  if (L.kind === "setup") return { k: "setup", c: L.count, ...(L.stated != null ? { s: L.stated } : {}) };
  if (L.kind === "repeat") return { k: "repeat", f: L.from, to: L.to, t: L.times };
  const ops = (o: any[]): any[] => o.map((x) => x.group ? { o: ops(x.group), t: x.times } : (x.same ? [x.st, x.n, 1] : [x.st, x.n]));
  const items: any[] = [];
  for (const g of L.groups) { if (g.rest) items.push({ o: ops(g.ops), r: 1 }); else if (g.times && g.times !== 1) items.push({ o: ops(g.ops), t: g.times }); else items.push(...ops(g.ops)); }
  return { k: "row", o: items, ...(L.reps && L.reps !== 1 ? { x: L.reps } : {}), ...(L.stated != null ? { s: L.stated } : {}) };
}

const md = `# Line readers, scored by stitch counts\n\nA read counts as right when the engine gets the same counts from it as from the gold read, for every size, from the same starting count.\n\n${report.join("\n")}\n\n${extraMiss.map((m) => `- ${m}`).join("\n")}\n`;
writeFileSync("ml/report.md", md);
console.log(md);
