"""Count model + count-conditioned decoder, wired into the existing pipeline (no re-blocking, no pair retrain).

This is the cheapest of the accuracy levers in ../ANALYSIS.md and the only one that needs nothing but the
probability tables already on disk:

    <output>/models_<tag>/bench_preds.parquet         written by src/model_lgb.py --stage train
    <output>/test_pairs_<model>/pairs_<country>.parquet   written by --stage submit with SAVE_PAIRS=1

Stages (run from code/business_entity_resolution/, same conventions as src/model_lgb.py):

    python -m src.model_lgb_v5 --stage count     # fit the count model on bench folds 1-4, tune the decoder on
                                                 #   OOF, report fold 0 -> <output>/models_<tag>_v5/,
                                                 #   logs/model_<tag>_v5_report.{json,md}
    python -m src.model_lgb_v5 --stage submit    # saved test p2 -> <output>/submit_parts_<tag>_v5/<country>.parquet
    python -m src.model_lgb_v5 --stage verify    # alpha = 0 must reproduce the current decoder exactly

Then assemble and validate with the existing stage:

    set PARTS_DIR=<output>/submit_parts_<tag>_v5
    set FINAL_SUBDIR=final_v5
    python -m src.model_lgb --stage assemble

The fold-0 number this prints is comparable with logs/model_v4_report.md: the count model is fitted on folds
1-4 only, every decoder setting is chosen on the OOF folds, and fold 0 is scored once. Ship only if fold 0
improves - the same gate the repo has used since submission #2.
"""
import argparse
import json
import os
from itertools import product
from pathlib import Path

import numpy as np
import pandas as pd

from .benchmark import BENCH_DIR
from .blocking import CAND_DIR
from .config import LOG_DIR, OUTPUT_DIR, add_path_args, set_seeds
from .count_decoder import count_decode, count_prior, pmf_from_h
from .count_model import (blend, calibration_report, count_features, count_labels, count_pmf, expected_count,
                          feature_names, fit_count_model, s1_stats_from_frame, sharpen)
from .decoder import expected_f05_decode
from .io_utils import raw_parquet_path, read_parquet, write_parquet
from .logging_utils import StageTimer, get_logger
from .model_lgb import CV_MODEL_DIR, TAG, TRAIN_FOLDS
from .scorer_v2 import find_file

S1_STAT_COLS = ("name_core", "addr_clean", "numbers", "addr_tokens", "name_nonlatin", "is_domain",
                "name_core_fallback")
V5_DIR = OUTPUT_DIR / f"models_{TAG}_v5"
PARTS_DIR = OUTPUT_DIR / f"submit_parts_{TAG}_v5"
PAIRS_DIR = OUTPUT_DIR / f"test_pairs_{TAG}"              # written by src/model_lgb.py with SAVE_PAIRS=1
SUBMIT_COUNTRY = os.environ.get("SUBMIT_COUNTRY", "")
USE_TEXT_STATS = os.environ.get("COUNT_TEXT_STATS", "1") == "1"
TEMP_GRID = (0.85, 1.0, 1.2)
MISS_GRID = (0.0, 0.05)          # the repo's own re-tune found this surface flat (logs/experiments.md)
ALPHA_GRID = (0.25, 0.5, 0.75, 1.0)       # 0 = the current decoder exactly, 1 = the count prior in full
BETA_GRID = (0.0, 0.25, 0.5)              # weight on the global prior instead of the count model
TAU_GRID = (1.0,)                         # add 0.8 for a second pass if the best alpha sits at the edge


# ------------------------------------------------------------------ S1-side statistics
def s1_count_stats(split: str) -> pd.DataFrame:
    """Return s1_stats_from_frame for a split's normalised S1 table."""
    import pyarrow.parquet as pq

    from .normalize import norm_path
    cols = [c for c in S1_STAT_COLS]
    t = pq.read_table(norm_path(split, 1), columns=cols).to_pandas()
    return s1_stats_from_frame(t)


# ------------------------------------------------------------------ inputs
def load_bench_preds(logger) -> tuple:
    """Return (saved bench pair predictions, bench S1 table with n_true / country / fold)."""
    path = find_file("bench_preds.parquet", CV_MODEL_DIR, "/kaggle/input")
    pr = pd.read_parquet(path)
    bs1 = pd.read_parquet(find_file("s1.parquet", BENCH_DIR, "/kaggle/input"))
    gt = read_parquet(raw_parquet_path("train", "pairs"), columns=["s1_id"])
    bs1["n_true"] = bs1["entity_id"].map(gt["s1_id"].value_counts()).fillna(0).astype(np.int64)
    logger.info("bench_preds %s: %d pairs, %d S1 (%.2f%% singletons)", path, len(pr), len(bs1),
                100 * float((bs1["n_true"] == 0).mean()))
    for c in ("query_id", "s1_id", "fold", "label", "p2", "kept2"):
        if c not in pr.columns:
            raise KeyError(f"{path} has no column {c!r}; rerun src/model_lgb.py --stage train")
    return pr, bs1


def entity_index(s1_of_pair: np.ndarray, s1_ids: np.ndarray) -> np.ndarray:
    """Return the 0-based entity index of every pair (-1 for pairs whose S1 is outside ``s1_ids``)."""
    pos = pd.Series(np.arange(len(s1_ids)), index=s1_ids)
    return pos.reindex(s1_of_pair).fillna(-1).astype(np.int64).to_numpy()


# ------------------------------------------------------------------ count stage
def run_count(logger) -> dict:
    """Fit the count model on bench folds 1-4, tune the decoder on OOF and score fold 0 once."""
    V5_DIR.mkdir(parents=True, exist_ok=True)
    pr, bs1 = load_bench_preds(logger)
    s1_ids = bs1["s1_id"].to_numpy()
    n_true = bs1["n_true"].to_numpy()
    fold = bs1["fold"].to_numpy()
    y = count_labels(n_true)
    tr = np.isin(fold, TRAIN_FOLDS)
    gate = fold == 0
    prior0 = count_prior()
    stats = s1_count_stats("train") if USE_TEXT_STATS else None

    # Two variants, because ../sim/count_ceiling.py settles which one can possibly help: knowing the exact
    # count is worth +0.013 at this operating point, but a count distribution re-derived from the candidate
    # scores is worth 0.000 - the decoder already extracts that. So the question this stage answers is whether
    # the S1-side statistics carry count information the scores do not.
    variants = {"scores": ((), None)}
    if stats is not None:
        variants["scores+s1"] = (tuple(stats.columns), stats)
    fitted = {}
    for name, (extra, st) in variants.items():
        feats = feature_names(extra)
        with StageTimer(f"v5_count_features_{name}", logger, s1=len(s1_ids), pairs=len(pr)):
            X = count_features(pr, s1_ids, st, p_col="p2", kept_col="kept2").to_numpy(np.float32)
        with StageTimer(f"v5_count_model_{name}", logger, rows=len(y), features=len(feats)):
            pmf_v, models_v, info_v = fit_count_model(X, y, fold, TRAIN_FOLDS, feats, logger)
        oof = calibration_report(pmf_v[tr], y[tr], prior0)
        gain = np.mean([m.feature_importance("gain") for m in models_v], axis=0)
        fitted[name] = {"pmf": pmf_v, "models": models_v, "feats": feats, "folds": info_v, "oof": oof,
                        "fold0": calibration_report(pmf_v[gate], y[gate], prior0),
                        "importance": sorted(zip(feats, gain / max(1e-9, gain.sum()) * 100),
                                             key=lambda t: -t[1])[:20]}
        logger.info("[count/%s] OOF logloss %.5f (global prior %.5f, gain %+.4f nats/S1), top-1 %.4f, "
                    "mean predicted count %.3f vs actual %.3f", name, oof["multi_logloss"],
                    oof["prior_multi_logloss"], oof["logloss_gain_vs_prior"], oof["top1_accuracy"],
                    oof["mean_predicted_count"], oof["mean_actual_count"])
    chosen_variant = min(fitted, key=lambda k: fitted[k]["oof"]["multi_logloss"])
    if len(fitted) > 1:
        extra_nats = (fitted["scores"]["oof"]["multi_logloss"] - fitted["scores+s1"]["oof"]["multi_logloss"])
        logger.info("the S1-side statistics add %+.4f nats per S1 over the score profile alone%s", extra_nats,
                    " -- near zero, so expect the grid to pick alpha close to 0 and no fold-0 gain"
                    if extra_nats < 0.02 else "")
    else:
        extra_nats = None
    pmf, models, feats, info = (fitted[chosen_variant]["pmf"], fitted[chosen_variant]["models"],
                                fitted[chosen_variant]["feats"], fitted[chosen_variant]["folds"])
    for m, k in zip(models, TRAIN_FOLDS):
        m.save_model(str(V5_DIR / f"count_f{k}.txt"))
    rep = {"rows": int(len(y)), "features": feats, "count_folds": info, "count_variant": chosen_variant,
           "s1_stats_extra_nats": None if extra_nats is None else round(float(extra_nats), 5),
           "count_variants": {k: {vk: v[vk] for vk in ("oof", "fold0", "importance")} for k, v in fitted.items()},
           "count_oof": fitted[chosen_variant]["oof"], "count_fold0": fitted[chosen_variant]["fold0"],
           "importance": fitted[chosen_variant]["importance"]}

    # ---------------- decoders on the same pairs the current submission decodes
    ent_all = entity_index(pr["s1_id"].to_numpy(), s1_ids)
    kept = pr["kept2"].to_numpy().astype(bool)
    p2 = pr["p2"].to_numpy(np.float64)
    label = pr["label"].to_numpy()
    if "h" in pr.columns:                    # written by src/model_lgb.py --stage train
        h = pr["h"].to_numpy(np.float64)
    else:                                    # older bench_preds: fall back to the count model's P(n > 0)
        h = np.where(ent_all >= 0, 1.0 - pmf[np.clip(ent_all, 0, None), 0], 0.0)
    h_ent = np.zeros(len(s1_ids))
    seen = ent_all >= 0
    h_ent[ent_all[seen]] = h[seen]
    prior = count_prior()
    art = json.loads(find_file("artifacts.json", CV_MODEL_DIR, "/kaggle/input").read_text(encoding="utf-8"))
    cur = art["tuned"].get("stage2_decoder_hasmatch", {"temperature": 1.0, "miss": 0.05})

    idx_tr, idx_gate = np.flatnonzero(tr), np.flatnonzero(gate)

    def ent_mask(rows: np.ndarray) -> np.ndarray:
        """Return the pair-level entity array restricted to the given entity rows (others: -1).

        Restricting before decoding matters: the decoder is per entity, so an entity that is not being scored
        must not contribute pairs, exactly as src/model_lgb.py's View does.
        """
        keep_ent = np.zeros(len(s1_ids), dtype=bool)
        keep_ent[rows] = True
        return np.where(kept & (ent_all >= 0) & keep_ent[np.clip(ent_all, 0, None)], ent_all, -1)
    out = {}
    ent_tr, ent_gate = ent_mask(idx_tr), ent_mask(idx_gate)
    base_tr = expected_f05_decode(ent_tr, p2, len(s1_ids), h_ent, cur["temperature"], cur["miss"])
    base_gate = expected_f05_decode(ent_gate, p2, len(s1_ids), h_ent, cur["temperature"], cur["miss"])
    out["current"] = {"oof": _subset_metrics(ent_tr, base_tr, label, n_true, idx_tr),
                      "fold0": _subset_metrics(ent_gate, base_gate, label, n_true, idx_gate), "config": cur}
    logger.info("current decoder: OOF %.5f, fold 0 %.5f (logged fold 0 for v4: 0.9719)",
                out["current"]["oof"]["macro_f05"], out["current"]["fold0"]["macro_f05"])

    def target_of(beta: float, tau: float, source: str) -> np.ndarray:
        """Return the per-entity count target for one grid point."""
        if source == "prior_x_h":
            return pmf_from_h(h_ent, prior)
        return sharpen(blend(pmf, prior, beta), tau)
    best = None
    grid = []
    for source in ("count", "prior_x_h"):
        betas, taus = (BETA_GRID, TAU_GRID) if source == "count" else ((0.0,), (1.0,))
        for t, miss, alpha, beta, tau in product(TEMP_GRID, MISS_GRID, ALPHA_GRID, betas, taus):
            tgt = target_of(beta, tau, source)
            mask = count_decode(ent_tr, p2, len(s1_ids), tgt, t, miss, alpha)
            f = _subset_metrics(ent_tr, mask, label, n_true, idx_tr)["macro_f05"]
            cfg = {"source": source, "temperature": t, "miss": miss, "alpha": alpha, "beta": beta, "tau": tau}
            grid.append({**cfg, "oof_f05": round(f, 5)})
            if best is None or f > best[0]:
                best = (f, cfg)
    rep["grid"] = sorted(grid, key=lambda d: -d["oof_f05"])[:25]
    f_oof, cfg = best
    tgt = target_of(cfg["beta"], cfg["tau"], cfg["source"])
    mask_gate = count_decode(ent_gate, p2, len(s1_ids), tgt, cfg["temperature"], cfg["miss"], cfg["alpha"])
    out["count_decoder"] = {"oof": {"macro_f05": round(f_oof, 5)},
                            "fold0": _subset_metrics(ent_gate, mask_gate, label, n_true, idx_gate),
                            "config": cfg}
    delta = out["count_decoder"]["fold0"]["macro_f05"] - out["current"]["fold0"]["macro_f05"]
    out["fold0_delta"] = round(delta, 5)
    rep["decoders"] = out
    logger.info("count decoder: OOF %.5f, fold 0 %.5f (%+.5f vs current) with %s", f_oof,
                out["count_decoder"]["fold0"]["macro_f05"], delta, cfg)
    with open(V5_DIR / "artifacts.json", "w", encoding="utf-8", newline="") as f:
        json.dump({"count_features": feats, "folds": list(TRAIN_FOLDS), "config": cfg,
                   "prior": prior.tolist(), "use_text_stats": chosen_variant == "scores+s1",
                   "count_variant": chosen_variant,
                   "fold0": out["count_decoder"]["fold0"], "fold0_current": out["current"]["fold0"]}, f)
    write_parquet(pd.DataFrame({"s1_id": s1_ids, "fold": fold, "n_true": n_true,
                               **{f"pmf{i}": pmf[:, i] for i in range(pmf.shape[1])}}),
                  V5_DIR / "bench_count_pmf.parquet")
    _write_report(rep, logger)
    return rep


def _subset_metrics(ent: np.ndarray, mask: np.ndarray, label: np.ndarray, n_true: np.ndarray,
                    rows: np.ndarray) -> dict:
    """Return macro F0.5 and diagnostics over ``rows`` only (pairs of other entities are ignored)."""
    keep = np.zeros(len(n_true), dtype=bool)
    keep[rows] = True
    e = np.where((ent >= 0) & keep[np.clip(ent, 0, None)], ent, -1)
    m = mask & (e >= 0)
    k = np.bincount(e[m], minlength=len(n_true)).astype(float)
    tp = np.bincount(e[m], weights=label[m].astype(float), minlength=len(n_true))
    with np.errstate(divide="ignore", invalid="ignore"):
        f = np.where(k == 0, 0.0, 1.25 * tp / (k + 0.25 * n_true))
    f = np.where(n_true == 0, (k == 0).astype(float), f)
    single = (n_true == 0)[rows]
    fr, kr, tpr = f[rows], k[rows], tp[rows]
    with np.errstate(divide="ignore", invalid="ignore"):
        prec = np.where(kr == 0, 1.0, tpr / np.maximum(kr, 1))
        rec = np.where(single, 1.0, tpr / np.maximum(n_true[rows], 1))
    return {"macro_f05": round(float(fr.mean()), 5), "precision": round(float(prec.mean()), 4),
            "recall": round(float(rec.mean()), 4), "pred_per_s1": round(float(kr.mean()), 3),
            "pct_empty": round(100 * float((kr == 0).mean()), 2),
            "f05_singletons": round(float(fr[single].mean()), 4) if single.any() else 1.0,
            "n_entities": int(len(rows))}


def _write_report(rep: dict, logger) -> None:
    """Write logs/model_<tag>_v5_report.{json,md}."""
    with open(LOG_DIR / f"model_{TAG}_v5_report.json", "w", encoding="utf-8", newline="") as f:
        json.dump(rep, f, indent=1, default=float)
        f.write("\n")
    d = rep["decoders"]
    lines = [f"# Count model + count decoder ({TAG}) - fold 0 (gate)", "",
             "| decoder | OOF folds 1-4 | fold 0 | precision | recall | pred/S1 | % empty | singleton F0.5 |",
             "|---|---|---|---|---|---|---|---|"]
    for name in ("current", "count_decoder"):
        m, o = d[name]["fold0"], d[name]["oof"]
        lines.append(f"| {name} | {o['macro_f05']:.5f} | {m['macro_f05']:.5f} | {m['precision']:.4f} | "
                     f"{m['recall']:.4f} | {m['pred_per_s1']:.3f} | {m['pct_empty']:.2f} | "
                     f"{m['f05_singletons']:.4f} |")
    nats = rep.get("s1_stats_extra_nats")
    lines += ["", f"fold-0 delta: **{d['fold0_delta']:+.5f}**; chosen: `{json.dumps(d['count_decoder']['config'])}`",
              "", f"Count information beyond the global prior (OOF, variant `{rep['count_variant']}`): "
              f"**{rep['count_oof']['logloss_gain_vs_prior']:+.4f} nats per S1** "
              f"(logloss {rep['count_oof']['multi_logloss']} vs prior {rep['count_oof']['prior_multi_logloss']}); "
              f"top-1 {rep['count_oof']['top1_accuracy']} vs prior {rep['count_oof']['prior_top1_accuracy']}.",
              "",
              # the decisive number: the decoder already reads the candidate scores, so only count information
              # from outside them can change a prefix (../sim/count_ceiling.py, ../ANALYSIS.md section 3.4)
              "The S1-side statistics add "
              + (f"**{nats:+.4f} nats per S1** over the score profile alone"
                 + (" -- near zero, so this lever is spent: the grid should pick alpha near 0."
                    if nats < 0.02 else " -- there is count information outside p2 to convert.")
                 if nats is not None else "nothing to compare (COUNT_TEXT_STATS=0)"), "",
              "| count-model variant | OOF logloss | OOF top-1 | mean predicted count | mean actual |",
              "|---|---|---|---|---|",
              *[f"| {k} | {v['oof']['multi_logloss']} | {v['oof']['top1_accuracy']} | "
                f"{v['oof']['mean_predicted_count']} | {v['oof']['mean_actual_count']} |"
                for k, v in rep["count_variants"].items()], "",
              f"Count model OOF: {json.dumps(rep['count_oof'])}", "",
              "## Top count-model features (gain %)", "",
              *[f"- {n} {v:.2f}" for n, v in rep["importance"]], "",
              "## Best 25 grid points (OOF)", "",
              *[f"- {json.dumps(g)}" for g in rep["grid"]], ""]
    text = "\n".join(lines) + "\n"
    with open(LOG_DIR / f"model_{TAG}_v5_report.md", "w", encoding="utf-8", newline="") as f:
        f.write(text)
    logger.info("\n%s", text)


# ------------------------------------------------------------------ verify stage
def run_verify(logger) -> dict:
    """Assert that alpha = 0 reproduces the current decoder pair for pair on the benchmark."""
    pr, bs1 = load_bench_preds(logger)
    s1_ids = bs1["s1_id"].to_numpy()
    ent = entity_index(pr["s1_id"].to_numpy(), s1_ids)
    kept = pr["kept2"].to_numpy().astype(bool)
    ent = np.where(kept, ent, -1)
    p2 = pr["p2"].to_numpy(np.float64)
    a = expected_f05_decode(ent, p2, len(s1_ids), None, 1.0, 0.05)
    b = count_decode(ent, p2, len(s1_ids), count_prior()[None, :], 1.0, 0.05, alpha=0.0)
    same = int((a == b).sum())
    logger.info("alpha = 0 agreement: %d / %d pairs (%.6f%%)", same, len(a), 100 * same / len(a))
    if same != len(a):
        raise AssertionError(f"alpha = 0 must reproduce the current decoder; {len(a) - same} pairs differ")
    return {"pairs": int(len(a)), "identical": same}


# ------------------------------------------------------------------ submit stage
def run_submit(logger) -> dict:
    """Decode the saved test pair probabilities with the count model and write per-country submission parts."""
    import lightgbm as lgb
    art = json.loads(find_file("artifacts.json", V5_DIR, "/kaggle/input").read_text(encoding="utf-8"))
    cfg = art["config"]
    models = [lgb.Booster(model_file=str(find_file(f"count_f{k}.txt", V5_DIR, "/kaggle/input")))
              for k in art["folds"]]
    lk = pd.read_parquet(find_file("lookup_s1.parquet", CAND_DIR / "test", "/kaggle/input"))
    tq = pd.read_parquet(find_file("queries.parquet", CAND_DIR / "test", "/kaggle/input"),
                         columns=["query_id", "entity_id", "country"])
    q_ent = pd.Series(tq["entity_id"].to_numpy(), index=tq["query_id"])
    s1_ent = lk["entity_id"].to_numpy()
    stats = s1_count_stats("test") if art["use_text_stats"] else None
    prior = np.asarray(art["prior"])
    pairs_dir = PAIRS_DIR if any(PAIRS_DIR.glob("pairs_*.parquet")) else next(
        (p for p in sorted(Path("/kaggle/input").rglob(PAIRS_DIR.name)) if any(p.glob("pairs_*.parquet"))), PAIRS_DIR)
    files = sorted(pairs_dir.glob("pairs_*.parquet"))
    if SUBMIT_COUNTRY:
        files = [p for p in files if p.stem == f"pairs_{SUBMIT_COUNTRY}"]
    if not files:
        raise FileNotFoundError(f"no saved test pair tables in {pairs_dir} (rerun submit with SAVE_PAIRS=1)")
    logger.info("scoring %s from %s", [p.name for p in files], pairs_dir)
    rep = {"config": cfg, "by_country": {}}
    for path in files:
        df = pd.read_parquet(path, columns=["query_id", "s1_id", "p2", "kept"])
        country = lk["country"].iat[int(df["s1_id"].iat[0])]
        with StageTimer(f"v5_submit_{country}", logger, pairs=len(df)):
            s1_all = np.flatnonzero((lk["country"] == country).to_numpy())
            xdf = count_features(df, s1_all, stats, p_col="p2", kept_col="kept")
            if list(xdf.columns) != art["count_features"]:     # the fitted feature order is the contract
                raise ValueError(f"test count features {list(xdf.columns)} != fitted {art['count_features']}")
            X = xdf.to_numpy(np.float32)
            pmf = sharpen(blend(count_pmf(models, X), prior, cfg["beta"]), cfg["tau"])
            ent = entity_index(df["s1_id"].to_numpy(), s1_all)
            ent = np.where(df["kept"].to_numpy().astype(bool), ent, -1)
            keep = count_decode(ent, df["p2"].to_numpy(np.float64), len(s1_all), pmf, cfg["temperature"],
                                cfg["miss"], cfg["alpha"])
            n_pred = np.bincount(ent[keep & (ent >= 0)], minlength=len(s1_all))
            qc = tq.loc[tq["country"] == country, "query_id"].to_numpy()
            rep["by_country"][country] = {
                "s1": int(len(s1_all)), "pairs": int(len(df)),
                "pred_per_s1": round(float(n_pred.mean()), 3),
                "pct_empty": round(100 * float((n_pred == 0).mean()), 2),
                "pct_s2s3_assigned": round(100 * float(np.isin(qc, df["query_id"].to_numpy()[keep]).mean()), 2),
                "mean_expected_count": round(float(expected_count(pmf).mean()), 3)}
            logger.info("[%s] %s", country, rep["by_country"][country])
            order = df.assign(cheap=df["p2"])                          # ordering inside an S1's match list
            cands = _id_lists(order, np.ones(len(df), dtype=bool), s1_ent, q_ent)
            matches = _id_lists(order, keep, s1_ent, q_ent)
            ents = s1_ent[s1_all]
            part = pd.DataFrame({"entity_id": ents, "country": country,
                                 "candidates": [",".join(cands.get(e, ())) for e in ents],
                                 "matches": [",".join(matches.get(e, ())) for e in ents]})
            write_parquet(part, PARTS_DIR / f"{country}.parquet")
            with open(PARTS_DIR / f"{country}_report.json", "w", encoding="utf-8", newline="") as f:
                json.dump(rep["by_country"][country], f, indent=1, default=float)
                f.write("\n")
    with open(LOG_DIR / f"submit_{TAG}_v5_{SUBMIT_COUNTRY or 'all'}_report.json", "w", encoding="utf-8",
              newline="") as f:
        json.dump(rep, f, indent=1, default=float)
        f.write("\n")
    logger.info("parts in %s: %s", PARTS_DIR, sorted(p.name for p in PARTS_DIR.glob("*.parquet")))
    return rep


def _id_lists(red: pd.DataFrame, mask: np.ndarray, s1_ent: np.ndarray, q_ent: pd.Series) -> dict:
    """Return {S1 entity id: [S2/S3 entity ids]} for the selected pairs (src/finalize.py::id_lists)."""
    from .finalize import id_lists
    return id_lists(red, mask, s1_ent, q_ent)


def main() -> None:
    """Parse flags and run the requested stage."""
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--stage", choices=["count", "submit", "verify"], required=True)
    add_path_args(ap)
    args = ap.parse_args()
    set_seeds()
    logger = get_logger("model_lgb_v5")
    run = {"count": run_count, "submit": run_submit, "verify": run_verify}
    with StageTimer(f"model_lgb_v5_{args.stage}", logger):
        run[args.stage](logger)


if __name__ == "__main__":
    main()
