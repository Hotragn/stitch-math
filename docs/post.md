---
title: "A first-pass tech edit for knitting designers: Gemma reads the rows, code counts the stitches"
published: false
tags: devchallenge, hf26challenge, gemma, opensource
cover_image: https://stitch-math.onrender.com/og.png
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 2: Side Hustle](https://dev.to/challenges/hacktoberfest-week2-2026-10-12)*

## What I Built

In 2018 a knitter on the KnittingHelp forum reached Row 15 of a hat pattern they'd paid for, and [the stitches didn't add up](https://forum.knittinghelp.com/t/help-too-many-stitches/129362). They had 16 stitches after Row 13, and Row 15 left two over on every needle. They recounted. The designer was away for a week. Another member worked the numbers and agreed the pattern was wrong, and they signed off relieved: "it wasn't me."

Designers who sell patterns pay to stop this happening. A **tech editor** reads every row and does the stitch math for every size before a pattern goes on sale:
- One editor's [rate card](https://www.samlovesyarn.co.uk/services-7) says £30 an hour, at 30 minutes to 7 hours a pattern.
- The designer Woolly Wormhead [puts tech editing at about £50 a pattern](https://woollywormhead.com/blog/2018/5/10/the-true-cost-of-a-pattern-revisited), on a pattern that sells for about £3.75. That's the biggest single cost on her list.
- Ravelry [added 87,106 patterns in 2022](https://blog.ravelry.com/2022-community-stats/).

I couldn't find a tool that checks a written pattern automatically. [Stitch Fiddle](https://www.stitchfiddle.com/en/help/1pem-8ycy8n) checks charts drawn in its own editor.

So I built **Stitch Math**, a first pass at the counting part of a tech edit:

1. **Gemma 4 reads each row** into stitch steps. "*K4, k2tog; rep from * around. 40 (45, 50, 55) sts." becomes *knit 4, knit 2 together, repeat to the end; the pattern promises 40, 45, 50 and 55*.
2. **Plain code counts.** A stitch table knows what each stitch uses and makes (k2tog uses 2 and makes 1; yo makes 1). The checker carries the live count from row to row, for every size, and checks that every repeat fits.
3. **You get a tech editor's note.** When a count is off, it reads ahead to tell a typo from a wrong instruction: *"Every later round agrees with 66, so 68 looks like a typo. Change it to 66."*

![Stitch Math finds two problems in a 4-size hat](https://stitch-math.onrender.com/og.png)

**Who'd pay, and how much:** a designer who pays £50 an edit on a £3.75 pattern. Stitch Math doesn't replace the editor: test knitting, charts, fit and wording still need a person. It catches the counting slips first, so the hours the designer pays for go on everything else. I'd charge **$5 a pattern or $12 a month**, with 3 free checks a month. A check costs me under a tenth of a cent in model time.

Payments aren't on yet, and I haven't put it in front of a designer, so I have no first user to report. The evidence of demand above is all public. The first thing I'd want from a paying designer is their messiest real pattern, because that's where the reader breaks.

## Demo

Here's what it does with one wrong round. Paste this:

```
Rnd 1: 6 sc in magic ring (6)
Rnd 2: inc in each st around (12)
Rnd 3: (sc, inc) x 6 (18)
Rnd 4: (2 sc, inc) x 6 (22)
Rnd 5: (3 sc, inc) x 6 (30)
```

You get: *"The instructions make 24 sts; the pattern says 22. Every later round agrees with 24, so 22 looks like a typo. Change it to 24."*

**[stitch-math.onrender.com](https://stitch-math.onrender.com)**. No sign-up. Tap a sample or paste any written pattern. It's on Render's free tier, so the first check after a quiet spell can take up to a minute while the server wakes.

The hat sample has two mistakes I put in:
- The Adult S cast-on is 76, which an 8-stitch decrease can't divide. The checker works out that 80 would fit.
- Rnd 3 says 68 where the stitches make 66.

Everything else adds up. Every row also shows what Gemma read, so a designer can see exactly what was checked.

## Code

{% embed https://github.com/Hotragn/stitch-math %}

MIT, Node 22.18+, no build step. Three files do the work:
- [`src/parse/gemma.ts`](https://github.com/Hotragn/stitch-math/blob/master/src/parse/gemma.ts) turns each line into JSON. An answer that fails the shape check is marked "not checked", never guessed.
- [`src/engine/stitches.ts`](https://github.com/Hotragn/stitch-math/blob/master/src/engine/stitches.ts) is the stitch table.
- [`src/engine/check.ts`](https://github.com/Hotragn/stitch-math/blob/master/src/engine/check.ts) counts every size, checks repeats, and tells typos from wrong instructions.

## How I Built It

### Why Gemma doesn't do the math

Before writing code, I asked Gemma 4 (26B A4B, on Google AI Studio) to tech-edit the 4-size hat itself, three times. Every run flagged rounds that were fine, used the wrong repeat sizes ("56 is not divisible by 6" for a 7-stitch repeat), and contradicted itself. It never cleanly caught the 68. As a *reader*, the same model got 8 of 8 test lines right ([the spike](https://github.com/Hotragn/stitch-math/tree/master/docs/research/feasibility)). So reading is its only job. Here's one round:

```json
{"i":7,"k":"row","o":[{"o":[["k",6],["k2tog",1]],"r":1}],"s":[56,63,70,77]}
```

*Knit 6, k2tog, repeat to fill the round (`r`); the pattern states 56, 63, 70 and 77.* The model never produces a count.

For each size, the engine walks from the cast-on. A repeat must divide what's left exactly. When a stated count disagrees, it runs the next row from both numbers to tell a typo from a wrong instruction, and for a repeat that doesn't fit it searches for the start that would ("80 would fit").

### Measured: 24 errors I put in, two baselines

I wrote 8 patterns: amigurumi, a 4-size hat, mittens with a thumb gusset, a lace cowl, a top-down yoke, a crochet blanket and an eyelet scarf. Then I made 24 copies, each with exactly one error (a wrong count, a wrong instruction, or a cast-on that can't work), and ran three systems on all 32 ([full report](https://github.com/Hotragn/stitch-math/blob/master/evals/report.md)):

| | Errors caught (of 24) | False alarms on the 8 clean patterns |
| --- | --- | --- |
| Rules I wrote by hand + code (no model) | 6 | 0 (it could read only 38 of 81 rows) |
| Gemma 4 acting as the editor alone | 18 | **17** |
| **Gemma reads, code counts** | **22** | **1** |

Gemma alone lands on every typo, partly because it flags almost every line (7 of the hat's 14 rows when nothing was wrong). It raised 17 false alarms on patterns with nothing wrong, and it caught only 2 of the 5 impossible cast-ons, which take arithmetic across many rows.

The split version's misses taught me something. In both, Gemma quietly *fixed* the mistake while reading: "dec x 5" came back as 6 decreases, and "sc in 3rd ch from hook" as the 2nd. The reader is told never to correct anything, and still did, twice. The one false alarm was "sc around" read as a single stitch. A run before my last prompt changes scored 24 of 24 with none ([that report](https://github.com/Hotragn/stitch-math/blob/master/evals/report-prefreeze.md)); I'm reporting the version that ships. A caveat: I wrote these patterns and tuned the prompt while looking at them, which is why the real patterns below matter more. It's slower, at 20.5 s median versus 4 s, and the time is all reading; the counting takes about 2 ms.

The patterns are mine, so I also tried seven free patterns from designers' sites, checking every flag by hand ([notes](https://github.com/Hotragn/stitch-math/blob/master/evals/real-patterns.md)). The first four exposed gaps, and every flag was a false alarm: sizes that start the crown at different rounds, "K4, k2tog around" with no asterisk, a round that joins two legs, and "BLO 24 sc" (a modifier, not a stitch). After the fixes, those four check clean. Of three I then ran untouched, a crochet lion head was clean. Two hats that write each size as its own section gave false alarms, and that's an open limit.

### What went wrong

- **Gemma numbered lines by their round.** Line 10 said "Rnd 12" and came back as line 12. Now, if the answer has one object per line sent, code trusts the order, not the model's numbers.
- **"Ch 1, turn"** counted the turning chain as a stitch, so every crochet row came out one over. Conventions like that live in code, not the prompt.
- **AI Studio's rate limit** killed my first eval run. The reader now waits as asked, falls back to Gemma 4 31B (a separate quota), and labels unread lines "the reader was busy" instead of blaming the pattern.

### Tinker: a 4B reader for a designer's laptop

For a designer who wants nothing to leave the laptop, I used Tinker to teach a small model the reading job.

- [`ml/gen_lines.py`](https://github.com/Hotragn/stitch-math/blob/master/ml/gen_lines.py) writes 2,000 synthetic lines in many notations, each with its JSON answer. Code writes both halves, so every answer is exact.
- A rank-32 LoRA on Qwen3.5-4B: 2 epochs, 551k tokens, about 8 minutes. That's about $0.41 at Tinker's listed $0.737 per million training tokens ([OMR](https://omr.com/en/reviews/product/tinker/pricing)).
- It was trained only on synthetic lines. On the 112 lines of my 8 test patterns, 108 gave the same counts as Gemma 26B's verified reads (96%).
- Reading every line of the 32-case eval, it let the checker catch **21 of 24** errors, with 1 false alarm on clean patterns and 4 extra flags on the error versions ([report](https://github.com/Hotragn/stitch-math/blob/master/evals/report-lora.md)).

It isn't in the live app yet: the adapter lives on Tinker, and running it in Ollama means exporting it first.

### Sentry: where a check's time goes

Each check is one trace: a `gen_ai.invoke_agent` span, a `gen_ai.chat` span per Gemma read (model, tokens, attempt), and a `stitch.count` span. Spans carry counts and timings, never pattern text ([`src/trace.ts`](https://github.com/Hotragn/stitch-math/blob/master/src/trace.ts)). On the 4-size hat, reading took 22.3 s and counting 1.8 ms ([the log](https://github.com/Hotragn/stitch-math/blob/master/evals/timings.md)). All the waiting is reading, which is why the small reader matters.

## Why Does Open Innovation Matter?

- **The price only works near $0.** On a paid open-model host, Gemma 4 26B A4B is [$0.07 per million input tokens and $0.34 per million output](https://openrouter.ai/models/google/gemma-4-26b-a4b-it-20260403). The 4-size hat (4,253 tokens in, 1,421 out) costs about $0.0008 to check, so a $5 check and a free tier both work on a £3.75 pattern.
- **An unreleased pattern is the product.** With open weights, the whole app runs on a laptop (`GEMMA_LOCAL=1`, Ollama), and the pattern never leaves it. Honestly, the small Gemma 4 E4B reads 87 of the 112 test lines right (78%), against 96% for the Tinker 4B. The local path is real, and it's also why I trained the small reader.
- **No lock-in.** If AI Studio changes its free tier, the same prompt runs on any host that serves Gemma, or on the designer's own machine. The model, the stitch table and the checker are all open, so each piece can be swapped and tested on its own.

**What it can't do yet:** charts, "work in pattern as established", "at the same time" shaping, short rows, and patterns that write each size as its own section. And it checks counts, not fit; that's what test knitters are for.

## Prize Categories

- **Best Use of Gemma:** Gemma 4 only reads, and code counts: 22 of 24 seeded errors caught with 1 false alarm on clean patterns, where Gemma acting as the editor caught 18 and raised 17.
- **Best Use of Tinker:** a $0.41 LoRA taught Qwen3.5-4B to read pattern lines from synthetic data alone: 108 of 112 lines right on patterns it never trained on, and 21 of 24 errors caught (1 false alarm) when it drives the whole checker.
- **Best Use of Sentry Agent Tracing:** one trace per check, with each Gemma read as its own span. It shows reading at 22.3 s and counting at 1.8 ms, with no pattern text sent.

*How I used AI: I picked this idea from a research pass over this week's entries and public evidence of what people pay for, and directed the build. Claude Code wrote the code and drafted this post from the repo's results, and a separate fresh review session checked every number against the repo before I published. The sample and test patterns were written for this project.*
