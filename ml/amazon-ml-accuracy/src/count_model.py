"""S1-level count model: P(number of true matches = n | the S1's scored candidates), n = 0..N_MAX.

This is the target distribution ``src/count_decoder.py`` needs, and a strict generalisation of the existing
has-match model (h = 1 - P(n = 0)). It is deliberately built from the *saved pair probabilities only* -
(query_id, s1_id, p2, kept) - because those are already on disk for both the benchmark
(``<output>/models_v4/bench_preds.parquet``) and the test set (``<output>/test_pairs_v4/pairs_<country>.parquet``,
written by ``SAVE_PAIRS=1``). Fitting and applying it therefore costs minutes of CPU and needs no re-blocking,
no re-featurising and no pair-model retraining.

Features are the shape of the S1's candidate score profile, which is what tells the counts apart: an S1 with
four scores near 1.0 and a fifth at 0.5 has a different count distribution from one with two near 1.0 and a
long tail. Per-source counts matter too - train caps S2 at 5 matches per S1 and S3 at 6
(``logs/data_checks.json``), and the two sources are near-independent draws.

    fit_count_model(...)   leave-one-fold-out CV over the benchmark folds -> OOF pmf + fold models
    count_pmf(...)         apply the fold models to a new partition (mean of the per-fold pmfs)
    blend / sharpen        the two knobs the decoder grid tunes next to alpha / temperature / miss

No country feature anywhere: country only partitions the work.
"""
import numpy as np
import pandas as pd

N_MAX = 11                       # largest true-match count per S1 in train
QUERY_ID_MULT = 100_000_000      # src/blocking.py: query_id = source * 10**8 + row
SEED = 42
TOP_P = 6                        # how many of the S1's best candidate scores enter the features
CNT_THRESHOLDS = (0.2, 0.5, 0.8)
LGB_PARAMS = dict(objective="multiclass", num_class=N_MAX + 1, learning_rate=0.05, num_leaves=63,
                  min_data_in_leaf=100, feature_fraction=0.9, lambda_l2=1.0, max_bin=255,
                  metric="multi_logloss", verbose=-1, seed=SEED, bagging_seed=SEED,
                  feature_fraction_seed=SEED, data_random_seed=SEED)
ROUNDS, EARLY_STOP = 600, 40


def feature_names(extra: tuple = ()) -> list:
    """Return the count-model feature names in a fixed order (extra = optional S1 text statistics)."""
    names = [f"c_p{i + 1}" for i in range(TOP_P)]
    names += [f"c_gap{i + 1}{i + 2}" for i in range(TOP_P - 1)]
    names += ["c_n", "c_sum", "c_var", "c_logit_sum"]
    names += [f"c_cnt{int(t * 100):02d}" for t in CNT_THRESHOLDS]
    for s in (2, 3):
        names += [f"c_s{s}_n", f"c_s{s}_sum", f"c_s{s}_max", f"c_s{s}_cnt50"]
    names += ["a_n", "a_sum", "a_max", "a_cnt50", "a_minus_kept"]
    return names + list(extra)


def _top_values(s1: np.ndarray, p: np.ndarray, n_rows: int, k: int, index: pd.Index) -> np.ndarray:
    """Return the k largest p per S1 as an (n_rows x k) array (missing = 0), rows aligned with ``index``."""
    order = np.lexsort((-p, s1))
    s, pp = s1[order], p[order]
    start = np.r_[0, np.flatnonzero(s[1:] != s[:-1]) + 1]
    pos = np.arange(len(s)) - np.repeat(start, np.diff(np.r_[start, len(s)]))
    ok = pos < k
    out = pd.DataFrame(0.0, index=index, columns=range(k), dtype=np.float32)
    flat = pd.DataFrame({"s1": s[ok], "pos": pos[ok], "p": pp[ok]})
    wide = flat.pivot(index="s1", columns="pos", values="p")
    wide = wide.reindex(index=index, columns=range(k))
    out.loc[:, :] = wide.fillna(0.0).to_numpy(dtype=np.float32)
    return out.to_numpy()


def count_features(pairs: pd.DataFrame, s1_ids: np.ndarray, stats: pd.DataFrame = None,
                   p_col: str = "p2", kept_col: str = "kept") -> pd.DataFrame:
    """Return one feature row per S1 in ``s1_ids`` from that S1's scored candidate pairs.

    ``pairs`` needs query_id, s1_id, the calibrated pair probability (``p_col``) and the one-to-one mask
    (``kept_col``). S1 entities with no candidate at all get an all-zero row, which is what the model needs
    to learn that they are singletons. ``stats`` is the optional per-S1-row text table from
    ``src/model_lgb.py::s1_text_stats`` (indexed by S1 row id); its columns are appended as features.
    """
    index = pd.Index(s1_ids, name="s1_id")
    kept = pairs[kept_col].to_numpy().astype(bool)
    s1_all, p_all = pairs["s1_id"].to_numpy(), pairs[p_col].to_numpy(dtype=np.float64)
    s1_k, p_k = s1_all[kept], p_all[kept]
    src_k = (pairs["query_id"].to_numpy()[kept] // QUERY_ID_MULT).astype(np.int64)
    out = pd.DataFrame(index=index)
    top = _top_values(s1_k, p_k, len(index), TOP_P, index)
    for i in range(TOP_P):
        out[f"c_p{i + 1}"] = top[:, i]
    for i in range(TOP_P - 1):
        out[f"c_gap{i + 1}{i + 2}"] = top[:, i] - top[:, i + 1]

    def agg(keys: np.ndarray, values: np.ndarray, how: str) -> np.ndarray:
        """Return a per-S1 aggregate of ``values`` reindexed on ``index`` (missing = 0)."""
        if not len(keys):
            return np.zeros(len(index), dtype=np.float32)
        s = pd.Series(values).groupby(keys).agg(how)
        return s.reindex(index).fillna(0.0).to_numpy(dtype=np.float32)
    logit = np.log(np.clip(p_k, 1e-6, 1 - 1e-6) / (1 - np.clip(p_k, 1e-6, 1 - 1e-6)))
    out["c_n"] = agg(s1_k, np.ones(len(p_k)), "sum")
    out["c_sum"] = agg(s1_k, p_k, "sum")                      # the implied expected match count
    out["c_var"] = agg(s1_k, p_k * (1 - p_k), "sum")           # how uncertain that count is
    out["c_logit_sum"] = agg(s1_k, logit, "sum")
    for t in CNT_THRESHOLDS:
        out[f"c_cnt{int(t * 100):02d}"] = agg(s1_k, (p_k > t).astype(float), "sum")
    for s in (2, 3):
        m = src_k == s
        out[f"c_s{s}_n"] = agg(s1_k[m], np.ones(int(m.sum())), "sum")
        out[f"c_s{s}_sum"] = agg(s1_k[m], p_k[m], "sum")
        out[f"c_s{s}_max"] = agg(s1_k[m], p_k[m], "max")
        out[f"c_s{s}_cnt50"] = agg(s1_k[m], (p_k[m] > 0.5).astype(float), "sum")
    out["a_n"] = agg(s1_all, np.ones(len(p_all)), "sum")
    out["a_sum"] = agg(s1_all, p_all, "sum")
    out["a_max"] = agg(s1_all, p_all, "max")
    out["a_cnt50"] = agg(s1_all, (p_all > 0.5).astype(float), "sum")
    out["a_minus_kept"] = out["a_sum"] - out["c_sum"]          # score mass claimed by other S1 entities
    extra = ()
    if stats is not None:
        extra = tuple(stats.columns)
        out[list(extra)] = stats.iloc[s1_ids].to_numpy()
    return out[feature_names(extra)].astype(np.float32)


# ------------------------------------------------------------------ S1-side statistics
def s1_stats_from_frame(t: pd.DataFrame) -> pd.DataFrame:
    """Return per-S1 statistics computed from the normalised S1 table (one row per S1, same order).

    These are the count model's only features that are **not** derived from the candidate probabilities, and
    the simulation in ../sim/count_ceiling.py says that is exactly where its value has to come from: a count
    distribution re-derived from the same scores the decoder already sees adds nothing. Hubness (how often the
    same name or address repeats), how much text the record carries, and whether the name is non-Latin or a
    domain are all plausible correlates of how many source records an entity has, and none of them is visible
    in p2. No country, region or geography is used.
    """
    name = t["name_core"].astype(str)
    addr = t["addr_clean"].astype(str)
    out = pd.DataFrame(index=t.index)
    out["s1_name_freq"] = np.log1p(name.map(name.value_counts())).to_numpy(np.float32)
    out["s1_addr_freq"] = np.log1p(addr.map(addr.value_counts())).to_numpy(np.float32)
    out["s1_addr_missing"] = (addr == "").to_numpy().astype(np.float32)
    out["s1_name_tokens"] = np.array([len(v.split()) for v in name], dtype=np.float32)
    out["s1_addr_tokens"] = np.array([len(v.split()) for v in t["addr_tokens"].astype(str)], dtype=np.float32)
    out["s1_n_numbers"] = np.array([len(v.split()) for v in t["numbers"].astype(str)], dtype=np.float32)
    for src, dst in (("name_nonlatin", "s1_nonlatin"), ("is_domain", "s1_is_domain"),
                     ("name_core_fallback", "s1_name_fallback")):
        out[dst] = t[src].to_numpy().astype(np.float32) if src in t.columns else np.float32(0.0)
    return out


def count_labels(n_true: np.ndarray, n_max: int = N_MAX) -> np.ndarray:
    """Return the class label per S1 (true match count, clipped at ``n_max``)."""
    return np.clip(np.asarray(n_true), 0, n_max).astype(np.int32)


def fit_count_model(X: np.ndarray, y: np.ndarray, fold: np.ndarray, folds, feats: list, logger=None,
                    params: dict = None, rounds: int = ROUNDS) -> tuple:
    """Leave-one-fold-out CV over ``folds``; return (pmf for every row, fold models, per-fold info).

    Rows in ``folds`` get their out-of-fold pmf; rows outside (the gate fold, or test) get the mean pmf of the
    fold models - the same convention as ``src/model_lgb.py::cv_train``.
    """
    import lightgbm as lgb
    params = dict(LGB_PARAMS if params is None else params)
    pmf = np.zeros((len(y), params["num_class"]), dtype=np.float32)
    models, info = [], []
    for k in folds:
        tr = np.flatnonzero(np.isin(fold, [f for f in folds if f != k]))
        va = np.flatnonzero(fold == k)
        ds = lgb.Dataset(X[tr], label=y[tr], feature_name=feats, free_raw_data=False)
        dv = lgb.Dataset(X[va], label=y[va], feature_name=feats, reference=ds, free_raw_data=False)
        m = lgb.train(params, ds, num_boost_round=rounds, valid_sets=[dv],
                      callbacks=[lgb.early_stopping(EARLY_STOP, verbose=False)])
        pmf[va] = m.predict(X[va], num_iteration=m.best_iteration)
        models.append(m)
        info.append({"fold": int(k), "best_iteration": int(m.best_iteration), "train_rows": int(len(tr)),
                     "valid_multi_logloss": round(float(m.best_score["valid_0"]["multi_logloss"]), 5)})
        if logger is not None:
            logger.info("[count] fold %s: %s", k, info[-1])
    other = np.flatnonzero(~np.isin(fold, folds))
    if len(other):
        pmf[other] = count_pmf(models, X[other])
    return pmf, models, info


def count_pmf(models: list, X: np.ndarray, chunk: int = 500_000) -> np.ndarray:
    """Return the mean count pmf of the fold models for every row of X."""
    out = np.zeros((len(X), models[0].num_model_per_iteration()), dtype=np.float32)
    for s in range(0, len(X), chunk):
        sl = slice(s, s + chunk)
        out[sl] = np.mean([m.predict(X[sl], num_iteration=m.best_iteration) for m in models], axis=0)
    return out


def blend(pmf: np.ndarray, prior: np.ndarray, beta: float) -> np.ndarray:
    """Return (1 - beta) * pmf + beta * prior: how far to trust the count model over the global prior."""
    if beta <= 0.0:
        return pmf
    return (1.0 - beta) * pmf + beta * np.asarray(prior, dtype=np.float64).reshape(1, -1)


def sharpen(pmf: np.ndarray, tau: float, eps: float = 1e-9) -> np.ndarray:
    """Return the pmf raised to 1 / tau and renormalised (tau < 1 sharpens, tau > 1 flattens)."""
    if tau == 1.0:
        return pmf
    q = np.maximum(pmf, eps) ** (1.0 / tau)
    return q / q.sum(1, keepdims=True)


def expected_count(pmf: np.ndarray) -> np.ndarray:
    """Return the mean of each row's count distribution (diagnostics / has-match comparison)."""
    return pmf @ np.arange(pmf.shape[1])


def calibration_report(pmf: np.ndarray, y: np.ndarray, prior: np.ndarray = None) -> dict:
    """Return multi-logloss, top-1 accuracy, the mean predicted vs actual count and the P(n = 0) reliability.

    ``logloss_gain_vs_prior`` is the decisive diagnostic for this whole lever: the count decoder can only help
    if the model knows something about the match count that a fixed global prior does not. It is the nats per
    S1 that the model buys over predicting ``prior`` (the label distribution of these rows when not given) -
    a gain near 0 means the count is not predictable from these features and the decoder grid will, correctly,
    fall back to alpha near 0.
    """
    n = len(y)
    idx = np.arange(n)
    ll = float(-np.log(np.maximum(pmf[idx, y], 1e-12)).mean())
    acc = float((pmf.argmax(1) == y).mean())
    base = np.bincount(y, minlength=pmf.shape[1]) / max(n, 1) if prior is None else np.asarray(prior, float)
    base_ll = float(-np.log(np.maximum(base[y], 1e-12)).mean())
    h = 1.0 - pmf[:, 0]
    bins = np.clip((h * 10).astype(int), 0, 9)
    rel = {f"{b / 10:.1f}-{(b + 1) / 10:.1f}": [int((bins == b).sum()),
                                                round(float(h[bins == b].mean()), 4) if (bins == b).any() else None,
                                                round(float((y[bins == b] > 0).mean()), 4) if (bins == b).any() else None]
           for b in range(10)}
    return {"multi_logloss": round(ll, 5), "prior_multi_logloss": round(base_ll, 5),
            "logloss_gain_vs_prior": round(base_ll - ll, 5), "top1_accuracy": round(acc, 5),
            "prior_top1_accuracy": round(float((y == int(np.argmax(base))).mean()), 5),
            "mean_predicted_count": round(float(expected_count(pmf).mean()), 4),
            "mean_actual_count": round(float(y.mean()), 4),
            "singleton_rate_actual": round(float((y == 0).mean()), 5),
            "mean_p_has_match": round(float(h.mean()), 5),
            "has_match_reliability": rel}
