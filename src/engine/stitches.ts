// The stitch table: how many live stitches a stitch uses (in) and makes (out).
// Code owns these numbers. The model only names the stitch it read.

export type Craft = "knit" | "crochet";
export type Stitch = { in: number; out: number; name: string };

const S = (name: string, i: number, o: number): Stitch => ({ name, in: i, out: o });

// Keys are normalized: lowercase, no spaces, dots, dashes or underscores.
const KNIT: Record<string, Stitch> = {};
const CROCHET: Record<string, Stitch> = {};

function add(table: Record<string, Stitch>, st: Stitch, ...aliases: string[]) {
  for (const a of [st.name, ...aliases]) table[norm(a)] = st;
}

export function norm(s: string): string {
  return s.toLowerCase().replace(/[\s.\-_'’]/g, "");
}

// Knitting
add(KNIT, S("k", 1, 1), "knit", "k1", "ktbl", "k1tbl", "kb", "knitthroughbackloop");
add(KNIT, S("p", 1, 1), "purl", "p1", "ptbl", "p1tbl");
add(KNIT, S("sl", 1, 1), "slip", "sl1", "s1", "slwyif", "slwyib", "sl1wyif", "sl1wyib", "sl1k", "sl1p");
add(KNIT, S("k2tog", 2, 1), "k2tog", "k2togtbl", "ssk", "skp", "skpo", "sl1k1psso", "p2tog", "p2togtbl", "ssp", "dec", "k2t");
add(KNIT, S("k3tog", 3, 1), "p3tog", "sssk", "sssp", "sk2p", "sk2po", "s2kp", "s2kpo", "cdd", "sl2k1p2sso", "sl1k2togpsso", "dd", "doubledec");
add(KNIT, S("k4tog", 4, 1), "p4tog");
add(KNIT, S("yo", 0, 1), "yarnover", "yfwd", "yrn", "yon", "yf");
add(KNIT, S("yo2", 0, 2), "doubleyo", "yotwice", "yo twice");
add(KNIT, S("m1", 0, 1), "m1l", "m1r", "m1p", "m1pl", "m1pr", "make1", "lli", "rli", "lri", "inc0", "m1k");
add(KNIT, S("kfb", 1, 2), "pfb", "kfab", "inc", "kfandb", "pfandb", "kbf", "k1fb");
add(KNIT, S("kfbf", 1, 3));
add(KNIT, S("bo", 1, 0), "bindoff", "castoff", "bo1");
add(KNIT, S("co", 0, 1), "caston", "cableco", "backwardloopco");
add(KNIT, S("hold", 1, 0), "placeonhold", "puton hold", "slipto holder", "placeonwasteyarn");
add(KNIT, S("pm", 0, 0), "placemarker", "sm", "slipmarker", "rm", "removemarker", "turn", "wyif", "wyib");

// Crochet
add(CROCHET, S("sc", 1, 1), "singlecrochet", "x", "ukdc");
add(CROCHET, S("hdc", 1, 1), "halfdoublecrochet", "uk htr", "htr");
add(CROCHET, S("dc", 1, 1), "doublecrochet", "uktr");
add(CROCHET, S("tr", 1, 1), "treble", "triplecrochet", "ukdtr");
add(CROCHET, S("dtr", 1, 1), "doubletreble");
add(CROCHET, S("slst", 1, 1), "sl", "slipstitch", "ss");
add(CROCHET, S("blsc", 1, 1), "blo", "flo", "flsc", "fpdc", "bpdc", "fpsc", "bpsc", "fphdc", "bphdc", "fptr", "bptr",
  "bobble", "puff", "popcorn", "pc", "bo", "cluster", "cl", "nupp", "spike", "esc", "edc", "csc", "waistcoat");
add(CROCHET, S("inc", 1, 2), "increase", "2sc", "2scinnext", "scinc", "v", "w");
add(CROCHET, S("dec", 2, 1), "invdec", "invisibledecrease", "sc2tog", "hdc2tog", "dc2tog", "tr2tog", "a");
add(CROCHET, S("sc3tog", 3, 1), "dc3tog", "hdc3tog", "invdec3", "sc3dec");
add(CROCHET, S("ch", 0, 1), "chain", "chsp", "chainstitch");
add(CROCHET, S("turnch", 0, 0), "turningchain", "ch1turn", "turn", "join", "joinslst", "slsttojoin", "pm", "sm", "mark");
add(CROCHET, S("chasst", 1, 1), "chcountsasst", "ch3countsasdc", "ch2countsashdc", "ch1countsassc", "beginningch");
add(CROCHET, S("sk", 1, 0), "skip", "skipst", "sknext");

export function lookup(craft: Craft, st: string): Stitch | undefined {
  const key = norm(st);
  const primary = craft === "knit" ? KNIT : CROCHET;
  return primary[key];
}

// Special stitches a pattern defines itself ("CDD: ... (2 sts decreased)").
// The model reads the definition; the designer sees it and can correct it.
export type Custom = Record<string, { in: number; out: number }>;

export function resolve(craft: Craft, st: string, custom: Custom = {}): Stitch | undefined {
  const c = custom[norm(st)];
  if (c) return { name: st, in: c.in, out: c.out };
  return lookup(craft, st);
}
