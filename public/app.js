const $ = (s) => document.querySelector(s);
const ta = $("#pattern"), go = $("#go"), status = $("#status");
let samples = {};
fetch("/api/samples").then((r) => r.json()).then((s) => { samples = s; }).catch(() => {});

document.querySelectorAll("[data-sample]").forEach((b) => b.addEventListener("click", async () => {
  if (!samples[b.dataset.sample]) samples = await fetch("/api/samples").then((r) => r.json());
  ta.value = samples[b.dataset.sample];
  document.querySelectorAll("[data-sample]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  run();
}));
go.addEventListener("click", run);
ta.addEventListener("keydown", (e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run(); });

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

async function run() {
  const pattern = ta.value.trim();
  if (pattern.length < 10) { say("Paste a pattern first, or try a sample.", true); return; }
  go.disabled = true;
  const lines = pattern.split("\n").filter((l) => l.trim()).length;
  const t0 = Date.now();
  const tick = setInterval(() => {
    const s = Math.round((Date.now() - t0) / 1000);
    say(s < 25 ? `Gemma is reading ${lines} lines… ${s}s` : `Still reading… ${s}s. The free server may be waking up.`);
  }, 500);
  try {
    const res = await fetch("/api/check", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ pattern }) });
    const out = await res.json().catch(() => ({ error: "The server sent something unexpected." }));
    if (!res.ok) throw new Error(out.error || `Error ${res.status}`);
    render(out);
    say("");
    $("#results").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  } catch (e) {
    say(e.message, true);
  } finally { clearInterval(tick); go.disabled = false; }
}

function say(t, bad = false) { status.textContent = t; status.classList.toggle("bad", bad); }

const SHORT = (r) => r.label || r.text.slice(0, 24);

function readAs(line) {
  if (!line) return "";
  if (line.kind === "setup") return `starts ${fmt(line.count)} sts`;
  if (line.kind === "repeat") return line.times === 0 ? `repeat rows ${line.from}–${line.to} until length` : `repeat rows ${line.from}–${line.to}, ${fmt(line.times)} more`;
  if (line.kind === "unsupported") return line.why;
  if (line.kind !== "row") return "";
  const ops = (o) => o.map((x) => x.group ? `(${ops(x.group)}) ×${fmt(x.times)}` : `${x.st}${x.same ? ` ${fmt(x.n)} in one st` : ` ${fmt(x.n)}`}`).join(", ");
  const g = line.groups.map((g) => g.rest ? `[${ops(g.ops)}] to end` : (g.times && g.times !== 1 ? `(${ops(g.ops)}) ×${fmt(g.times)}` : ops(g.ops))).join(", ");
  return (line.reps && line.reps !== 1 ? `${fmt(line.reps)} rows: ` : "") + g;
}
const fmt = (n) => Array.isArray(n) ? n.join("/") : n;

function render({ report, usage, ms, read, readMs, countMs }) {
  const sizes = report.sizes;
  const n = report.findings.length;
  const secs = (ms / 1000).toFixed(1);
  if (report.total === 0) {
    $("#summary").innerHTML = `<strong>Nothing to check</strong>`;
    $("#findings").innerHTML = `<li class="finding" style="border-left-color:var(--unc)">I couldn't find any rows, rounds or cast-on lines in that text. Paste the written instructions, one row or round per line.</li>`;
    $("#grid").innerHTML = ""; $("#results").hidden = false; return;
  }
  $("#summary").innerHTML = `<strong>${n === 0 ? "No problems found" : `${n} problem${n > 1 ? "s" : ""} found`}</strong>
    <span class="meta">${report.checked} of ${report.total} rows checked · ${sizes.length} size${sizes.length > 1 ? "s" : ""} · Gemma read it in ${((readMs ?? ms) / 1000).toFixed(1)}s${usage.cached && !usage.calls ? " (from cache)" : ""} · the counting took ${countMs ?? "<1"} ms</span>`;
  const byI = new Map(report.lines.map((l) => [l.i, l]));
  $("#findings").innerHTML = n === 0
    ? `<li class="clean">Every row that could be checked adds up in every size.${report.checked < report.total ? " Grey rows weren't checked; see the table." : ""}</li>`
    : report.findings.map((f) => {
        const l = byI.get(f.i);
        const size = f.size >= 0 && sizes.length > 1 ? ` <span>· ${esc(sizes[f.size])}</span>` : "";
        return `<li class="finding"><div class="where">${esc(l ? SHORT(l) : `Line ${f.i}`)}${size}</div>
          <div class="row-text">${esc(l?.text ?? "")}</div><div>${esc(f.msg)}</div>${f.fix ? `<p class="fix">${esc(f.fix)}</p>` : ""}</li>`;
      }).join("");
  const readBy = new Map((read || []).map((l) => [l.i, l]));
  const head = `<tr><th>Row</th>${sizes.map((s) => `<th>${esc(s)}</th>`).join("")}</tr>`;
  const rows = report.lines.map((l) => {
    const cls = l.kind === "note" ? "note" : "";
    const cells = l.cells.map((c) => {
      if (l.kind === "note") return `<td class="cell"></td>`;
      const v = c.after ?? "–";
      const tip = c.msg ? ` title="${esc(c.msg)}"` : (c.stated != null ? ` title="pattern says ${c.stated}"` : "");
      return `<td class="cell"><span class="c ${c.status}"${tip}>${v}</span></td>`;
    }).join("");
    const r = readAs(readBy.get(l.i));
    return `<tr class="${cls}"><td class="text">${esc(l.text)}${r && l.kind !== "note" ? `<span class="read">Gemma read: ${esc(r)}</span>` : ""}</td>${cells}</tr>`;
  }).join("");
  $("#grid").innerHTML = `<thead>${head}</thead><tbody>${rows}</tbody>`;
  $("#results").hidden = false;
}

// ?sample=hat runs a sample on load (used for links and the before/after screenshots)
const want = new URLSearchParams(location.search).get("sample");
if (want) {
  const b = document.querySelector(`[data-sample="${CSS.escape(want)}"]`);
  if (b) b.click();
}

// Savings calculator: the visitor's own numbers; the counting share is labelled as their estimate.
const calc = (id) => document.getElementById(id);
function recalc() {
  if (!calc("c-n")) return;
  const n = +calc("c-n").value, h = +calc("c-h").value, r = +calc("c-r").value, sh = +calc("c-s").value / 100;
  calc("o-n").textContent = n; calc("o-h").textContent = h; calc("o-r").textContent = r; calc("o-s").textContent = `${Math.round(sh * 100)}%`;
  const total = n * h * r;
  calc("r-total").textContent = `£${Math.round(total).toLocaleString()}`;
  calc("r-count").textContent = `£${Math.round(total * sh).toLocaleString()}`;
  const per = 5 * n, sub = 144; // cheaper of $5 a pattern or the $12/mo plan
  calc("r-ours").textContent = `$${Math.min(per, sub)}`;
  calc("r-plan").textContent = per <= sub ? `${n} × $5 per pattern` : `Designer plan, $12/mo`;
}
["c-n", "c-h", "c-r", "c-s"].forEach((id) => calc(id)?.addEventListener("input", recalc));
recalc();
