import { test } from "node:test";
import assert from "node:assert/strict";
import { check, type Parsed } from "../src/engine/check.ts";

const sc = (n: number) => ({ st: "sc", n });
const inc = (n: number) => ({ st: "inc", n });
const dec = (n: number) => ({ st: "dec", n });

test("amigurumi ball: one wrong count is found and called a typo", () => {
  const text = ["Rnd 1: 6 sc in magic ring (6)", "Rnd 2: inc around (12)", "Rnd 3: (sc, inc) x 6 (18)",
    "Rnd 4: (sc 4, dec) x 3 (16)", "Rnd 5: (sc, dec) x 5 (10)"];
  const p: Parsed = { craft: "crochet", sizes: [], text, lines: [
    { i: 0, kind: "setup", count: 6, stated: 6 },
    { i: 1, kind: "row", groups: [{ ops: [inc(1)], rest: true }], stated: 12 },
    { i: 2, kind: "row", groups: [{ ops: [sc(1), inc(1)], times: 6 }], stated: 18 },
    // 18 -> (4 sc + dec) x 3 uses 18, makes 15. The pattern says 16.
    { i: 3, kind: "row", groups: [{ ops: [sc(4), dec(1)], times: 3 }], stated: 16 },
    { i: 4, kind: "row", groups: [{ ops: [sc(1), dec(1)], times: 5 }], stated: 10 },
  ] };
  const r = check(p);
  assert.equal(r.lines[3].cells[0].status, "error");
  assert.equal(r.lines[3].cells[0].after, 15);
  assert.match(r.findings[0].fix ?? "", /typo/);
  assert.equal(r.lines[4].cells[0].status, "ok");
});

test("4-size hat: the cast-on that can't fit and the 68 that should be 66", () => {
  const k = (n: number) => ({ st: "k", n }), k2tog = { st: "k2tog", n: 1 };
  const dec = (m: number, stated: number[], i: number) => ({ i, kind: "row" as const, groups: [{ ops: [k(m), k2tog], rest: true }], stated });
  const text = ["Cast on 64 (72, 76, 88) sts.", "Rnds 1-10: *K2, p2; rep from * around.", "Rnd 11", "Rnd 12: Knit.", "Rnd 13", "Rnd 14: Knit.", "Rnd 15"];
  const p: Parsed = { craft: "knit", sizes: ["Child", "Teen", "Adult S", "Adult L"], text, lines: [
    { i: 0, kind: "setup", count: [64, 72, 76, 88] },
    { i: 1, kind: "row", reps: 10, groups: [{ ops: [k(2), { st: "p", n: 2 }], rest: true }] },
    dec(6, [56, 63, 66, 77], 2),
    { i: 3, kind: "row", groups: [{ ops: [k(1)], rest: true }] },
    dec(5, [48, 54, 57, 68], 4),
    { i: 5, kind: "row", groups: [{ ops: [k(1)], rest: true }] },
    dec(4, [40, 45, 48, 55], 6),
  ] };
  const r = check(p);
  assert.equal(r.lines[2].cells[2].status, "error");           // 76 doesn't divide by 8
  assert.match(r.lines[2].cells[2].msg ?? "", /multiple of 8/);
  assert.equal(r.lines[4].cells[3].status, "error");           // 77 -> 66, says 68
  const f = r.findings.find((f) => f.i === 4 && f.size === 3)!;
  assert.match(f.fix ?? "", /66/);
  assert.equal(r.lines[6].cells[3].status, "ok");               // later rounds agree with 66
  for (const s of [0, 1]) for (const l of r.lines) assert.notEqual(l.cells[s].status, "error");
});

test("wrong number of sizes on a line is flagged", () => {
  const p: Parsed = { craft: "knit", sizes: ["S", "M", "L"], text: ["CO 60 (66, 72) sts", "Row 1"], lines: [
    { i: 0, kind: "setup", count: [60, 66, 72] },
    { i: 1, kind: "row", groups: [{ ops: [{ st: "k", n: 1 }], rest: true }], stated: [60, 66] },
  ] };
  assert.ok(check(p).findings.some((f) => f.kind === "sizes"));
});

test("unknown stitch is left unchecked, never guessed", () => {
  const p: Parsed = { craft: "knit", sizes: [], text: ["CO 20", "Row 1: k5, frobnicate, k to end"], lines: [
    { i: 0, kind: "setup", count: 20 },
    { i: 1, kind: "row", groups: [{ ops: [{ st: "k", n: 5 }, { st: "frobnicate", n: 1 }] }, { ops: [{ st: "k", n: 1 }], rest: true }] },
  ] };
  const c = check(p).lines[1].cells[0];
  assert.equal(c.status, "unchecked");
});

test("rep to last 2 sts with a nested repeat", () => {
  const p: Parsed = { craft: "knit", sizes: [], text: ["CO 44", "Row 1"], lines: [
    { i: 0, kind: "setup", count: 44 },
    { i: 1, kind: "row", groups: [{ ops: [{ st: "k", n: 2 }] }, { ops: [{ group: [{ st: "k2tog", n: 1 }, { st: "yo", n: 1 }], times: 2 }], rest: true }, { ops: [{ st: "k", n: 2 }] }], stated: 44 },
  ] };
  assert.equal(check(p).lines[1].cells[0].status, "ok");
});

test("size-only rows, resync after 'until N sts remain', and picking the count back up", () => {
  const k = (n: number) => ({ st: "k", n }), k2tog = { st: "k2tog", n: 1 };
  const p: Parsed = { craft: "knit", sizes: ["S", "L"], text: ["CO", "Work in patt", "Rnd 1", "Rnd 2", "until", "Next"], lines: [
    { i: 0, kind: "setup", count: [100, 120] },
    { i: 1, kind: "unsupported", why: "work in pattern" },
    { i: 2, kind: "row", groups: [{ ops: [k(18), k2tog], rest: true }], stated: [100, 114], only: [false, true] },
    { i: 3, kind: "row", groups: [{ ops: [k(17), k2tog], rest: true }], stated: [95, 108] },
    { i: 4, kind: "unsupported", why: "until", stated: 6 },
    { i: 5, kind: "row", groups: [{ ops: [k2tog], rest: true }], stated: 3 },
  ] };
  const r = check(p);
  assert.equal(r.findings.length, 0);
  assert.equal(r.lines[2].cells[0].status, "info");      // not worked in S
  assert.equal(r.lines[3].cells[1].status, "ok");        // L picked up at 114, then 108
  assert.equal(r.lines[5].cells[0].status, "ok");        // 6 -> 3
});
