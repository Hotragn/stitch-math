const $ = (s) => document.querySelector(s);
const ta = $("#pattern"), go = $("#go"), status = $("#status");
let samples = {};
const loadSamples = async () => (Object.keys(samples).length ? samples : (samples = await fetch("/api/samples").then((r) => r.json())));

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmt = (n) => (Array.isArray(n) ? n.join("/") : n);
const SHORT = (r) => r.label || r.text.slice(0, 24);
const say = (t, bad = false) => { status.textContent = t; status.classList.toggle("bad", bad); };

document.querySelectorAll("[data-sample]").forEach((b) => b.addEventListener("click", async () => {
  await loadSamples();
  ta.value = samples[b.dataset.sample];
  document.querySelectorAll("[data-sample]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  run(ta.value);
}));
go.addEventListener("click", () => run(ta.value));
ta.addEventListener("keydown", (e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run(ta.value); });

async function run(text, { quiet = false } = {}) {
  const pattern = text.trim();
  if (pattern.length < 10) { say("Paste a pattern first, or try a sample.", true); return; }
  go.disabled = true;
  const lines = pattern.split("\n").filter((l) => l.trim()).length;
  const t0 = Date.now();
  const tick = setInterval(() => {
    const s = Math.round((Date.now() - t0) / 1000);
    const msg = s < 25 ? `Gemma is reading ${lines} lines… ${s}s` : `Still reading… ${s}s. The free server may be waking up.`;
    if (quiet) $("#summary").innerHTML = `<strong>${msg}</strong>`; else say(msg);
  }, 500);
  try {
    const res = await fetch("/api/check", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ pattern }) });
    const out = await res.json().catch(() => ({ error: "The server sent something unexpected." }));
    if (!res.ok) throw new Error(out.error || `Error ${res.status}`);
    render(out);
    say("");
    if (!quiet) $("#results").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  } catch (e) {
    if (quiet) $("#summary").innerHTML = `<strong>Couldn't load the sample: ${esc(e.message)}</strong>`; else say(e.message, true);
  } finally { clearInterval(tick); go.disabled = false; }
}

function readAs(line) {
  if (!line) return "";
  if (line.kind === "setup") return `starts ${fmt(line.count)} sts`;
  if (line.kind === "repeat") return line.times === 0 ? `repeat rows ${line.from}–${line.to} until length` : `repeat rows ${line.from}–${line.to}, ${fmt(line.times)} more`;
  if (line.kind === "unsupported") return line.why;
  if (line.kind !== "row") return "";
  const ops = (o) => o.map((x) => (x.group ? `(${ops(x.group)}) ×${fmt(x.times)}` : `${x.st}${x.same ? ` ${fmt(x.n)} in one st` : ` ${fmt(x.n)}`}`)).join(", ");
  const g = line.groups.map((g) => (g.rest ? `[${ops(g.ops)}] to end` : g.times && g.times !== 1 ? `(${ops(g.ops)}) ×${fmt(g.times)}` : ops(g.ops))).join(", ");
  return (line.reps && line.reps !== 1 ? `${fmt(line.reps)} rows: ` : "") + g;
}

let current = null, last = null, showNotes = false;

function render(out) {
  last = out;
  const { report, usage, ms, read, readMs, countMs } = out;
  current = report;
  const sizes = report.sizes;
  const sc = (k) => `var(--s${k % 6})`;
  $("#note").hidden = true;
  if (report.total === 0) {
    $("#summary").innerHTML = `<strong>Nothing to check</strong>`;
    $("#findings").innerHTML = `<li class="finding" style="border-left-color:#e0a400">No rows, rounds or cast-on lines found in that text. Paste the written instructions, one row or round per line.</li>`;
    $("#grid").innerHTML = ""; $("#sheet-foot").hidden = true; return;
  }
  const n = report.findings.length;
  const secs = ((readMs ?? ms) / 1000).toFixed(1);
  $("#summary").innerHTML = `<strong>${n === 0 ? "No mistakes found" : `${n} mistake${n > 1 ? "s" : ""} found`}</strong>
    <span class="meta">${report.checked}/${report.total} rows checked · ${sizes.length} size${sizes.length > 1 ? "s" : ""} · read ${usage.cached && !usage.calls ? "(cached)" : `in ${secs}s`} · counted in ${countMs ?? "<1"} ms</span>`;
  $("#legend").innerHTML = `<span><span class="dot ok"></span>adds up</span><span><span class="dot error"></span>mistake (tap it)</span><span><span class="dot unchecked"></span>can't check</span>` +
    (sizes.length > 1 ? sizes.map((s, k) => `<span class="sizekey" style="--sc:${sc(k)}"><i></i>${esc(s)}</span>`).join("") : "");
  const readBy = new Map((read || []).map((l) => [l.i, l]));
  const head = `<tr><th>Row</th>${sizes.map((s, k) => `<th class="size" style="--sc:${sc(k)}"><span>${esc(s)}</span></th>`).join("")}</tr>`;
  const notes = report.lines.filter((l) => l.kind === "note").length;
  const rows = report.lines.map((l, li) => {
    const cells = l.cells.map((c, k) => {
      if (l.kind === "note") return `<td class="cell" style="--sc:${sc(k)}"></td>`;
      const st = c.status;
      const v = c.after ?? "?";
      const said = c.stated != null && c.after != null && c.stated !== c.after ? `<small>says ${c.stated}</small>` : "";
      const label = `${sizes[k]}: ${st === "ok" ? "adds up" : st === "error" ? "mistake" : st === "info" ? "not worked in this size" : "can't check"}${c.msg ? `, ${c.msg}` : ""}`;
      const tappable = st === "error" || st === "warn" || st === "unchecked";
      return `<td class="cell" style="--sc:${sc(k)}">${tappable
        ? `<button type="button" class="c ${st}" data-l="${li}" data-s="${k}" title="${esc(c.msg ?? "")}" aria-label="${esc(label)}">${v}${said}</button>`
        : `<span class="c ${st}" aria-label="${esc(label)}">${st === "info" ? "–" : v}</span>`}</td>`;
    }).join("");
    const r = readAs(readBy.get(l.i));
    return `<tr class="${l.kind === "note" ? "note" : ""}"${l.kind === "note" && !showNotes ? " hidden" : ""}><td class="text">${esc(l.text)}${r && l.kind !== "note" ? `<span class="read">Gemma read: ${esc(r)}</span>` : ""}</td>${cells}</tr>`;
  }).join("");
  $("#grid").innerHTML = `<thead>${head}</thead><tbody>${rows}</tbody>` +
    (notes ? `<tfoot><tr><td colspan="${sizes.length + 1}"><button type="button" class="linkish" id="toggle-notes">${showNotes ? "Hide" : "Show"} ${notes} note line${notes > 1 ? "s" : ""} (title, yarn, finishing)</button></td></tr></tfoot>` : "");
  $("#toggle-notes")?.addEventListener("click", () => { showNotes = !showNotes; render(last); });
  $("#findings").innerHTML = n === 0 ? `<li class="clean">Every row that could be checked adds up in every size.</li>` : "";
  $("#sheet-foot").hidden = !(report.lines.some((l) => /Ridge Hat/.test(l.text)) && n === 2);
  const first = $("#grid button.c.error");
  if (first) showNote(first, false);
}

function showNote(btn, scroll = true) {
  const l = current.lines[+btn.dataset.l], k = +btn.dataset.s, c = l.cells[k];
  const f = current.findings.find((x) => x.i === l.i && (x.size === k || x.size === -1));
  const err = c.status === "error";
  const box = $("#note");
  box.className = `note-box ${err ? "err" : "warn"}`;
  const msg = f?.msg ?? (c.msg ? c.msg.charAt(0).toUpperCase() + c.msg.slice(1) + "." : "");
  box.innerHTML = `<b>${esc(SHORT(l))} · ${esc(current.sizes[k])}${err ? "" : " · can't check"}</b><div>${esc(msg)}</div>${f?.fix ? `<p class="fix">${esc(f.fix)}</p>` : ""}`;
  box.hidden = false;
  document.querySelectorAll("#grid button.c").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
  if (scroll) box.scrollIntoView({ block: "nearest", behavior: "smooth" });
}
$("#grid").addEventListener("click", (e) => { const b = e.target.closest("button.c"); if (b) showNote(b); });

// Preload the 4-size hat so the grid is the first thing anyone sees. ?sample= picks another.
(async () => {
  await loadSamples().catch(() => {});
  const want = new URLSearchParams(location.search).get("sample") || "hat";
  if (samples[want]) { ta.value = samples[want]; document.querySelector(`[data-sample="${CSS.escape(want)}"]`)?.setAttribute("aria-pressed", "true"); run(samples[want], { quiet: true }); }
})();

// Savings calculator: the visitor's own numbers; the counting share is labelled as their estimate.
const calc = (id) => document.getElementById(id);
function recalc() {
  if (!calc("c-n")) return;
  const n = +calc("c-n").value, h = +calc("c-h").value, r = +calc("c-r").value, sh = +calc("c-s").value / 100;
  calc("o-n").textContent = n; calc("o-h").textContent = h; calc("o-r").textContent = r; calc("o-s").textContent = `${Math.round(sh * 100)}%`;
  const total = n * h * r;
  calc("r-total").textContent = `£${Math.round(total).toLocaleString()}`;
  calc("r-count").textContent = `£${Math.round(total * sh).toLocaleString()}`;
  const per = 5 * n, sub = 144;
  calc("r-ours").textContent = `$${Math.min(per, sub)}`;
  calc("r-plan").textContent = per <= sub ? `${n} × $5 per pattern` : `Designer plan, $12/mo`;
}
["c-n", "c-h", "c-r", "c-s"].forEach((id) => calc(id)?.addEventListener("input", recalc));
recalc();
