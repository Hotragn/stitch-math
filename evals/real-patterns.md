# Real free patterns (Oct 18, 2026)

These are patterns written by other people, from their public pages. I don't copy their text into this repo; `evals/private/` (git-ignored) holds my local copies. I checked every flag below by hand.

## Development set: used to find gaps, then fixed

| Pattern | Sizes | First run | What it really was | Fix |
| --- | --- | --- | --- | --- |
| [Wormhead's Rollin' Beret](https://woollywormhead.com/blog/2005/12/30/pattern-for-wormheads-rollin-beret) (knit) | 4 | 7 flags | All false. Sizes start the crown at different rounds ("19in size jump to Rnd 4"), and "keep going like this until 6 sts remain" is an instruction, not a note | Per-size `only` flag on rows; "until N sts remain" resyncs the count; the count picks back up from the next stated number |
| [Royal Artisan Hat](https://allfreeknitting.com/Knit-Hats/Royal-Artisan-Hat/amp) (knit) | 2 | 10 flags | All false. "K4, k2tog around" (no asterisk) repeats the whole sequence; Round 7 is worked in one size only | One reading example; per-size `only` |
| [Little bears](https://amigurum.com/2018/07/little-bears-amigurumi.html) (crochet) | 1 | 1 flag | False. Rnd 7 joins the two legs (12 + 12 sts) | Rows that join pieces resync from the stated count |
| [Amigurumi pig](https://amigurum.com/2018/10/amigurumi-pig-crochet-pattern.html) (crochet) | 1 | 4 flags | All false: a new piece starting "2 ch, 6 sc in 2nd ch from hook", a leg join, and "BLO 24 sc" (back loop only is a modifier, not a stitch) | Reading examples; BLO/FLO count as 0 in the stitch table |

After the fixes, all four check with **no flags**. These four shaped the prompt, so they aren't a fair test.

## Held-out set: run once on the version before the last fixes

| Pattern | Sizes | Result | Notes |
| --- | --- | --- | --- |
| [Furls lion head (CAL week 4)](https://furlscrochet.com/blogs/amigurumi-crochet-tutorials/february-amigurumi-cal-pet-week-four) (crochet) | 1 | 19 of 21 rows checked, **no flags** | |
| [Family rolled brim hat](https://knitting-and.com/crafts-and-needlework/knitting/patterns/hats/rolled-brim/) (knit) | 6 | **False flags** on every size section after the first | It writes each size's crown under its own heading, and the checker carries one size's count into the next. Not fixed: a rule I tried didn't help, so I took it out |
| [Bene Beanie](https://christacodesign.com/bene-beanie-knitting-pattern/) (knit) | 11, in groups | **False "2 counts, 3 sizes" flags**, 23 of 224 lines checked | The page gives each group of sizes (baby, child, adult) its own block of numbers. Not handled |

Also: one run of the rolled-brim hat hit AI Studio's rate limit, and 15 lines came back unread. The app labels those lines "the reader was busy", not as a problem with the pattern.

**Honest summary:** on amigurumi and on hats written size-by-size in parentheses, it reads real patterns well. Patterns that give each size (or group of sizes) its own section aren't handled yet.
