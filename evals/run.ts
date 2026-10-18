// node evals/run.ts  -> runs 3 systems on 8 clean patterns + 24 single-error versions
// and writes evals/results.json and evals/report.md
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { readPattern, splitLines } from "../src/parse/gemma.ts";
import { readRegex } from "../src/parse/regex.ts";
import { check } from "../src/engine/check.ts";

for (const l of readFileSync(".env", "utf8").split("\n")) { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim(); }

type Case = { id: string; base: string; text: string; kind: string; line: number | null };
const bases = readdirSync("evals/base").filter((f) => f.endsWith(".txt")).map((f) => f.replace(".txt", ""));
const cases: Case[] = bases.map((b) => ({ id: `${b}/clean`, base: b, text: readFileSync(`evals/base/${b}.txt`, "utf8"), kind: "clean", line: null }));
const muts = JSON.parse(readFileSync("evals/mutants.json", "utf8"));
muts.forEach((m: any, k: number) => {
  const t = readFileSync(`evals/base/${m.base}.txt`, "utf8").replace(m.find, m.repl);
  const line = splitLines(t).findIndex((l) => l.includes(m.repl.replace(/\s+/g, " ").trim().slice(0, 30)));
  cases.push({ id: `${m.base}/m${k}`, base: m.base, text: t, kind: m.kind, line });
});

async function judgeAlone(text: string): Promise<number[]> {
  const lines = splitLines(text);
  const prompt = `You are an experienced knitting and crochet tech editor. Check this pattern's stitch counts for every size: every stated count, and whether every repeat fits the stitches on the needle or hook. Lines are tagged [L..].
Return JSON {"problems":[{"i": <the L number of the line with the problem>, "why": "<short>"}]}. Return {"problems":[]} if every count is right.

${lines.map((l, i) => `[L${i}] ${l}`).join("\n")}`;
  const body = { contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { thinkingConfig: { thinkingLevel: "minimal" }, temperature: 0, responseMimeType: "application/json" } };
  for (let a = 0; a < 3; a++) {
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent`, { method: "POST", headers: { "x-goog-api-key": process.env.GEMINI_API_KEY!, "content-type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(120_000) });
      if (!r.ok) throw new Error(String(r.status));
      const j: any = await r.json();
      const txt = (j.candidates?.[0]?.content?.parts ?? []).filter((p: any) => !p.thought).map((p: any) => p.text).join("");
      const d = JSON.parse(txt.replace(/^```(json)?|```$/g, "").trim());
      return [...new Set((d.problems ?? []).map((p: any) => Number(p.i)).filter((n: number) => Number.isInteger(n)))] as number[];
    } catch { await new Promise((r) => setTimeout(r, 3000 * (a + 1))); }
  }
  return [-1]; // failed
}

const flagged = (r: ReturnType<typeof check>) => [...new Set(r.findings.map((f) => f.i))];

type Row = { id: string; kind: string; line: number | null; system: string; flags: number[]; checked?: number; total?: number; ms: number };
const out: Row[] = existsSync("evals/results.json") ? JSON.parse(readFileSync("evals/results.json", "utf8")) : [];
async function one(c: Case) {
  if (out.filter((r) => r.id === c.id).length === 3) return;
  for (let k = out.length - 1; k >= 0; k--) if (out[k].id === c.id) out.splice(k, 1);
  let t = Date.now();
  const rx = check(readRegex(c.text));
  out.push({ id: c.id, kind: c.kind, line: c.line, system: "regex reader + code", flags: flagged(rx), checked: rx.checked, total: rx.total, ms: Date.now() - t });
  t = Date.now();
  const { parsed } = await readPattern(c.text);
  const ours = check(parsed);
  out.push({ id: c.id, kind: c.kind, line: c.line, system: "Gemma reader + code", flags: flagged(ours), checked: ours.checked, total: ours.total, ms: Date.now() - t });
  t = Date.now();
  out.push({ id: c.id, kind: c.kind, line: c.line, system: "Gemma alone", flags: await judgeAlone(c.text), ms: Date.now() - t });
  writeFileSync("evals/results.json", JSON.stringify(out, null, 1));
  process.stdout.write(".");
}

const queue = [...cases];
await Promise.all(Array.from({ length: Number(process.env.EVAL_WORKERS ?? 1) }, async () => { while (queue.length) await one(queue.shift()!); }));
writeFileSync("evals/results.json", JSON.stringify(out, null, 1));

// Scoring: a seeded error is caught if a flag lands on its line or up to 3 lines after it
// (a bad cast-on shows up on the first row that uses it). Any other flag is a false alarm.
const W = 3;
const systems = ["regex reader + code", "Gemma alone", "Gemma reader + code"];
let md = `# Eval: 8 clean patterns + 24 single-error versions\n\nRun ${new Date().toISOString()}. Patterns are in \`evals/base/\`, errors in \`evals/mutants.json\`. All written by the author; each error version changes exactly one thing.\n\nA seeded error counts as caught if a flag lands on its line or up to ${W} lines after it. Every other flag is a false alarm.\n\n| System | Errors caught (of 24) | False alarms on the 8 clean patterns | False alarms on the 24 error versions | Rows checked (clean) | Median time |\n| --- | --- | --- | --- | --- | --- |\n`;
for (const s of systems) {
  const rows = out.filter((r) => r.system === s);
  const mut = rows.filter((r) => r.kind !== "clean"), clean = rows.filter((r) => r.kind === "clean");
  const caught = mut.filter((r) => r.line != null && r.flags.some((f) => f >= r.line! && f <= r.line! + W)).length;
  const faClean = clean.reduce((a, r) => a + r.flags.filter((f) => f >= 0).length, 0);
  const faMut = mut.reduce((a, r) => a + r.flags.filter((f) => f >= 0 && !(f >= r.line! && f <= r.line! + W)).length, 0);
  const cov = clean.filter((r) => r.total).reduce((a, r) => [a[0] + r.checked!, a[1] + r.total!], [0, 0]);
  const ms = rows.map((r) => r.ms).sort((a, b) => a - b)[Math.floor(rows.length / 2)];
  md += `| ${s} | ${caught} | ${faClean} | ${faMut} | ${cov[1] ? `${cov[0]}/${cov[1]}` : "n/a"} | ${(ms / 1000).toFixed(1)} s |\n`;
}
md += `\n## By error kind\n\n| Kind | Count | ${systems.join(" | ")} |\n| --- | --- | ${systems.map(() => "---").join(" | ")} |\n`;
const kinds = [...new Set(muts.map((m: any) => m.kind))] as string[];
for (const k of kinds) {
  md += `| ${k} | ${out.filter((r) => r.kind === k && r.system === systems[0]).length} | ` + systems.map((s) => out.filter((r) => r.kind === k && r.system === s && r.flags.some((f) => f >= r.line! && f <= r.line! + W)).length).join(" | ") + " |\n";
}
md += `\n## Every case\n\n| Case | Kind | Line | ${systems.join(" | ")} |\n| --- | --- | --- | ${systems.map(() => "---").join(" | ")} |\n`;
for (const c of cases) md += `| ${c.id} | ${c.kind} | ${c.line ?? "-"} | ` + systems.map((s) => JSON.stringify(out.find((r) => r.id === c.id && r.system === s)?.flags ?? [])).join(" | ") + " |\n";
writeFileSync("evals/report.md", md);
console.log("\n" + md.split("## By error kind")[0]);
