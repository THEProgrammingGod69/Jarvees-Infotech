"""How much is knowing an S1's match count worth, and where does that value come from?

``sim/decoder_sim.py`` compares decoders that all derive their count information from the candidate scores.
This script asks the prior question, at the same calibrated operating point: **what is the ceiling?** It
decodes with information no model has, so the answers bound every count-model effort:

    indep_h        the current decoder, with its has-match probability             (the baseline)
    oracle_h       the same decoder, told exactly whether the S1 is a singleton    (a perfect has-match model)
    oracle_count   the count decoder, told the exact number of true matches        (a perfect count model)
    oracle_prefix  the best prefix per S1 knowing every label                      (no decoder can beat this)

The gap between indep_h and oracle_count is the whole budget for "predict the count better". The gap between
oracle_h and oracle_count is the part that needs the *count*, not just "has a match". The gap between
oracle_count and oracle_prefix is what no amount of count modelling can reach - it lives in the pair
probabilities, so it is a feature / data / capacity problem instead.

    python -m sim.count_ceiling [--entities 100000] [--out results/count_ceiling.json]
"""
import argparse
import json
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from sim.decoder_sim import (DELTA_DEFAULT, LAM_DEFAULT, MISS_GRID, RETENTION_DEFAULT, TEMP_GRID,  # noqa: E402
                             decode_count, decode_indep, decode_oracle, f05_of_prefix, posteriors,
                             simulate, sort_rows)

ALPHA_GRID = (0.25, 0.5, 0.75, 1.0)
SEED = 42


def best_over(grid, score) -> tuple:
    """Return the (metrics, config) of the grid point with the highest F0.5."""
    out = None
    for cfg in grid:
        m = score(cfg)
        if out is None or m["f05"] > out[0]["f05"]:
            out = (m, cfg)
    return out


def run(n_s1: int, seed: int = SEED) -> dict:
    """Return the ceiling table for both pair-model qualities."""
    rng = np.random.default_rng(seed)
    sim = simulate(rng, n_s1, DELTA_DEFAULT, LAM_DEFAULT, RETENTION_DEFAULT)
    post = posteriors(sim, DELTA_DEFAULT, LAM_DEFAULT, RETENTION_DEFAULT)
    n_true = sim["n_true"]
    res = {"params": {"entities": n_s1, "delta": DELTA_DEFAULT, "lam_decoy": LAM_DEFAULT,
                      "retention": RETENTION_DEFAULT, "seed": seed,
                      "matches_per_s1": round(float(n_true.mean()), 3),
                      "singleton_rate": round(float((n_true == 0).mean()), 4)}}
    exact = np.zeros((n_s1, 12))
    exact[np.arange(n_s1), np.clip(n_true, 0, 11)] = 1.0
    for kind in ("p_pair", "p_group"):
        P, labels, mask = sort_rows(post[kind], sim["is_true"], sim["mask"])
        n_cand = mask.sum(1)
        rows = {}
        m, cfg = best_over([{"temperature": t, "miss": ms} for t in TEMP_GRID for ms in MISS_GRID],
                           lambda c: f05_of_prefix(decode_indep(P, n_cand, post["h"], c["temperature"],
                                                               c["miss"]), labels, n_true))
        rows["indep_h"] = {**m, "config": cfg}
        h_true = (n_true > 0).astype(float)
        m, cfg = best_over([{"temperature": t, "miss": ms} for t in TEMP_GRID for ms in MISS_GRID],
                           lambda c: f05_of_prefix(decode_indep(P, n_cand, h_true, c["temperature"],
                                                               c["miss"]), labels, n_true))
        rows["oracle_h"] = {**m, "config": cfg}
        m, cfg = best_over([{"temperature": t, "miss": ms, "alpha": a} for t in TEMP_GRID for ms in MISS_GRID
                            for a in ALPHA_GRID],
                           lambda c: f05_of_prefix(decode_count(P, n_cand, exact, c["temperature"], c["miss"],
                                                                c["alpha"]), labels, n_true))
        rows["oracle_count"] = {**m, "config": cfg}
        rows["oracle_prefix"] = f05_of_prefix(decode_oracle(labels, n_cand, n_true), labels, n_true)
        base = rows["indep_h"]["f05"]
        for r in rows.values():
            r["delta_vs_indep_h"] = round(r["f05"] - base, 5)
        res[kind] = rows
    return res


def markdown(res: dict) -> str:
    """Render the ceiling table as Markdown."""
    p = res["params"]
    lines = [f"Simulated {p['entities']:,} S1 entities at the calibrated fold-0 operating point "
             f"(delta {p['delta']}, decoys ~Poisson({p['lam_decoy']}), retention {p['retention']}); "
             f"{p['matches_per_s1']} matches per S1, {100 * p['singleton_rate']:.2f}% singletons.", "",
             "| pair model | information given to the decoder | F0.5 | delta | precision | recall | pred/S1 | % empty |",
             "|---|---|---|---|---|---|---|---|"]
    label = {"indep_h": "its own has-match model (today)", "oracle_h": "the true singleton flag",
             "oracle_count": "the exact match count", "oracle_prefix": "every label (no decoder can beat it)"}
    for kind in ("p_pair", "p_group"):
        for name, m in res[kind].items():
            lines.append(f"| {kind.replace('p_', '')} | {label[name]} | {m['f05']:.5f} | "
                         f"{m['delta_vs_indep_h']:+.5f} | {m['precision']:.3f} | {m['recall']:.3f} | "
                         f"{m['pred_per_s1']:.2f} | {m['pct_empty']:.2f} |")
    return "\n".join(lines) + "\n"


def main() -> None:
    """Run the ceiling measurement and write JSON + Markdown."""
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--entities", type=int, default=100_000)
    ap.add_argument("--seed", type=int, default=SEED)
    ap.add_argument("--out", default=str(Path(__file__).resolve().parents[1] / "results" / "count_ceiling.json"))
    args = ap.parse_args()
    res = run(args.entities, args.seed)
    print(markdown(res))
    path = Path(args.out)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="") as f:
        json.dump(res, f, indent=1, default=float)
        f.write("\n")
    with open(path.with_suffix(".md"), "w", encoding="utf-8", newline="") as f:
        f.write(markdown(res))
    print(f"wrote {path} and {path.with_suffix('.md')}")


if __name__ == "__main__":
    main()
