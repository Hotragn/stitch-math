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

Node 22.18 or newer (TypeScript runs directly, no build step).

## How it works

- `src/parse/gemma.ts`: Gemma 4 turns each line into JSON stitch operations. It never counts. Every answer must pass a shape check, or the line is marked "not checked".
- `src/engine/stitches.ts`: the stitch table (what each stitch uses and makes).
- `src/engine/check.ts`: carries the live count row to row for every size, checks every repeat fits, and tells a typo from a wrong instruction by looking at the next rows.

## Commits after the deadline

None yet. (The challenge deadline is Oct 19, 2026, 06:59 UTC. Any later commit will be listed here.)

## License

MIT. Sample patterns in `samples/` are written by the author.
