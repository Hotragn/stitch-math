# Decisions

## D1. Which idea (Oct 18, ~08:50 UTC). Founder asked me to decide: the notary pre-departure check, or a better open lane

**Call: the stitch-math checker for knit and crochet pattern designers.** One exception, below.

Why:
1. **Real test data tonight.** Public-domain patterns (1840s books on Project Gutenberg), my own written patterns and linked free modern patterns can be labelled and scored tonight, against two baselines: regex only, and Gemma alone. No public signed loan packages exist, so a notary eval would rest on simulated signatures unless someone signs real pages today.
2. **Execution risk, with ~20 hours left** (and a usage limit that already cost 4.5 hours). Stitch is text in, table out. The notary check needs PDF field mapping, page alignment, ink detection, a detector model on a 512 MB free server, and phone capture. The simpler build leaves time for polish, phone and in-app browser tests, and an early publish. Week 1 lacked all three.
3. **Judges can try it with their own material.** Any free pattern online works. Nobody has a loan package to hand.
4. **The decisive proof is already measured.** Gemma alone failed a 4-size hat in 3 of 3 runs. As a parser it got 8 of 8 lines right.
5. **Novelty is equal.** Both lanes have 0 entries in 1,042.

What the notary lane does better: a bigger money story, privacy that's truly required, and possibly the founder's person as a first user.

**Exception:** if the founder's person is a working signing agent who can sign and photograph a printed ~10-page sample package today, the notary check wins on real evidence plus a first user. I'd switch on the founder's word.

## D2. Flare keep-awake (Oct 18, ~08:45 UTC). Founder approved (c)
Disabled with `gh workflow disable 381946255 -R Hotragn/flare` (workflow "Keep the live app awake", now `disabled_manually`). No commit. Undo: `gh workflow enable 381946255 -R Hotragn/flare`.
