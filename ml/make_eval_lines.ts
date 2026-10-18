// All lines of the 32 eval cases, with craft and sizes found by plain code (no model), for the LoRA reader.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { splitLines } from "../src/parse/gemma.ts";
const bases = readdirSync("evals/base").filter((f) => f.endsWith(".txt")).map((f) => f.replace(".txt", ""));
const cases: { id: string; text: string }[] = bases.map((b) => ({ id: `${b}/clean`, text: readFileSync(`evals/base/${b}.txt`, "utf8") }));
JSON.parse(readFileSync("evals/mutants.json", "utf8")).forEach((m: any, k: number) => cases.push({ id: `${m.base}/m${k}`, text: readFileSync(`evals/base/${m.base}.txt`, "utf8").replace(m.find, m.repl) }));
const out: string[] = [];
for (const c of cases) {
  const lines = splitLines(c.text);
  const sl = lines.find((t) => /^sizes?\s*:/i.test(t));
  const sizes = sl ? sl.replace(/^sizes?\s*:/i, "").split(/[(),\[\]]/).map((x) => x.trim()).filter(Boolean) : [];
  const craft = /\b(sc|hdc|dc|magic ring|crochet|hook)\b/i.test(c.text) ? "crochet" : "knit";
  lines.forEach((line, i) => out.push(JSON.stringify({ case: c.id, i, craft, sizes, line })));
}
writeFileSync("ml/data/eval_lines.jsonl", out.join("\n") + "\n");
console.log(out.length, "lines from", cases.length, "cases");
