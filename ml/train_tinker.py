"""Teach Qwen3.5-4B to read pattern lines, with a LoRA trained on Tinker.

Run: TINKER_API_KEY=... .venv/bin/python ml/train_tinker.py
Writes ml/data/run.json (losses, sampler path) and ml/data/preds_*.jsonl.
"""
import json, os, random, time
import tinker
from tinker import types

BASE = "Qwen/Qwen3.5-4B"
RANK, LR, BATCH, EPOCHS = 32, 3e-4, 32, 2
SYSTEM = ("You turn one knitting or crochet pattern line into JSON. Never count or fix anything; copy numbers as written. "
          "Kinds: row (o = stitch items, x = rows covered, s = stated count), setup (c = starting count), repeat (f, to, t), note, skip.")


def prompt_msgs(e):
    sizes = ", ".join(e["sizes"]) if e["sizes"] else "one size"
    return [{"role": "system", "content": SYSTEM}, {"role": "user", "content": f"Craft: {e['craft']}. Sizes: {sizes}.\nLine: {e['line']}"}]


def main():
    sc = tinker.ServiceClient()
    tc = sc.create_lora_training_client(base_model=BASE, rank=RANK)
    tok = tc.get_tokenizer()

    def encode_prompt(e):
        try:
            x = tok.apply_chat_template(prompt_msgs(e), add_generation_prompt=True, tokenize=True, enable_thinking=False)
        except TypeError:
            x = tok.apply_chat_template(prompt_msgs(e), add_generation_prompt=True, tokenize=True)
        return list(x["input_ids"]) if not isinstance(x, list) else x

    def datum(e):
        p = list(encode_prompt(e))
        c = tok.encode(json.dumps(e["target"], separators=(",", ":")), add_special_tokens=False) + [tok.eos_token_id]
        toks = p + c
        w = [0.0] * len(p) + [1.0] * len(c)
        return types.Datum(model_input=types.ModelInput.from_ints(toks[:-1]),
                           loss_fn_inputs={"target_tokens": toks[1:], "weights": w[1:]})

    train = [json.loads(l) for l in open("ml/data/train.jsonl")]
    rnd = random.Random(1)
    log = {"base": BASE, "rank": RANK, "lr": LR, "batch": BATCH, "epochs": EPOCHS, "n_train": len(train), "losses": [], "tokens": 0}
    t0 = time.time()
    step = 0
    for ep in range(EPOCHS):
        rnd.shuffle(train)
        for b in range(0, len(train), BATCH):
            batch = [datum(e) for e in train[b:b + BATCH]]
            log["tokens"] += sum(d.model_input.length for d in batch)
            fb = tc.forward_backward(batch, "cross_entropy")
            op = tc.optim_step(types.AdamParams(learning_rate=LR * max(0.1, 1 - step / (EPOCHS * len(train) / BATCH))))
            out = fb.result(); op.result()
            # mean loss per completion token
            tot = wsum = 0.0
            for d, o in zip(batch, out.loss_fn_outputs):
                lp = o["logprobs"].tolist() if hasattr(o["logprobs"], "tolist") else o["logprobs"].data
                ws = d.loss_fn_inputs["weights"].tolist() if hasattr(d.loss_fn_inputs["weights"], "tolist") else d.loss_fn_inputs["weights"].data
                tot += -sum(a * b for a, b in zip(lp, ws)); wsum += sum(ws)
            loss = tot / max(wsum, 1)
            log["losses"].append(round(loss, 4))
            step += 1
            if step % 10 == 1:
                print(f"step {step} epoch {ep} loss {loss:.4f} ({time.time() - t0:.0f}s)", flush=True)
    sampler = tc.save_weights_and_get_sampling_client(name="stitch-reader-lora")
    log["train_seconds"] = round(time.time() - t0)
    json.dump(log, open("ml/data/run.json", "w"), indent=1)
    print("trained", log["train_seconds"], "s, tokens", log["tokens"], flush=True)

    # Predictions: the LoRA, and the base model with the same short prompt
    base = sc.create_sampling_client(base_model=BASE)
    params = types.SamplingParams(max_tokens=300, temperature=0.0, stop=[tok.eos_token])
    sets = {"heldout_synth": [json.loads(l) for l in open("ml/data/heldout_synth.jsonl")],
            "real": [json.loads(l) for l in open("ml/data/real_lines.jsonl")] if os.path.exists("ml/data/real_lines.jsonl") else []}
    for name, rows in sets.items():
        for who, cli in [("lora", sampler), ("base", base)]:
            futs = [cli.sample(types.ModelInput.from_ints(list(encode_prompt(e))), 1, params) for e in rows]
            with open(f"ml/data/preds_{name}_{who}.jsonl", "w") as f:
                for e, fu in zip(rows, futs):
                    r = fu.result()
                    txt = tok.decode(r.sequences[0].tokens, skip_special_tokens=True)
                    f.write(json.dumps({**e, "pred": txt}) + "\n")
            print("wrote", name, who, len(rows), flush=True)


if __name__ == "__main__":
    main()
