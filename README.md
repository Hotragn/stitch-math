# Stitch Math

A first-pass tech edit for written knitting and crochet patterns. Gemma reads each row into stitches; plain code counts every row for every size and explains where a count stops adding up.

- Live: https://stitch-math.onrender.com (free tier: the first load after a quiet spell can take up to a minute)
- Built for the DEV Hacktoberfest Open-Source AI Challenge, Week 2: Side Hustle (Oct 18, 2026).

## Run it

```sh
git clone https://github.com/Hotragn/stitch-math && cd stitch-math
echo "GEMINI_API_KEY=your-ai-studio-key" > .env   # Gemma 4 on Google AI Studio
npm start                                       # http://localhost:8790
npm test
```

Node 22.18 or newer (TypeScript runs directly, no build step). Deploy note: Render auto-deploy has no webhook on this repo, so `python3 scripts/deploy.py` triggers a deploy.

## Results

- **Eval** (`evals/report.md`): 8 clean patterns + 24 copies with one seeded error each. Gemma reads + code counts caught 24 of 24, with 0 false alarms on the clean patterns. Gemma 4 acting as the editor alone caught 18, with 17 false alarms. A hand-written regex reader + code caught 6.
- **Real patterns** (`evals/real-patterns.md`): seven free patterns by other designers, every flag checked by hand, including the two layouts it still gets wrong.
- **Tinker** (`ml/`, `evals/report-lora.md`): a Qwen3.5-4B LoRA trained on 2,000 synthetic lines reads 108 of 112 real lines right and lets the checker catch 21 of 24.

## Run it fully local

```sh
ollama pull gemma4:e4b-it-q4_K_M
GEMMA_LOCAL=1 npm start
```

The pattern never leaves your machine. The small model is a weaker reader than Gemma 4 26B (see `ml/report.md`).

## How it works

- `src/parse/gemma.ts`: Gemma 4 turns each line into JSON stitch operations. It never counts. Every answer must pass a shape check, or the line is marked "not checked".
- `src/engine/stitches.ts`: the stitch table (what each stitch uses and makes).
- `src/engine/check.ts`: carries the live count row to row for every size, checks every repeat fits, and tells a typo from a wrong instruction by looking at the next rows.

## Commits after the deadline

None yet. (The challenge deadline is Oct 19, 2026, 06:59 UTC. Any later commit will be listed here.)

## License

MIT. Sample patterns in `samples/` are written by the author.
