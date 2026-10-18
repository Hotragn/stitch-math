# Why the 34 past winners won

Sources: [Touch Grass winners](https://dev.to/devteam/congrats-to-the-hacktoberfest-open-source-ai-challenge-touch-grass-winners-152c) and [Build for a Friend winners](https://dev.to/devteam/congrats-to-the-hacktoberfest-weekend-challenge-build-for-a-friend-winners-pgc).

Method, stated plainly. I read both overall winners in full.
- **Before I Call**: the full post, via DevRelay.
- **Paper Trail**: the DEV API now returns 404 for it, so I read the live page through WebFetch.

For the other 32, a script pulled every body from the public DEV API and measured it: prose word count, images, tables, measured numbers, and links to a live demo, a repo or a video. It also flagged whether a real person or a field test appears. I then read each opening myself. A background agent was meant to read all 32 in full, but it died at the usage limit, so the per-post notes below are lighter than a full read.

## The two overall winners (read in full)

| | Paper Trail (Week 1 overall) | Before I Call (Weekend overall) |
| --- | --- | --- |
| Idea | Place and date in, one printable field card out; then the screen goes away | Practice a scary Japanese phone call with an AI before making the real one |
| Writing | ~1,800 words, template headings plus 4 subheads. Calls the model "a careless witness". | ~3,200 words. Opens on one specific moment (20 minutes staring at the building manager's number), then a video. Plain and warm. |
| Relevance (open AI) | Gemma 3 1B in the browser over WebGPU, no backend, $0 per card | Gemma 4 31B in the cloud, and the same app runs fully local (Whisper + Gemma 4 E2B + Kokoro), with an honest "the local version isn't as good" |
| Creativity | An anti-app: the output is paper | Role-play with a hidden "explain question" helper the AI on the call can't see |
| Execution proof | Every tip is checked against the Wikipedia sentence it came from, with a retry and then a quote fallback. Measured over 4 prompt versions on 72 species: 3 passed at first, 29 after tuning, 39 after a retry. A hand review found 29 correct, 5 clumsy, 5 wrong. | 87 tests; a cost per turn of about $0.0002; dashboards shown as screenshots (113 conversations, Render logs, a Sentry issue that fired 8 times); one domain fix that's easy to remember (7時 is shichiji, with 6,107 pronunciation rules) |
| Real-world proof | **None.** The author's own tests, a live demo and an eval report. | One WhatsApp screenshot of a friend's reply, plus a surprise: they liked the PDF most |
| Partners | 0 to 1 | 5, each one line with a specific fact |

**What both did that most entries didn't:** one core loop, explained in the first screen; a check that makes the model's output trustworthy, with a measured before and after including the failures; and a free demo with no sign-up.

## All 34 winners

Key: Live/Repo/Video = links in the post. Nums = measured numbers in the prose. Real proof = a named real person or a field test.

| Post | Category | Words | Hook (my read of the opening) | Live / Repo / Video | Nums | Real proof |
| --- | --- | --- | --- | --- | --- | --- |
| [Paper Trail](https://dev.to/mike_kim_692aa79c288bfed8/paper-trail-gemma-writes-your-walk-a-field-card-then-the-screen-goes-away-3mf4) | W1 Overall | ~1,800 | Nature apps keep you on the phone; this one prints a card | Yes / Yes / - | many | No |
| [Golden Hour](https://dev.to/tanay_singh_1005/golden-hour-an-open-model-that-finds-your-40-minutes-outside-and-where-to-spend-them-5fe8) | W1 Render | 1,864 | "Two small decisions": when, and what | Yes / Yes / No | 2 | Yes |
| [Turnaround](https://dev.to/code_neuron58/turnaround-an-open-source-hiking-buddy-that-knows-when-you-should-turn-back-and-tells-someone-if-1pha) | W1 TabPFN | 2,344 | Hiking trouble isn't dramatic; you just keep going | No / Yes / Yes | 16 | Yes |
| [Distilled 397B into 4B for $1.60](https://dev.to/soumyadeepdey/i-distilled-a-397b-model-into-a-4b-one-for-160-it-now-catches-28-of-33-park-alerts-that-should-bic) | W1 Tinker | 4,752 | The headline is the result: 28 of 33 alerts | No / Yes / No | 44 | No |
| [Arduino UNO Q device](https://dev.to/utsavbhattarai007/i-won-an-arduino-uno-q-at-a-hack-day-now-im-building-a-device-to-help-me-touch-grass-k68) | W1 Arduino | 1,874 | A personal hack-day story | No / Yes / Yes | 0 | Yes |
| [Leaf Peep](https://dev.to/sbis04/leaf-peep-an-open-model-reads-the-trees-so-you-know-where-to-walk-this-weekend-16hk) | W1 DigitalOcean | 1,887 | "Are the leaves turning yet, and where?" | Yes / No / Yes | 4 | No |
| [Grow a Song](https://dev.to/anshsaini/grow-a-song-my-run-wrote-its-own-soundtrack-with-gemma-running-on-my-phone-44ml) | W1 Gemma | 1,478 | One concrete 35-minute run | No / Yes / Yes | 2 | No |
| [Weekend Micro-Adventure](https://dev.to/dumnicki/weekend-micro-adventure-3bee) | W1 Backboard | 1,745 | One screen, three choices, one card | Yes / Yes / No | 2 | No |
| [Outside](https://dev.to/defiantlydefying/outside-i-built-a-meditation-app-whose-only-goal-is-to-make-you-stop-looking-at-it-5dnk) | W1 ElevenLabs | 1,551 | "Close your eyes" vs walking into a tree | No / Yes / Yes | 1 | No |
| [Should I Go Out?](https://dev.to/scs0209/should-i-go-out-a-local-gemma-agent-that-picks-one-outdoor-plan-then-tells-you-to-put-your-phone-5hbh) | W1 Entire | 2,844 | One tap, one plan, phone away | No / Yes / No | 20 | Yes |
| [Touch Grass Garden](https://dev.to/yuvan_shankar/touch-grass-garden-a-plant-tracker-that-only-counts-the-days-you-went-outside-10na) | W1 Copilot | 1,822 | An app that doesn't care if you open it | No / Yes / Yes | 0 | No |
| [Your photo picks the next street](https://dev.to/asiboy6789/your-photo-picks-the-next-street-a-walking-mystery-on-open-weight-gemma-33od) | W1 Mastra | 5,011 | Opens on a demo recording | No / Yes / Yes | 47 | No |
| [LumiRoam](https://dev.to/aryan_sethi_afdba87340e96/lumiroam-a-tour-guide-that-tells-you-where-to-stand-which-lens-to-use-and-when-the-light-is-right-1i1h) | W1 MongoDB | 2,933 | "I'm a beginner photographer" | Yes / Yes / Yes | 3 | No |
| [Too tired to glad I went out](https://dev.to/antoniahp/i-asked-gemma-to-turn-im-too-tired-into-glad-i-went-out-fi1) | W1 Sentry | 3,716 | The door vs the sofa | Yes / No / Yes | 9 | Yes |
| [Walking a game](https://dev.to/nikithakls17sys/i-made-walking-a-game-quests-a-diary-and-an-app-that-judges-your-screen-time-2fii) | W1 SerpApi | 2,096 | A tired student who heals outside | No / Yes / Yes | 3 | Yes |
| [Butterflies don't take weekends off](https://dev.to/codersacademy006/butterflies-dont-take-weekends-off-40000-pune-sightings-and-a-forecast-that-fell-apart-when-i-1g4) | W1 Temporal | 2,329 | A surprising number: 12.2 vs 4.0 species | Yes / Yes / No | 9 | No |
| [Nice Out](https://dev.to/anishisbusy/nice-out-an-app-that-learns-your-kind-of-nice-weather-then-tells-you-to-go-outside-58bg) | W1 Tiger Data | 1,208 | One question: when should I go out? | Yes / Yes / Yes | 9 | No |
| [Before I Call](https://dev.to/adk_bbx/phone-calls-are-the-boss-fight-of-living-in-japan-1h6h) | Weekend Overall | 3,223 | 20 minutes staring at a phone number | Yes / Yes / Yes | 10 | Yes |
| [Project JARVIS](https://dev.to/abhinavkrishna3211/jarvis-ai-lab-assistant-18jp) | WK Arduino | 2,684 | New students can't find the vernier | No / No / Yes | 18 | No |
| [The BMW manual was off-limits](https://dev.to/alexgeorgiev17/i-couldnt-legally-use-the-repair-manual-so-i-built-my-friend-something-better-84) | WK DigitalOcean | 2,571 | A constraint as a story | Yes / Yes / No | 1 | Yes |
| [Gemma 4 reads my parents' mail](https://dev.to/uptimearchitect/gemma-4-reads-my-parents-mail-at-home-39-test-letters-9-of-them-real-and-one-calm-wrong-answer-3obf) | WK Gemma | 2,810 | The pile on the kitchen table; the headline admits a wrong answer | No / Yes / Yes | 23 | Yes |
| [Tala](https://dev.to/highcenburg/tala-free-audio-to-text-for-my-designer-friend-no-signup-no-credit-card-2o26) | WK Render | 1,716 | A friend's exact question, quoted | No / Yes / No | 0 | Yes |
| [Sub-5 70.3](https://dev.to/iamrobertmoore/my-mate-wants-a-sub-5-703-before-recommending-one-i-made-an-open-model-predict-79-of-my-old-race-4kcp) | WK TabPFN | 2,511 | A mate's goal; the headline gives the result | Yes / Yes / Yes | 31 | Yes |
| [Rakshak](https://dev.to/muaazsm/rakshak-i-built-my-parents-a-scam-checker-that-never-leaves-the-house-22ah) | WK Tinker | 2,277 | "My parents have never lost money to a scam" | No / No / No | 32 | Yes |
| [Kharcha](https://dev.to/coffeeandcommits/kharcha-a-4b-model-that-reads-indian-bank-sms-so-the-money-stays-on-your-laptop-2n8j) | WK Backboard | 1,796 | The headline names the job and the privacy | Yes / Yes / No | 25 | Yes |
| [Padh Ke Batao](https://dev.to/rahullkumr/padh-ke-batao-an-ai-that-reads-my-grandfathers-documents-to-him-on-a-laptop-with-no-gpu-3818) | WK ElevenLabs | 1,875 | A grandfather and his documents | No / Yes / Yes | 5 | Yes |
| [Viva](https://dev.to/iamwasih/viva-a-mock-interview-that-knows-which-parts-of-your-project-an-ai-wrote-ahe) | WK Entire | 1,074 | "Walk me through this function" | Yes / Yes / Yes | 6 | No |
| [Panic button](https://dev.to/dosunmu_hassan_46f2ac141d/i-built-a-panic-button-that-doesnt-tell-me-anything-published-4glf) | WK Copilot | 2,328 | Support that turns into surveillance | Yes / Yes / No | 3 | Yes |
| [Prep Buddy](https://dev.to/bipul_chamoli_09b5f0cc719/prep-buddy-an-ai-interview-coach-for-my-classmate-that-runs-on-his-laptop-with-the-wi-fi-off-426b) | WK Mastra | 1,944 | A named classmate preparing for placements | No / No / Yes | 7 | Yes |
| [Sister-in-law's cookbook](https://dev.to/raphelevator/i-turned-my-sister-in-laws-voice-notes-into-a-cookbook-that-answers-in-her-voice-41ja) | WK MongoDB | 2,074 | Recipes that live only in one person | Yes / No / No | 1 | Yes |
| [ADHD friend, fine-tuned 4B](https://dev.to/arqamwd/if-its-not-in-front-of-me-its-gone-i-fine-tuned-a-4b-model-for-my-friend-with-adhd-o4) | WK Sentry | 3,147 | The friend's own two-line answer | No / Yes / No | 71 | Yes |
| [Pīzhù](https://dev.to/muhammadmurtuzahussain/pizhu-pi-zhu-a-writing-tutor-that-never-rewrites-your-essay-built-for-my-friend-joy-gemma-4-2n6e) | WK SerpApi | 2,573 | A named friend and real tutor comments | Yes / Yes / No | 5 | Yes |
| [PaidYet](https://dev.to/prateek11rai/paidyet-for-the-friend-who-says-kal-bhej-dunga-p5l) | WK Temporal | 2,398 | A phrase everyone knows ("kal bhej dunga") | No / Yes / No | 27 | No |
| [Supplements shop helper](https://dev.to/priyanshu_jha_eee132b17e5/my-friend-runs-her-supplements-shop-from-whatsapp-voice-notes-so-i-built-her-a-shop-helper-5785) | WK Tiger Data | 1,888 | A friend's real workflow | Yes / Yes / Yes | 1 | Yes |

## Numbers across the 34

- **Length:** median 2,277 words; middle half 1,864 to 2,684; range 1,074 to 5,011. Paper Trail won overall at about 1,800.
- **Live demo linked:** 47%. **Repo:** 79%. **Video:** 56%.
- **A real person or field test:** 59%. The Week 1 overall winner had none.

## Patterns

1. **One core loop, explained in the first screen.** Paper Trail: one card. Weekend Micro-Adventure: one card. Should I Go Out: one plan.
2. **The opening is one specific, human moment, not a market claim.** Twenty minutes staring at a phone number; a pile of mail on the kitchen table; "kal bhej dunga".
3. **The headline carries a number or a confession.** "28 of 33 alerts", "39 test letters, 9 of them real, and one calm wrong answer", "79% of my old races".
4. **A check that makes the model trustworthy, measured honestly with its losses.** Paper Trail's 5 wrong tips; the parents' mail post's "one calm wrong answer"; the Butterflies post's forecast "that fell apart".
5. **Proof shown as artifacts:** screenshots of dashboards, a WhatsApp reply, logs and costs, not claims.
6. **Open models justified with something concrete:** $0 per use, a local mode that actually runs, data that stays home.
7. **Partners named in one line each, with one fact.** Even the 5-partner winner did it that way.
8. **No process theatre.** No sprints, SRS documents or ADR counts in any winner.

## Why Flare (Week 1) lost, frankly

[The post](https://dev.to/hotragn/flare-snap-where-you-are-and-it-only-lights-if-enough-friends-quietly-say-yes-1jc8)

1. **Too big to see.** The feature table has 20 rows, and 8 partner categories are claimed. The winners showed one loop. The clever core (it only lights if enough friends say yes, and nobody sees who said no) was buried.
2. **Too long, and mostly process.** About 6,000 words, longer than every one of the 34 winners (max 5,011). Sprints, a 159-requirement SRS, 31 ADRs and an interface document are things judges don't score.
3. **Proof that was thin and off-theme.** The one real meetup was 5 minutes, indoors, after midnight, for a challenge called Touch Grass. The rest was simulations and AI testers. Paper Trail won with no users at all, because its measured eval was honest and on-theme.
4. **The verification story was there but hidden.** `enforce()` is exactly what won Paper Trail, but it sat in a details block halfway down.
5. **A long, abstract headline.** It didn't name a job, a number or a moment.
6. **Rewritten after the deadline.** The "Updated after the deadline" note tells judges the submitted version wasn't finished.
7. **Late real-device testing.** The bugs a friend found in an hour show up in the post as a table of fixes, which reads as unfinished.

**What this means for Week 2:** one loop; ~1,500 to 1,800 words; open on one real moment; a headline with a number; a check the model can't fool, measured with its losses; 1 to 3 partners, one line each; done and published early, then left alone.
