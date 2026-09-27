"""End-to-end rehearsal of the proposed change under the repo's own training protocol, on simulated data.

``sim/decoder_sim.py`` answers "how much is the count prior worth if the count distribution is known?".
This script answers the question that decides whether to ship it: *with a count model that has to be learned
from the same features the repo can actually compute, and with the has-match baseline also learned rather
than perfect, what does fold 0 gain?*

It reuses the calibrated generator of ``sim/decoder_sim.py`` and then follows the repo's protocol exactly:

    5 folds over S1 entities; folds 1-4 train (leave-one-fold-out CV) and tune, fold 0 is the untouched gate;
    the has-match model and the count model see only features derivable from (query_id, s1_id, p2, kept),
    i.e. src/count_model.py::count_features - the same inputs available from the saved probability tables;
    decoder settings are chosen on the OOF folds 1-4 and then applied unchanged to fold 0.

Baselines: the current decoder with a learned h (what submission #4 runs), and the best threshold rule.

    python -m sim.pipeline_sim [--entities 150000] [--out results/pipeline_sim.json]
"""
import argparse
import json
import sys
from itertools import product
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from count_decoder import count_prior                                            # noqa: E402
from count_model import (QUERY_ID_MULT, blend, calibration_report, count_features, count_labels,  # noqa: E402
                         count_pmf, feature_names, fit_count_model, sharpen)
from sim.decoder_sim import (N_MAX, decode_count, decode_indep, decode_threshold, f05_of_prefix,  # noqa: E402
                             posteriors, simulate, sort_rows)

SEED = 42
N_FOLDS = 5
from sim.decoder_sim import DELTA_DEFAULT, LAM_DEFAULT, RETENTION_DEFAULT  # noqa: E402

DELTA, LAM, RETENTION = DELTA_DEFAULT, LAM_DEFAULT, RETENTION_DEFAULT   # calibrated in sim/decoder_sim.py
TEMP_GRID = (0.85, 1.0, 1.2)
MISS_GRID = (0.0, 0.03, 0.05)
ALPHA_GRID = (0.25, 0.5, 0.75, 1.0)
BETA_GRID = (0.0, 0.25, 0.5)                    # weight on the global prior instead of the count model
TAU_GRID = (1.0, 0.8)                           # count-pmf sharpening
T_GRID = np.round(np.arange(0.30, 0.951, 0.025), 3)
THREADS = int(__import__("os").environ.get("SIM_THREADS", "4"))
# Lighter than src/count_model.py's production settings: this is a rehearsal on <= a few hundred thousand
# simulated rows with 35 features, and a 12-class model at 63 leaves x 600 rounds spends minutes to no effect.
COUNT_PARAMS = dict(objective="multiclass", num_class=N_MAX + 1, learning_rate=0.1, num_leaves=31,
                    min_data_in_leaf=100, feature_fraction=0.9, lambda_l2=1.0, metric="multi_logloss",
                    verbose=-1, seed=SEED, bagging_seed=SEED, feature_fraction_seed=SEED,
                    data_random_seed=SEED, num_threads=THREADS)
COUNT_ROUNDS = 200
HM_PARAMS = dict(objective="binary", learning_rate=0.1, num_leaves=31, min_data_in_leaf=100,
                 feature_fraction=0.9, lambda_l2=1.0, metric="binary_logloss", verbose=-1, seed=SEED,
                 bagging_seed=SEED, feature_fraction_seed=SEED, data_random_seed=SEED, num_threads=THREADS)


def build_pairs(sim: dict, p: np.ndarray, rng: np.random.Generator) -> pd.DataFrame:
    """Return a pair table in the shape of the repo's saved probability files (query_id, s1_id, p2, kept).

    Every simulated candidate is a one-to-one survivor (``kept``), which is what the saved tables hold after
    ``best_per_query``. Sources are drawn 50/50; the real data splits the matches between S2 and S3 with
    per-source caps (S2 <= 5, S3 <= 6), so the per-source features carry *more* signal there than here - this
    keeps the measured gain on the conservative side.
    """
    rows, cols = np.nonzero(sim["mask"])
    src = rng.integers(2, 4, size=len(rows))
    return pd.DataFrame({"query_id": src * QUERY_ID_MULT + np.arange(len(rows)), "s1_id": rows,
                         "p2": p[rows, cols].astype(np.float32), "kept": True,
                         "label": sim["is_true"][rows, cols]})


def fit_hasmatch(X: np.ndarray, y: np.ndarray, fold: np.ndarray, folds, feats: list) -> np.ndarray:
    """Return the out-of-fold P(the S1 has at least one match) from a leave-one-fold-out binary model."""
    import lightgbm as lgb
    out = np.zeros(len(y), dtype=np.float32)
    models = []
    for k in folds:
        tr = np.flatnonzero(np.isin(fold, [f for f in folds if f != k]))
        va = np.flatnonzero(fold == k)
        ds = lgb.Dataset(X[tr], label=y[tr], feature_name=feats, free_raw_data=False)
        dv = lgb.Dataset(X[va], label=y[va], feature_name=feats, reference=ds, free_raw_data=False)
        m = lgb.train(HM_PARAMS, ds, num_boost_round=300, valid_sets=[dv],
                      callbacks=[lgb.early_stopping(40, verbose=False)])
        out[va] = m.predict(X[va], num_iteration=m.best_iteration)
        models.append(m)
    other = np.flatnonzero(~np.isin(fold, folds))
    if len(other):
        out[other] = np.mean([m.predict(X[other], num_iteration=m.best_iteration) for m in models], axis=0)
    return out


def run(n_s1: int, seed: int = SEED) -> dict:
    """Simulate, fit both S1-level models under the repo's CV protocol and score every decoder on fold 0."""
    rng = np.random.default_rng(seed)
    sim = simulate(rng, n_s1, DELTA, LAM, RETENTION)
    post = posteriors(sim, DELTA, LAM, RETENTION)
    pairs = build_pairs(sim, post["p_group"], rng)
    s1_ids = np.arange(n_s1)
    fold = rng.integers(0, N_FOLDS, size=n_s1)                 # the repo deals regions into folds; here S1
    folds = tuple(range(1, N_FOLDS))
    feats = feature_names()
    X = count_features(pairs, s1_ids).to_numpy(np.float32)
    y = count_labels(sim["n_true"])
    pmf_oof, models, info = fit_count_model(X, y, fold, folds, feats, params=COUNT_PARAMS,
                                            rounds=COUNT_ROUNDS)
    h_oof = fit_hasmatch(X, (y > 0).astype(np.float32), fold, folds, feats)

    P, labels, mask = sort_rows(post["p_group"], sim["is_true"], sim["mask"])
    n_cand = mask.sum(1)
    n_true = sim["n_true"]
    tune = np.flatnonzero(np.isin(fold, folds))                # OOF folds 1-4: tuning, as in the repo
    gate = np.flatnonzero(fold == 0)                           # fold 0: the gate, never tuned on
    prior = count_prior(n_max=N_MAX)
    out = {"count_model": {"folds": info, "oof": calibration_report(pmf_oof[tune], y[tune]),
                           "gate": calibration_report(pmf_oof[gate], y[gate])},
           "hasmatch_model": {"oof_mean_h": round(float(h_oof[tune].mean()), 4),
                              "gate_mean_h": round(float(h_oof[gate].mean()), 4)},
           "decoders": {}}

    def pick(cands: list, name: str) -> dict:
        """Tune on the OOF folds, score on the gate fold, and record both."""
        scored = [(f05_of_prefix(dec(tune), labels[tune], n_true[tune])["f05"], cfg, dec)
                  for cfg, dec in cands]
        scored.sort(key=lambda t: -t[0])
        f_oof, cfg, dec = scored[0]
        m = f05_of_prefix(dec(gate), labels[gate], n_true[gate])
        m["oof_f05"] = round(f_oof, 5)
        m["config"] = cfg
        out["decoders"][name] = m
        return m

    thr = [({"t_accept": float(ta), "t_keep": round(float(ta) + dk, 3)},
            (lambda rows, ta=ta, dk=dk: decode_threshold(P[rows], n_cand[rows], ta, round(float(ta) + dk, 3))))
           for ta in T_GRID for dk in (0.0, 0.05, 0.1, 0.15, 0.2)]
    pick(thr, "threshold")
    ind = [({"temperature": t, "miss": ms},
            (lambda rows, t=t, ms=ms: decode_indep(P[rows], n_cand[rows], h_oof[rows], t, ms)))
           for t, ms in product(TEMP_GRID, MISS_GRID)]
    base = pick(ind, "indep_hasmatch")
    cnt = [({"temperature": t, "miss": ms, "alpha": a, "beta": b, "tau": tau},
            (lambda rows, t=t, ms=ms, a=a, b=b, tau=tau: decode_count(
                P[rows], n_cand[rows], sharpen(blend(pmf_oof[rows], prior, b), tau), t, ms, a)))
           for t, ms, a, b, tau in product(TEMP_GRID, MISS_GRID, ALPHA_GRID, BETA_GRID, TAU_GRID)]
    pick(cnt, "count_decoder")
    pri = [({"temperature": t, "miss": ms, "alpha": a, "target": "prior_x_h"},
            (lambda rows, t=t, ms=ms, a=a: decode_count(
                P[rows], n_cand[rows], _pmf_from_h(h_oof[rows], prior), t, ms, a)))
           for t, ms, a in product(TEMP_GRID, MISS_GRID, ALPHA_GRID)]
    pick(pri, "count_decoder_prior_only")
    for name, m in out["decoders"].items():
        m["gate_delta_vs_indep"] = round(m["f05"] - base["f05"], 5)
    out["params"] = {"entities": n_s1, "delta": DELTA, "lam_decoy": LAM, "retention": RETENTION, "seed": seed,
                     "folds": N_FOLDS, "kept_per_s1": round(float(sim["K"].mean()), 3),
                     "matches_per_s1": round(float(n_true.mean()), 3),
                     "singleton_rate": round(float((n_true == 0).mean()), 4),
                     "gate_entities": int(len(gate))}
    return out


def _pmf_from_h(h: np.ndarray, prior: np.ndarray) -> np.ndarray:
    """Return the zero-training target: P(n = 0) = 1 - h, the rest the global prior scaled by h."""
    from count_decoder import pmf_from_h
    return pmf_from_h(h, prior)


def markdown(res: dict) -> str:
    """Render the gate-fold comparison as Markdown."""
    p = res["params"]
    lines = [f"Simulated {p['entities']:,} S1 entities, {p['folds']} folds "
             f"({p['gate_entities']:,} in the gate fold); {p['kept_per_s1']} kept candidates and "
             f"{p['matches_per_s1']} true matches per S1, {100 * p['singleton_rate']:.2f}% singletons.",
             f"Count model OOF: multi-logloss {res['count_model']['oof']['multi_logloss']}, "
             f"top-1 {res['count_model']['oof']['top1_accuracy']}, mean predicted count "
             f"{res['count_model']['oof']['mean_predicted_count']} vs actual "
             f"{res['count_model']['oof']['mean_actual_count']}.", "",
             "| decoder | OOF F0.5 | gate F0.5 | delta | precision | recall | pred/S1 | % empty | "
             "singleton F0.5 | config |", "|---|---|---|---|---|---|---|---|---|---|"]
    for name, m in res["decoders"].items():
        lines.append(f"| {name} | {m['oof_f05']:.5f} | {m['f05']:.5f} | {m['gate_delta_vs_indep']:+.5f} | "
                     f"{m['precision']:.3f} | {m['recall']:.3f} | {m['pred_per_s1']:.2f} | "
                     f"{m['pct_empty']:.2f} | {m['f05_singletons']:.3f} | "
                     f"{json.dumps(m['config'], separators=(',', ':'))} |")
    return "\n".join(lines) + "\n"


def main() -> None:
    """Run the rehearsal and write the results as JSON + Markdown."""
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--entities", type=int, default=150_000)
    ap.add_argument("--seed", type=int, default=SEED)
    ap.add_argument("--out", default=str(Path(__file__).resolve().parents[1] / "results" / "pipeline_sim.json"))
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
