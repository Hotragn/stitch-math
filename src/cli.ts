// node src/cli.ts samples/hat.txt  -> reads with Gemma, checks with code, prints findings
import { readFileSync } from "node:fs";
import { readPattern } from "./parse/gemma.ts";
import { check } from "./engine/check.ts";
for (const l of readFileSync(".env", "utf8").split("\n")) { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim(); }
const t0 = Date.now();
const { parsed, usage } = await readPattern(readFileSync(process.argv[2], "utf8"));
const r = check(parsed);
console.log(`sizes=${JSON.stringify(r.sizes)} craft=${parsed.craft} checked ${r.checked}/${r.total} in ${Date.now() - t0} ms`, usage);
for (const l of r.lines) console.log(`${String(l.i).padStart(2)} ${l.kind.padEnd(11)} ${l.cells.map((c) => `${c.status[0]}${c.after ?? "?"}`).join(" ").padEnd(24)} ${l.text.slice(0, 60)}${l.cells.find((c) => c.msg) ? "  // " + l.cells.find((c) => c.msg)!.msg : ""}`);
console.log("FINDINGS:"); for (const f of r.findings) console.log(` line ${f.i} size ${f.size}: ${f.msg} ${f.fix ?? ""}`);
if (process.argv[3] === "--dump") console.log(JSON.stringify(parsed.lines));
