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
- [ ] M1 Engine (TS): stitch table, row model, repeats, multi-size, diagnosis + unit tests
- [ ] M2 Gemma parser (chunks, JSON validation, retry, cache) + server + UI; runs locally
- [ ] M3 Eval: labelled set (own patterns with seeded errors, public-domain Gutenberg patterns, linked free patterns); 3 systems (regex, Gemma alone, ours)
- [ ] M4 Repo + Render deploy + phone / in-app browser tests
- [ ] M5 Tinker small-parser fine-tune (stretch, measured or not claimed)
- [ ] M6 Sentry tracing with proof
- [ ] M7 Post (<=1,800 words, template headings) + cover from our UI, staged as a DEV draft
- [ ] M8 Fresh-context judge review, fix blockers, secret scan, repo public, docs/REPORT.md

## Notes
- Research is in docs/research/. Feasibility spikes are in docs/research/feasibility/.
- AI Studio: gemma-4-26b-a4b-it with thinkingLevel minimal works (~46 tok/s). Keep the JSON output compact.
- Avoid heavy subagents: the usage limit cost 4.5 h on Oct 17-18.
