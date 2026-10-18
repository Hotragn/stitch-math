# Feasibility spikes for the pattern-checker idea (Oct 18, about 03:30 UTC)

All runs: Gemma 4 26B A4B on Google AI Studio (`gemma-4-26b-a4b-it`), `thinkingLevel: minimal`. I wrote every pattern here myself; none is copied.

1. **`parse_test.py`: Gemma as a parser.** Eight crochet and knitting lines in, JSON stitch operations out. All 8 lines parsed correctly: repeats, "around", "to last 2 sts", and the stated counts. 24 s for 1,109 output tokens (dropping the echoed labels will cut this).
2. **`judge_test.py`: Gemma alone as the editor, easy case.** A 13-round amigurumi ball with one seeded error (Rnd 10 says 25; the math gives 24). Gemma found it in 3 of 3 runs, in 2.4 to 3.4 s, though one run's reasoning was muddled.
3. **`judge_test2.py`: Gemma alone as the editor, realistic case.** A 4-size hat crown with 2 seeded errors: Adult S casts on 76 for an 8-stitch repeat, and Rnd 13 Adult L says 68 where the math gives 66.
   - In all 3 runs, it flagged rounds that were fine as wrong, used the wrong repeat sizes ("56 is not divisible by 6" for a 7-stitch repeat), and contradicted itself.
   - It caught the 76 cast-on in 2 of 3 runs, but buried it under false alarms.
   - It never cleanly caught the 68.
   - Each run took 31 to 43 s.

Conclusion: the model should only translate the pattern into stitch operations. Code has to do the counting.
