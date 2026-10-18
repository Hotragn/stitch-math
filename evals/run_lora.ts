// The whole checker with the Tinker-trained 4B reader in place of Gemma, on the same 32 eval cases.
// Needs ml/data/preds_eval_lora.jsonl (from ml/train_tinker.py). Same scoring rule as evals/run.ts.
import { readFileSync, writeFileSync } from "node:fs";
import { toLine, splitLines } from "../src/parse/gemma.ts";
import { check, type Line } from "../src/engine/check.ts";

const preds = readFileSync("ml/data/preds_eval_lora.jsonl", "utf8").trim().split("\n").map((l) => JSON.parse(l));
const muts = JSON.parse(readFileSync("evals/mutants.json", "utf8"));
const W = 3;
let caught = 0, faClean = 0, faMut = 0, checked = 0, total = 0;
const rows: string[] = [];
for (const id of [...new Set(preds.map((p) => p.case))]) {
  const ps = preds.filter((p) => p.case === id).sort((a, b) => a.i - b.i);
  const lines: Line[] = ps.map((p) => {
    let raw: any = null;
    try { raw = JSON.parse(String(p.pred).trim()); } catch { /* unreadable */ }
    return (raw && toLine({ i: p.i, ...raw })) || { i: p.i, kind: "unsupported", why: "unreadable" };
  });
  const r = check({ craft: ps[0].craft, sizes: ps[0].sizes, lines, text: ps.map((p) => p.line) });
  const flags = [...new Set(r.findings.map((f) => f.i))];
  const k = id.endsWith("/clean") ? -1 : Number(id.split("/m")[1]);
  if (k < 0) { faClean += flags.length; checked += r.checked; total += r.total; }
  else {
    const m = muts[k];
    const line = splitLines(readFileSync(`evals/base/${m.base}.txt`, "utf8").replace(m.find, m.repl)).findIndex((l) => l.includes(m.repl.replace(/\s+/g, " ").trim().slice(0, 30)));
    if (flags.some((f) => f >= line && f <= line + W)) caught++;
    faMut += flags.filter((f) => !(f >= line && f <= line + W)).length;
  }
  rows.push(`| ${id} | ${JSON.stringify(flags)} |`);
}
const md = `\n## The checker with the Tinker-trained 4B reader (Qwen3.5-4B + LoRA)\n\nSame 32 cases, same scoring. Craft and sizes come from plain code; every line is read by the 4B model alone.\n\n| Reader | Errors caught (of 24) | False alarms on clean | False alarms on error versions | Rows checked (clean) |\n| --- | --- | --- | --- | --- |\n| Qwen3.5-4B + Tinker LoRA + code | ${caught} | ${faClean} | ${faMut} | ${checked}/${total} |\n\n| Case | Flags |\n| --- | --- |\n${rows.join("\n")}\n`;
writeFileSync("evals/report-lora.md", md);
console.log(md.split("| Case |")[0]);
