# Week 2 (Side Hustle) resume file

Deadline: Mon Oct 19 06:59 UTC (Sun 11:59 PM PDT). The founder publishes; the DEV draft must be staged and reviewed by ~20:00 UTC Sun.
Heartbeat: session cron 0df69177 at :07/:27/:47 runs "continue the Week 2 plan from docs/RESUME.md".

## Decisions (founder, Oct 18 ~09:00 UTC)
- Build: **stitch-math checker** for knit/crochet pattern designers. Gemma reads each row into stitch ops (JSON); code does the counting for every size and diagnoses mismatches.
- Categories: Overall + Best Use of Gemma + Tinker + Sentry Agent Tracing.
- Approved: (a) private GitHub repo under Hotragn, (b) new Render free web service, (c) Flare keep-awake off (done), (d) make the repo public after a secret scan.
- NOT approved: (e) publishing. Stage a DEV draft via DevRelay (published:false) and give the founder exact steps.
- No first user. The post says so honestly. Nothing extra to keep private.

## Milestones
- [x] M1 Engine (TS): stitch table, row model, repeats, multi-size, diagnosis + unit tests
- [x] M2 Gemma parser (chunks, JSON validation, retry, cache) + server + UI; runs locally
- [~] M3 Eval (pre-freeze: ours 24/24, 0 FA clean; Gemma alone 18/24, 17 FA; regex 6/24). Rerunning on frozen prompt b9b9bc8d -> evals/report.md: labelled set (own patterns with seeded errors, public-domain Gutenberg patterns, linked free patterns); 3 systems (regex, Gemma alone, ours)
- [~] M4 Repo + Render deploy (live: https://stitch-math.onrender.com, repo public: https://github.com/Hotragn/stitch-math, Render srv-dba9hg7btjjs73eapub0); phone tests pending + phone / in-app browser tests
- [x] M5 Tinker: Qwen3.5-4B LoRA r32 (tinker://dfa372e4-3fcc-5756-80fb-f0bfb950d37a:train:0/sampler_weights/stitch-reader-lora-v1), real lines 108/112, full checker 21/24 caught, 1 FA clean. ~$0.41 training per run (OMR rate), 2 runs small-parser fine-tune (stretch, measured or not claimed)
- [x] M6 Sentry: spans verified exported (debug log); trace id + readMs/countMs logged per check (hat 22.3 s read / 1.8 ms count). No auth token, so no dashboard screenshot; that's optional for the founder tracing with proof
- [x] M7 Post (<=1,800 words, template headings) + cover from our UI, staged as a DEV draft
- [x] M8 Fresh-context judge review, fix blockers, secret scan, repo public, docs/REPORT.md

## Notes
- Research is in docs/research/. Feasibility spikes are in docs/research/feasibility/.
- AI Studio: gemma-4-26b-a4b-it with thinkingLevel minimal works (~46 tok/s). Keep the JSON output compact.
- Avoid heavy subagents: the usage limit cost 4.5 h on Oct 17-18.

## Progress (Oct 18 ~10:40 UTC)
- Eval running: `EVAL_WORKERS=1 node evals/run.ts` (resumable; results in evals/results.json, report in evals/report.md). AI Studio 429s hit at 3 workers; the reader now falls back to gemma-4-31b-it and honours retryDelay.
- Tinker: `.venv` (py3.13) has tinker 0.34. Training: ml/train_tinker.py (Qwen3.5-4B LoRA r32, 2000 synthetic lines from ml/gen_lines.py; real held-out = ml/data/real_lines.jsonl, 112 lines from the 8 clean eval patterns with Gemma 26B gold). The log is in the scratchpad tinker.log; outputs go to ml/data/run.json and preds_*.jsonl. Scoring script still to write.
- Local mode works: GEMMA_LOCAL=1 uses Ollama gemma4:e4b-it-q4_K_M. Ball OK (found the error, 7/10 rows); hat: E4B dropped a size name (3 vs 4), which cascaded into false alarms. An honest finding for the post.
- Cost: OpenRouter lists Gemma 4 26B A4B at $0.07/M in and $0.34/M out. The hat check is ~4.1k in / 1.5k out, about $0.0008.

## Oct 18 ~11:05 UTC
- Real patterns: evals/real-patterns.md (4 dev patterns fixed to no flags; 3 held-out: lion clean, rolled-brim and Bene Beanie false flags on per-size sections = known limit).
- E4B (pre-freeze prompt): real 96/112 (86%), synthetic 153/200 (77%). Rerunning real-only on the frozen prompt (ml/report.md).
- Render auto-deploy has no webhook: run `python3 scripts/deploy.py` after each push.
- Post draft: docs/post.md (fill [[TINKER]], [[TINKER_LINE]], [[E4B]]; update eval numbers from the frozen run).
- Next: finish the post, stage the DEV draft (published:false), run a fresh-context judge review, fix, write REPORT.md.

## Oct 18 13:15 UTC (after the 2nd usage-limit stop, 11:20 to 13:10)
- Frozen eval: ours 22/24, 1 FA clean (misses: Gemma silently "fixed" 2 wrong instructions). The post, site and README say this.
- E4B frozen: 87/112 real lines (78%).
- Post: docs/post.md, 1,756 readable words, all [[..]] filled, 20/20 links 200, privacy scan clean.
- Running: lean judge review (sonnet). Then fix blockers, stage the DEV draft via DevRelay create_article published:false, fill the REPORT.md draft link, commit post.md.

## Oct 18 ~13:30 UTC: DONE except the founder's publish
- Judge review (sonnet): no false numbers; risks fixed. DEV draft 4872054 staged (published:false, some_ai, cover og.png). The founder publishes by 04:59 UTC Oct 19. Don't edit the post after the deadline.

## Oct 18 ~21:30 UTC: differentiation from StitchProof (rival, crochet, published 16:14 UTC)
- New identity: a grading sheet (white graph paper, navy #1f2a44, Inter + JetBrains Mono, a colour per size: blue, violet, cyan, slate). Signals: red, amber, green. No cream or serif.
- Main view: the size grid, preloaded with the 4-size hat; tap a red cell for the note. Note lines are behind a toggle; can't-check cells stay amber.
- New og.png, before.png, after.png (public/shot.html renders real API output).
- Post: knitting + multi-size angle; StitchProof named honestly; partners Gemma + Render only (Tinker and Sentry removed); demo snippet is 3-size knitting, verified live. DEV draft 4872054 updated (published:false; tags devchallenge, hf26challenge, gemma, knitting).
- Checker code unchanged, so the eval still holds (22/24, 1 FA). Tests 6/6.
- Side-by-side: docs/compare/side-by-side.png (git-ignored; contains the rival's screenshot).
- Repo description updated to the knitting multi-size angle.
