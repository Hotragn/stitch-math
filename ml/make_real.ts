// Real held-out lines: every line of the 8 clean eval patterns, with Gemma 4 26B's read as gold.
// Only patterns where that read checks with zero findings are used, so the gold agrees with every stated count.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { readPattern } from "../src/parse/gemma.ts";
import { check } from "../src/engine/check.ts";
for (const l of readFileSync(".env", "utf8").split("\n")) { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim(); }
const out: string[] = [];
for (const f of readdirSync("evals/base")) {
  const { parsed } = await readPattern(readFileSync(`evals/base/${f}`, "utf8"));
  const r = check(parsed);
  if (r.findings.length) { console.log("skip", f, r.findings.length, "findings"); continue; }
  for (const L of parsed.lines) {
    if (L.kind === "unsupported") continue;
    out.push(JSON.stringify({ pattern: f, i: L.i, craft: parsed.craft, sizes: parsed.sizes, line: parsed.text[L.i], gold: L }));
  }
  console.log(f, "ok");
}
writeFileSync("ml/data/real_lines.jsonl", out.join("\n") + "\n");
console.log(out.length, "real lines");
