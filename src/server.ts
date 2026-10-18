// The web app: static files, one check endpoint, and the samples.
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { readPattern } from "./parse/gemma.ts";
import { check } from "./engine/check.ts";
import { initTracing, span, traceId } from "./trace.ts";

if (existsSync(".env")) for (const l of readFileSync(".env", "utf8").split("\n")) {
  const m = l.match(/^([A-Z_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}
const tracing = await initTracing();
const PORT = Number(process.env.PORT ?? 8790);
const PUB = join(import.meta.dirname, "..", "public");
const SAMPLES: Record<string, string> = Object.fromEntries(["hat", "hat-fixed", "ball", "scarf"].map((n) => [n, readFileSync(join(import.meta.dirname, "..", "samples", `${n}.txt`), "utf8")]));
const MIME: Record<string, string> = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json", ".ico": "image/x-icon", ".webmanifest": "application/manifest+json" };

// Simple per-IP limit so the free key can't be drained.
const hits = new Map<string, number[]>();
function allowed(ip: string): boolean {
  const now = Date.now(), win = 60 * 60 * 1000;
  const list = (hits.get(ip) ?? []).filter((t) => now - t < win);
  if (list.length >= 30) return false;
  list.push(now); hits.set(ip, list); return true;
}

const stats = { checks: 0, rows: 0, problems: 0, since: new Date().toISOString() };

async function runCheck(pattern: string) {
  const t0 = Date.now();
  return span("gen_ai.invoke_agent", "stitch check", { "stitch.lines": pattern.split("\n").length }, async () => {
    const tid = traceId();
    const t1 = Date.now();
    const { parsed, usage } = await readPattern(pattern);
    const readMs = Date.now() - t1;
    const t2 = performance.now();
    const report = await span("stitch.count", "count every size", {}, async () => check(parsed));
    const countMs = Math.round((performance.now() - t2) * 10) / 10;
    console.log(JSON.stringify({ check: true, trace: tid, lines: parsed.text.length, sizes: report.sizes.length, findings: report.findings.length, readMs, countMs, calls: usage.calls, cached: usage.cached, inTok: usage.inTokens, outTok: usage.outTokens }));
    return { report, usage, ms: Date.now() - t0, readMs, countMs, craft: parsed.craft, read: parsed.lines };
  });
}

const json = (res: any, code: number, body: unknown) => { res.writeHead(code, { "content-type": "application/json", "cache-control": "no-store" }); res.end(JSON.stringify(body)); };

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://x");
  try {
    if (url.pathname === "/healthz") return json(res, 200, { ok: true, tracing });
    if (url.pathname === "/api/stats") return json(res, 200, stats);
    if (url.pathname === "/api/samples") return json(res, 200, SAMPLES);
    if (url.pathname === "/api/check" && req.method === "POST") {
      const ip = String(req.headers["x-forwarded-for"] ?? req.socket.remoteAddress ?? "").split(",")[0].trim();
      let body = ""; for await (const c of req) { body += c; if (body.length > 40_000) return json(res, 413, { error: "That pattern is too long for the free checker (40,000 characters)." }); }
      const pattern = String(JSON.parse(body || "{}").pattern ?? "");
      if (pattern.trim().length < 10) return json(res, 400, { error: "Paste a pattern first." });
      const isSample = Object.values(SAMPLES).some((s) => s.trim() === pattern.trim());
      if (!isSample && !allowed(ip)) return json(res, 429, { error: "That's 30 checks this hour from your connection. Try again in a bit." });
      const out = await runCheck(pattern);
      stats.checks++; stats.rows += out.report.checked; stats.problems += out.report.findings.length;
      return json(res, 200, out);
    }
    let path = url.pathname === "/" ? "/index.html" : url.pathname;
    const file = join(PUB, path.replace(/\.\.+/g, ""));
    if (file.startsWith(PUB) && existsSync(file)) {
      res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream", "cache-control": extname(file) === ".html" ? "no-cache" : "public, max-age=300" });
      return res.end(readFileSync(file));
    }
    res.writeHead(404); res.end("Not found");
  } catch (e: any) {
    console.error("check failed:", e?.message);
    json(res, 502, { error: "The reader didn't answer in time. Your pattern wasn't stored. Try again in a moment." });
  }
}).listen(PORT, () => {
  console.log(`stitch math on http://localhost:${PORT} (tracing ${tracing ? "on" : "off"})`);
  // Warm the samples so "Try a sample" answers fast after a cold start.
  for (const s of Object.values(SAMPLES)) runCheck(s).catch(() => {});
});
