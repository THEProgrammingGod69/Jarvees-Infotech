"""Measure what the count-conditioned decoder is worth, on a simulator calibrated to the fold-0 operating point.

The competition data is not needed (and not available outside the other repo), so the decision layer is
simulated from the statistics the repo already published:

    match counts per S1      student_resource/eda_report.txt (5.58% singletons, mode 3, mean 3.67, max 11)
    kept candidates per S1   logs/test_gap_v4.json p2_hist_kept (India 5.07, US 4.66 per S1)
    operating point          fold 0 v4: F0.5 0.9719, 3.29 predictions/S1, 5.89% empty
    blocking retention       fold-0 error budget: fn_blocking 0.0073 points -> ~0.98 per true pair

Generative model per S1 entity (all parameters fitted to those statistics by ``calibrate``):
    n ~ train count pmf; m ~ Binomial(n, r) of the true matches survive blocking + the one-to-one rule;
    d ~ Poisson(lam) decoys join them; every candidate emits a Gaussian signal x ~ N(delta, 1) if true,
    N(0, 1) if not, so the likelihood ratio is exp(delta (x - delta/2)).

Two pair-model qualities are simulated, both exactly calibrated by construction:
    pair       p = P(true | this pair's own signal)                    - a pair-only model
    group      p = P(true | every signal of this S1)                   - a stage-2-like model, i.e. one that
               already sees the group aggregates the repo feeds into stage 2 (p1_s1_max / sum / cnt05 ...)
The "group" row is the honest estimate: it is the one whose p already contains the count information that is
available from the candidate set, so what the count decoder adds there is only what the independence
assumption throws away.

Decoders compared (each tuned on one half of the simulated entities and scored on the other, the same
discipline as the repo's OOF tuning):
    threshold        best (t_accept, t_keep) - the pre-decoder baseline
    indep_h          src/decoder.py today, with a *perfect* has-match model h = P(n > 0 | signals)
    lam_prior_h      count_decoder with the global train prior scaled by that h - no new model to train
    lam_count_50     count_decoder with a count model halfway between the exact posterior and the prior
    lam_count_exact  count_decoder with the exact count posterior - the ceiling for a perfect count model
    oracle           the best prefix per S1 knowing the labels - the ceiling for any decoder

    python -m sim.decoder_sim [--entities 200000] [--calibrate] [--out results/decoder_sim.json]
"""
import argparse
import json
import sys
from itertools import product
from math import comb
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from count_decoder import count_prior, expected_f05_table                      # noqa: E402
from reference_decoder import expected_f05_table as ref_table                   # noqa: E402

SEED = 42
K_MAX = 12                       # candidates per S1 kept by the decoder (src/decoder.py K_MAX)
N_MAX = 11                       # largest true-match count in train
PRIOR = count_prior(n_max=N_MAX)
TEMP_GRID = (0.7, 0.85, 1.0, 1.2, 1.5)          # src/model_lgb.py TEMP_GRID
MISS_GRID = (0.0, 0.015, 0.03, 0.05)            # src/model_lgb.py MISS_GRID
ALPHA_GRID = (0.25, 0.5, 0.75, 1.0)
T_GRID = np.round(np.arange(0.20, 0.951, 0.025), 3)
# fold-0 v4 targets the simulator is fitted to (logs/model_v4_report.md, logs/test_gap_v4.json)
TARGET = {"f05": 0.9719, "pred_per_s1": 3.29, "pct_empty": 5.89, "kept_per_s1": 4.87}
# the calibration above selects these; sim/pipeline_sim.py and sim/count_ceiling.py reuse them
DELTA_DEFAULT, LAM_DEFAULT, RETENTION_DEFAULT = 3.6, 1.5, 0.98
COMB = np.array([[comb(k, m) if m <= k else 0 for m in range(K_MAX + 1)] for k in range(K_MAX + 1)], dtype=float)
FACT = np.array([float(np.prod(np.arange(1, i + 1))) for i in range(K_MAX + 1)])


# ------------------------------------------------------------------ generative model
def simulate(rng: np.random.Generator, n_s1: int, delta: float, lam: float, r: float) -> dict:
    """Return one simulated population: padded signals, labels, candidate mask and the true match count."""
    n_true = rng.choice(len(PRIOR), size=n_s1, p=PRIOR)
    m = rng.binomial(n_true, r)                                  # true matches that reach the decoder
    d = np.minimum(rng.poisson(lam, n_s1), K_MAX - m)            # decoys that survive the one-to-one rule
    K = m + d
    col = np.arange(K_MAX)[None, :]
    mask = col < K[:, None]
    is_true = col < m[:, None]
    x = rng.normal(0.0, 1.0, (n_s1, K_MAX)) + delta * is_true
    return {"n_true": n_true, "m": m, "K": K, "mask": mask, "is_true": is_true & mask,
            "x": np.where(mask, x, 0.0)}


def likelihood_ratio(x: np.ndarray, mask: np.ndarray, delta: float) -> np.ndarray:
    """Return the per-candidate likelihood ratio f_true(x) / f_decoy(x) (0 for padding)."""
    return np.where(mask, np.exp(delta * (x - delta / 2)), 0.0)


# ------------------------------------------------------------------ exact posteriors
def elementary(lr: np.ndarray) -> np.ndarray:
    """Return the elementary symmetric polynomials e_0..e_K of each row's likelihood ratios (n x (K + 1))."""
    n, K = lr.shape
    e = np.zeros((n, K + 1))
    e[:, 0] = 1.0
    for i in range(K):
        e[:, 1:] += e[:, :-1] * lr[:, i:i + 1]                   # the right-hand side uses the previous e
    return e


def leave_one_out_elementary(lr: np.ndarray) -> np.ndarray:
    """Return e^(-i)_m for every candidate i and degree m (n x K x (K + 1)), by prefix / suffix convolution."""
    n, K = lr.shape
    pre = np.zeros((K + 1, n, K + 1))                            # pre[i] = e of candidates < i
    pre[0, :, 0] = 1.0
    for i in range(K):
        pre[i + 1] = pre[i]
        pre[i + 1, :, 1:] += pre[i, :, :-1] * lr[:, i:i + 1]
    suf = np.zeros((K + 1, n, K + 1))                            # suf[i] = e of candidates > i - 1
    suf[K, :, 0] = 1.0
    for i in range(K - 1, -1, -1):
        suf[i] = suf[i + 1]
        suf[i, :, 1:] += suf[i + 1, :, :-1] * lr[:, i:i + 1]
    out = np.zeros((n, K, K + 1))
    for i in range(K):
        for j in range(K + 1):
            out[:, i, j:] += pre[i, :, :K + 1 - j] * suf[i + 1, :, j:j + 1]
    return out


def joint_count_matrix(K: np.ndarray, lam: float, r: float) -> np.ndarray:
    """Return A[row, n, m] = P(n) P(m of n survive blocking) P(K - m decoys), the count part of the posterior."""
    nn = np.arange(N_MAX + 1)[None, :, None]
    mm = np.arange(K_MAX + 1)[None, None, :]
    binom = np.where(mm <= nn, COMB[np.clip(nn, 0, K_MAX), np.clip(mm, 0, K_MAX)]
                     * r ** mm * (1 - r) ** np.clip(nn - mm, 0, None), 0.0)
    dd = K[:, None, None] - mm                                   # decoys implied by m
    pois = np.where(dd >= 0, np.exp(-lam) * lam ** np.clip(dd, 0, None) / FACT[np.clip(dd, 0, K_MAX)], 0.0)
    return np.where(mm <= K[:, None, None], PRIOR[None, :, None] * binom * pois, 0.0)


def posteriors(sim: dict, delta: float, lam: float, r: float, chunk: int = 20_000) -> dict:
    """Return p_pair, p_group, the exact count posterior pmf_n and h = P(n > 0 | signals)."""
    n_s1 = len(sim["K"])
    p_pair = np.zeros((n_s1, K_MAX))
    p_group = np.zeros((n_s1, K_MAX))
    pmf_n = np.zeros((n_s1, N_MAX + 1))
    pi = sim["m"].sum() / max(sim["K"].sum(), 1)                  # marginal P(a candidate is a true match)
    for s in range(0, n_s1, chunk):
        sl = slice(s, s + chunk)
        lr = likelihood_ratio(sim["x"][sl], sim["mask"][sl], delta)
        p_pair[sl] = np.where(sim["mask"][sl], pi * lr / (pi * lr + (1 - pi)), 0.0)
        e = elementary(lr)
        loo = leave_one_out_elementary(lr)
        A = joint_count_matrix(sim["K"][sl], lam, r)
        kk = np.clip(sim["K"][sl], 0, K_MAX)
        ways = COMB[kk][:, :]                                     # C(K, m) for this row
        w = np.where(ways > 0, e / np.maximum(ways, 1e-300), 0.0)  # P(signals | m) up to a constant
        joint = A * w[:, None, :]
        z = joint.sum((1, 2), keepdims=True)
        joint = joint / np.maximum(z, 1e-300)
        pm = joint.sum(1)                                         # P(m | signals)
        pmf_n[sl] = joint.sum(2)
        # P(y_i = 1 | signals) = sum_m P(m | signals) lr_i e^(-i)_{m-1} / e_m
        ratio = np.zeros((len(pm), K_MAX, K_MAX + 1))
        with np.errstate(divide="ignore", invalid="ignore"):
            ratio[:, :, 1:] = lr[:, :, None] * loo[:, :, :-1] / np.maximum(e[:, None, 1:], 1e-300)
        p_group[sl] = np.einsum("nm,nim->ni", pm, np.nan_to_num(np.clip(ratio, 0.0, 1.0)))
    return {"p_pair": p_pair, "p_group": p_group, "pmf_n": pmf_n, "h": 1.0 - pmf_n[:, 0], "pi": float(pi)}


# ------------------------------------------------------------------ scoring
def sort_rows(p: np.ndarray, is_true: np.ndarray, mask: np.ndarray) -> tuple:
    """Return (p, labels, candidate count) with every row sorted by descending p (padding last)."""
    order = np.argsort(-np.where(mask, p, -1.0), axis=1, kind="stable")
    return (np.take_along_axis(p, order, 1), np.take_along_axis(is_true, order, 1),
            np.take_along_axis(mask, order, 1))


def f05_of_prefix(k: np.ndarray, labels: np.ndarray, n_true: np.ndarray) -> dict:
    """Return the macro F0.5 and diagnostics for a per-S1 prefix length ``k``."""
    tp_cum = np.concatenate([np.zeros((len(labels), 1)), np.cumsum(labels, axis=1)], axis=1)
    tp = np.take_along_axis(tp_cum, k[:, None], 1)[:, 0]
    with np.errstate(divide="ignore", invalid="ignore"):
        f = np.where(k == 0, 0.0, 1.25 * tp / (k + 0.25 * n_true))
    f = np.where(n_true == 0, (k == 0).astype(float), f)
    prec = np.where(k == 0, 1.0, tp / np.maximum(k, 1))
    rec = np.where(n_true == 0, 1.0, tp / np.maximum(n_true, 1))
    return {"f05": float(f.mean()), "precision": float(prec.mean()), "recall": float(rec.mean()),
            "pred_per_s1": float(k.mean()), "pct_empty": 100 * float((k == 0).mean()),
            "f05_singletons": float(f[n_true == 0].mean()), "tp_per_s1": float(tp.mean())}


def cap(k: np.ndarray, n_cand: np.ndarray) -> np.ndarray:
    """Return the prefix length clipped to the row's real candidate count (padding is never predictable)."""
    return np.minimum(k, n_cand)


# ------------------------------------------------------------------ decoders
def decode_threshold(P: np.ndarray, n_cand: np.ndarray, t_accept: float, t_keep: float) -> np.ndarray:
    """Return the prefix length of the threshold rule (accept p >= t_accept, only if the best p >= t_keep)."""
    ok = (P >= t_accept) & (np.arange(P.shape[1])[None, :] < n_cand[:, None])
    k = ok.sum(1)
    return np.where(P[:, 0] >= t_keep, k, 0)


def decode_indep(P: np.ndarray, n_cand: np.ndarray, h: np.ndarray, temperature: float, miss: float) -> np.ndarray:
    """Return the prefix length of the current (independent + h) decoder."""
    from reference_decoder import logit_temperature
    return cap(ref_table(logit_temperature(P, temperature), h, miss).argmax(1), n_cand)


def decode_count(P: np.ndarray, n_cand: np.ndarray, target: np.ndarray, temperature: float, miss: float,
                 alpha: float) -> np.ndarray:
    """Return the prefix length of the count-conditioned decoder."""
    from count_decoder import logit_temperature
    return cap(expected_f05_table(logit_temperature(P, temperature), target, miss, alpha).argmax(1), n_cand)


def decode_oracle(labels: np.ndarray, n_cand: np.ndarray, n_true: np.ndarray) -> np.ndarray:
    """Return the prefix length a decoder with access to the labels would choose (the ceiling)."""
    K = labels.shape[1]
    tp_cum = np.concatenate([np.zeros((len(labels), 1)), np.cumsum(labels, axis=1)], axis=1)
    ks = np.arange(K + 1)[None, :]
    with np.errstate(divide="ignore", invalid="ignore"):
        f = np.where(ks == 0, (n_true == 0).astype(float)[:, None],
                     1.25 * tp_cum / (ks + 0.25 * n_true[:, None]))
    f = np.where(ks > n_cand[:, None], -1.0, f)
    return f.argmax(1)


# ------------------------------------------------------------------ experiment
def evaluate(sim: dict, post: dict, p_kind: str, tune: np.ndarray, hold: np.ndarray) -> dict:
    """Tune every decoder on the ``tune`` rows and score it on the ``hold`` rows for one pair-model quality."""
    P, labels, mask = sort_rows(post[p_kind], sim["is_true"], sim["mask"])
    n_cand = mask.sum(1)
    n_true, h, pmf = sim["n_true"], post["h"], post["pmf_n"]
    prior_row = PRIOR[None, :]
    out = {}

    def best(cands, name):
        """Return the scored hold-out metrics of the configuration with the highest tuning F0.5."""
        scored = []
        for cfg, k_tune in cands:
            scored.append((f05_of_prefix(k_tune, labels[tune], n_true[tune])["f05"], cfg))
        scored.sort(key=lambda t: -t[0])
        cfg = scored[0][1]
        k_hold = cfg["decode"](hold)
        m = f05_of_prefix(k_hold, labels[hold], n_true[hold])
        m["config"] = {k: v for k, v in cfg.items() if k != "decode"}
        m["tuning_f05"] = round(scored[0][0], 5)
        out[name] = m
        return m

    def thr_cands():
        """Yield the (config, tuning prefix) pairs of the threshold grid."""
        for ta in T_GRID:
            for dk in (0.0, 0.05, 0.1, 0.15, 0.2):
                tk = round(float(ta) + dk, 3)
                cfg = {"t_accept": float(ta), "t_keep": tk,
                       "decode": lambda rows, ta=ta, tk=tk: decode_threshold(P[rows], n_cand[rows], ta, tk)}
                yield cfg, cfg["decode"](tune)
    best(list(thr_cands()), "threshold")

    def indep_cands():
        """Yield the (config, tuning prefix) pairs of the current decoder's grid."""
        for t, miss in product(TEMP_GRID, MISS_GRID):
            cfg = {"temperature": t, "miss": miss,
                   "decode": lambda rows, t=t, miss=miss: decode_indep(P[rows], n_cand[rows], h[rows], t, miss)}
            yield cfg, cfg["decode"](tune)
    base = best(list(indep_cands()), "indep_h")

    def count_cands(target_of, tag):
        """Yield the (config, tuning prefix) pairs of the count decoder's grid for one target builder."""
        for t, miss, alpha in product(TEMP_GRID, MISS_GRID, ALPHA_GRID):
            cfg = {"temperature": t, "miss": miss, "alpha": alpha, "target": tag,
                   "decode": lambda rows, t=t, miss=miss, alpha=alpha: decode_count(
                       P[rows], n_cand[rows], target_of(rows), t, miss, alpha)}
            yield cfg, cfg["decode"](tune)

    from count_decoder import pmf_from_h
    best(list(count_cands(lambda rows: pmf_from_h(h[rows]), "prior_x_h")), "lam_prior_h")
    best(list(count_cands(lambda rows: 0.5 * pmf[rows] + 0.5 * prior_row, "half_exact")), "lam_count_50")
    best(list(count_cands(lambda rows: pmf[rows], "exact")), "lam_count_exact")
    out["oracle"] = f05_of_prefix(decode_oracle(labels[hold], n_cand[hold], n_true[hold]),
                                  labels[hold], n_true[hold])
    for name, m in out.items():
        m["delta_vs_indep_h"] = round(m["f05"] - base["f05"], 5)
    return out


def run(n_s1: int, delta: float, lam: float, r: float, seed: int = SEED) -> dict:
    """Simulate a population and evaluate every decoder for both pair-model qualities."""
    rng = np.random.default_rng(seed)
    sim = simulate(rng, n_s1, delta, lam, r)
    post = posteriors(sim, delta, lam, r)
    half = rng.random(n_s1) < 0.5
    tune, hold = np.flatnonzero(half), np.flatnonzero(~half)
    return {"params": {"entities": n_s1, "delta": delta, "lam_decoy": lam, "retention": r, "seed": seed,
                       "candidate_true_rate": round(post["pi"], 4),
                       "kept_per_s1": round(float(sim["K"].mean()), 3),
                       "matches_per_s1": round(float(sim["n_true"].mean()), 3),
                       "singleton_rate": round(float((sim["n_true"] == 0).mean()), 4)},
            "pair_model": evaluate(sim, post, "p_pair", tune, hold),
            "group_model": evaluate(sim, post, "p_group", tune, hold)}


def calibrate(n_s1: int = 40_000, seed: int = SEED) -> dict:
    """Return the (delta, lam) that puts the current decoder at the published fold-0 operating point."""
    rows = []
    for delta, lam in product((3.0, 3.2, 3.4, 3.5, 3.6, 3.8, 4.0), (1.25, 1.5, 1.75)):
        rng = np.random.default_rng(seed)
        sim = simulate(rng, n_s1, delta, lam, 0.98)
        post = posteriors(sim, delta, lam, 0.98)
        P, labels, mask = sort_rows(post["p_group"], sim["is_true"], sim["mask"])
        n_cand = mask.sum(1)
        k = decode_indep(P, n_cand, post["h"], 1.0, 0.05)
        m = f05_of_prefix(k, labels, sim["n_true"])
        cost = (abs(m["f05"] - TARGET["f05"]) / 0.01 + abs(m["pred_per_s1"] - TARGET["pred_per_s1"]) / 0.1
                + abs(m["pct_empty"] - TARGET["pct_empty"]) / 1.0
                + abs(float(sim["K"].mean()) - TARGET["kept_per_s1"]) / 0.2)
        rows.append({"delta": delta, "lam_decoy": lam, "f05": round(m["f05"], 4),
                     "precision": round(m["precision"], 3), "recall": round(m["recall"], 3),
                     "pred_per_s1": round(m["pred_per_s1"], 3), "pct_empty": round(m["pct_empty"], 2),
                     "kept_per_s1": round(float(sim["K"].mean()), 3), "cost": round(cost, 3)})
    rows.sort(key=lambda d: d["cost"])
    return {"target": TARGET, "best": rows[0], "grid": rows}


def markdown(res: dict) -> str:
    """Render one run as a Markdown table."""
    lines = [f"Simulated {res['params']['entities']:,} S1 entities "
             f"(delta {res['params']['delta']}, decoys ~Poisson({res['params']['lam_decoy']}), "
             f"blocking retention {res['params']['retention']}); "
             f"{res['params']['kept_per_s1']} kept candidates and {res['params']['matches_per_s1']} true "
             f"matches per S1.", "",
             "| pair model | decoder | F0.5 | delta | precision | recall | pred/S1 | % empty | config |",
             "|---|---|---|---|---|---|---|---|---|"]
    for kind in ("pair_model", "group_model"):
        for name, m in res[kind].items():
            cfg = json.dumps(m.get("config", {}), separators=(",", ":")) if "config" in m else ""
            lines.append(f"| {kind.replace('_model', '')} | {name} | {m['f05']:.4f} | "
                         f"{m['delta_vs_indep_h']:+.4f} | {m['precision']:.3f} | {m['recall']:.3f} | "
                         f"{m['pred_per_s1']:.2f} | {m['pct_empty']:.2f} | {cfg} |")
    return "\n".join(lines) + "\n"


def main() -> None:
    """Run the calibration and / or the comparison and write the results as JSON + Markdown."""
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--entities", type=int, default=200_000)
    ap.add_argument("--delta", type=float, default=None, help="signal separation (default: calibrated)")
    ap.add_argument("--lam-decoy", type=float, default=None, help="mean decoys per S1 (default: calibrated)")
    ap.add_argument("--retention", type=float, default=0.98)
    ap.add_argument("--calibrate", action="store_true", help="fit delta / lam to the fold-0 operating point")
    ap.add_argument("--out", default=str(Path(__file__).resolve().parents[1] / "results" / "decoder_sim.json"))
    args = ap.parse_args()
    out = {}
    delta, lam = args.delta, args.lam_decoy
    if args.calibrate or delta is None or lam is None:
        cal = calibrate()
        out["calibration"] = cal
        delta = cal["best"]["delta"] if delta is None else delta
        lam = cal["best"]["lam_decoy"] if lam is None else lam
        print(json.dumps(cal["best"], indent=1))
    res = run(args.entities, delta, lam, args.retention)
    out["run"] = res
    print(markdown(res))
    path = Path(args.out)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="") as f:
        json.dump(out, f, indent=1, default=float)
        f.write("\n")
    with open(path.with_suffix(".md"), "w", encoding="utf-8", newline="") as f:
        f.write(markdown(res))
    print(f"wrote {path} and {path.with_suffix('.md')}")


if __name__ == "__main__":
    main()
