# Week 2 report: Stitch Math

## What shipped
- **Live app:** https://stitch-math.onrender.com (Render free tier, service `srv-dba9hg7btjjs73eapub0`; the first load after idle can take ~1 min)
- **Repo (public, MIT):** https://github.com/Hotragn/stitch-math
- **Post:** staged as a DEV draft, NOT published (you didn't pre-approve publishing). Link: [[DRAFT_LINK]]

## The product in one line
Paste a written knitting or crochet pattern. Gemma 4 reads each row into stitch steps, plain code counts every row for every size, and you get a tech editor's note for each count that doesn't add up.

## Evidence
- **Demand:** tech editors charge £30/h ([Sam Loves Yarn](https://www.samlovesyarn.co.uk/services-7)), about £50 a pattern on a £3.75 pattern ([Woolly Wormhead](https://woollywormhead.com/blog/2018/5/10/the-true-cost-of-a-pattern-revisited)); Ravelry added 87,106 patterns in 2022. No automated checker exists for written patterns, and 0 of ~1,040 Week 2 entries do this.
- **Eval (frozen prompt b9b9bc8d):** Gemma reads + code counts caught 22 of 24, with 1 false alarm on clean patterns (pre-freeze run: 24, 0). Gemma alone caught 18, with 17 false alarms. Regex caught 6.
- **Real patterns:** 7 free patterns by other designers, every flag checked by hand (`evals/real-patterns.md`). 4 shaped the fixes and now check clean; of 3 held out, 1 was clean and 2 (each size written as its own section) gave false alarms. That's a known limit, stated in the post.
- **Tinker:** Qwen3.5-4B LoRA, 108/112 real lines; the full checker with it caught 21/24. About $0.41 a run, 2 runs. Checkpoint `tinker://dfa372e4-3fcc-5756-80fb-f0bfb950d37a:train:0/sampler_weights/stitch-reader-lora-v1`.
- **Cost per check:** about $0.0008 for the 4-size hat at OpenRouter's Gemma 4 26B A4B prices (free on AI Studio today).
- **First user:** none (you said no one to ask). The post says so.

## What you need to do
1. **Publish the post** (not pre-approved): open the draft link above → read it → Publish. Do it by **Mon Oct 19, 04:59 UTC** (Sun 9:59 PM PDT / 12:59 AM ET) to keep the 2-hour buffer; the hard deadline is 06:59 UTC.
   After publishing, check: the tags (devchallenge, hf26challenge, gemma, opensource), the cover image, that the repo embed renders, and that the AI disclosure shows (it's set to some_ai).
2. **Optional:** open https://stitch-math.onrender.com once on your phone (Safari or WhatsApp's in-app browser) and try a sample. I could only emulate phone sizes; the iOS Simulator needs full Xcode, which this Mac doesn't have.
3. **Optional, for the Sentry category:** a screenshot of one trace from your Sentry project (search trace `ea0dedebfe67623455de21822453461e`, or any recent `stitch check` transaction). I have no Sentry auth token, so I couldn't capture one myself.
4. **Never rewrite the post after the deadline.** Any commit after 06:59 UTC must be listed in the README (the rules require it).

## Done on your approval
- (a) the repo and (b) the Render service were created.
- (c) Flare's keep-awake workflow is disabled. Undo: `gh workflow enable 381946255 -R Hotragn/flare`.
- (d) The repo was made public early, after a clean secret scan, because Render couldn't see it while private (DECISIONS.md D3).

## Deferred from Week 1 (memory)
Flare's 2 deferred tasks (rewrite history to drop the street name; make cloud Plan drafts reliable) are open now that Week 1 judging is over. They're untouched.
