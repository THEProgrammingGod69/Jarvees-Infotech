"""Tests for src/count_model.py: the features must be exactly what the saved probability tables can give,
and the fitted model must recover a count that is present in the score profile."""
import numpy as np
import pandas as pd
import pytest

from count_decoder import count_prior
from count_model import (N_MAX, QUERY_ID_MULT, blend, calibration_report, count_features, count_labels,
                         count_pmf, expected_count, feature_names, fit_count_model, sharpen)


def pairs_frame(rows) -> pd.DataFrame:
    """Return a pair table in the saved-probability-file shape from (s1_id, source, p2, kept) tuples."""
    return pd.DataFrame({"query_id": [s * QUERY_ID_MULT + i for i, (_, s, _, _) in enumerate(rows)],
                         "s1_id": [r[0] for r in rows], "p2": [r[2] for r in rows],
                         "kept": [r[3] for r in rows]})


# ------------------------------------------------------------------ features
def test_feature_order_is_stable_and_complete():
    """The column order is part of the saved artefact, so it must come from one place."""
    pairs = pairs_frame([(0, 2, 0.9, True)])
    X = count_features(pairs, np.array([0, 1]))
    assert list(X.columns) == feature_names()
    assert X.dtypes.unique().tolist() == [np.dtype(np.float32)]


def test_s1_without_candidates_is_all_zero():
    """Entities with no pair at all must still get a row - that is how the model learns singletons."""
    pairs = pairs_frame([(0, 2, 0.9, True)])
    X = count_features(pairs, np.array([0, 1, 2]))
    assert len(X) == 3
    assert (X.iloc[1] == 0).all() and (X.iloc[2] == 0).all()


def test_top_scores_are_sorted_and_padded():
    """c_p1..c_p6 are the S1's best kept scores, descending, zero-padded."""
    pairs = pairs_frame([(0, 2, 0.4, True), (0, 3, 0.95, True), (0, 2, 0.7, True)])
    X = count_features(pairs, np.array([0]))
    assert list(X.loc[0, ["c_p1", "c_p2", "c_p3", "c_p4"]]) == pytest.approx([0.95, 0.7, 0.4, 0.0])
    assert X.loc[0, "c_gap12"] == pytest.approx(0.25)
    assert X.loc[0, "c_n"] == 3 and X.loc[0, "c_sum"] == pytest.approx(2.05)


def test_unkept_pairs_only_feed_the_all_candidate_features():
    """Pairs another S1 won in the one-to-one step still say something (a_*), but are not this S1's matches."""
    pairs = pairs_frame([(0, 2, 0.9, True), (0, 3, 0.8, False)])
    X = count_features(pairs, np.array([0]))
    assert X.loc[0, "c_n"] == 1 and X.loc[0, "c_sum"] == pytest.approx(0.9)
    assert X.loc[0, "a_n"] == 2 and X.loc[0, "a_sum"] == pytest.approx(1.7)
    assert X.loc[0, "a_minus_kept"] == pytest.approx(0.8)


def test_per_source_aggregates_split_s2_and_s3():
    """Train caps S2 at 5 matches and S3 at 6, so the sources are separate evidence."""
    pairs = pairs_frame([(0, 2, 0.9, True), (0, 2, 0.6, True), (0, 3, 0.7, True)])
    X = count_features(pairs, np.array([0]))
    assert X.loc[0, "c_s2_n"] == 2 and X.loc[0, "c_s3_n"] == 1
    assert X.loc[0, "c_s2_max"] == pytest.approx(0.9) and X.loc[0, "c_s3_sum"] == pytest.approx(0.7)
    assert X.loc[0, "c_s2_cnt50"] == 2 and X.loc[0, "c_s3_cnt50"] == 1


def test_text_stats_are_appended_in_order():
    """The optional S1 text statistics become extra features, indexed by S1 row."""
    pairs = pairs_frame([(1, 2, 0.9, True)])
    stats = pd.DataFrame({"s1_name_freq": [0.0, 2.5], "s1_addr_missing": [1.0, 0.0]})
    X = count_features(pairs, np.array([1]), stats)
    assert list(X.columns)[-2:] == ["s1_name_freq", "s1_addr_missing"]
    assert X.loc[1, "s1_name_freq"] == pytest.approx(2.5)


# ------------------------------------------------------------------ labels and pmf helpers
def test_labels_are_clipped_at_the_train_maximum():
    """Train never has more than 11 matches for one S1."""
    assert list(count_labels(np.array([0, 3, 11, 25]))) == [0, 3, 11, N_MAX]


def test_blend_and_sharpen_keep_a_distribution():
    """Both knobs must return rows that still sum to 1."""
    pmf = np.array([[0.1, 0.2, 0.3, 0.4], [0.7, 0.1, 0.1, 0.1]])
    prior = np.array([0.25, 0.25, 0.25, 0.25])
    b = blend(pmf, prior, 0.5)
    assert np.allclose(b.sum(1), 1.0) and np.allclose(b[0], [0.175, 0.225, 0.275, 0.325])
    s = sharpen(pmf, 0.5)
    assert np.allclose(s.sum(1), 1.0)
    assert s[0].max() > pmf[0].max()                      # tau < 1 sharpens
    assert np.allclose(sharpen(pmf, 1.0), pmf)
    assert np.allclose(blend(pmf, prior, 0.0), pmf)


def test_expected_count_is_the_mean():
    """expected_count is used for diagnostics against the 3.46 matches/S1 of train."""
    pmf = np.array([[0.0, 0.5, 0.5, 0.0]])
    assert expected_count(pmf)[0] == pytest.approx(1.5)


def test_calibration_report_shape():
    """The report is what the run log prints; the keys are part of the contract."""
    rng = np.random.default_rng(0)
    pmf = rng.random((100, N_MAX + 1))
    pmf /= pmf.sum(1, keepdims=True)
    rep = calibration_report(pmf, rng.integers(0, N_MAX + 1, 100))
    for k in ("multi_logloss", "prior_multi_logloss", "logloss_gain_vs_prior", "top1_accuracy",
              "prior_top1_accuracy", "mean_predicted_count", "mean_actual_count", "singleton_rate_actual",
              "mean_p_has_match", "has_match_reliability"):
        assert k in rep


def test_logloss_gain_is_zero_for_a_prior_only_model():
    """The decisive diagnostic: a model that only reproduces the prior must show no information gain."""
    from count_model import calibration_report as rep_fn
    rng = np.random.default_rng(3)
    y = rng.choice(len(count_prior()), size=5000, p=count_prior())
    base = np.bincount(y, minlength=N_MAX + 1) / len(y)
    pmf = np.repeat(base[None, :], len(y), axis=0)
    r = rep_fn(pmf, y)
    assert r["logloss_gain_vs_prior"] == pytest.approx(0.0, abs=1e-6)
    # a model that knows the answer gains a lot
    sharp = np.full((len(y), N_MAX + 1), 0.001)
    sharp[np.arange(len(y)), y] = 1.0
    sharp /= sharp.sum(1, keepdims=True)
    assert rep_fn(sharp, y)["logloss_gain_vs_prior"] > 1.0


# ------------------------------------------------------------------ fitting
def test_fit_recovers_a_count_hidden_in_the_score_profile():
    """A model fitted on folds 1-4 must predict the count out of fold, and the pmf must be normalised.

    The synthetic S1 entities have exactly ``n`` kept candidates at high p plus one weak decoy, so the count
    is recoverable from the score profile - the property the real count model relies on.
    """
    rng = np.random.default_rng(42)
    n_s1 = 1500
    n_true = rng.choice(len(count_prior()), size=n_s1, p=count_prior())
    rows = []
    for s in range(n_s1):
        for _ in range(int(n_true[s])):
            rows.append((s, int(rng.integers(2, 4)), float(rng.uniform(0.85, 1.0)), True))
        if rng.random() < 0.6:
            rows.append((s, int(rng.integers(2, 4)), float(rng.uniform(0.0, 0.2)), True))
    pairs = pairs_frame(rows)
    s1_ids = np.arange(n_s1)
    feats = feature_names()
    X = count_features(pairs, s1_ids).to_numpy(np.float32)
    y = count_labels(n_true)
    fold = rng.integers(0, 5, n_s1)
    params = dict(objective="multiclass", num_class=N_MAX + 1, learning_rate=0.2, num_leaves=15,
                  min_data_in_leaf=20, verbose=-1, metric="multi_logloss", seed=42, num_threads=2)
    pmf, models, info = fit_count_model(X, y, fold, (1, 2, 3, 4), feats, params=params, rounds=60)
    oof = np.isin(fold, (1, 2, 3, 4))
    assert np.allclose(pmf.sum(1), 1.0, atol=1e-5)
    assert len(models) == 4 and len(info) == 4
    assert (pmf[oof].argmax(1) == y[oof]).mean() > 0.9    # the count is in the profile, out of fold
    gate = ~oof
    assert (pmf[gate].argmax(1) == y[gate]).mean() > 0.9  # fold 0 uses the mean of the fold models
    again = count_pmf(models, X[gate])
    assert np.allclose(again, pmf[gate], atol=1e-6)


# ------------------------------------------------------------------ S1-side statistics
def test_s1_stats_capture_hubness_and_text_size():
    """The only count-model features that are not derived from p2: they must come out of the normalised table.

    sim/count_ceiling.py shows a count distribution re-derived from the candidate scores adds nothing, so
    these are the features the lever depends on.
    """
    from count_model import s1_stats_from_frame
    t = pd.DataFrame({
        "name_core": ["acme mills", "acme mills", "beta", ""],
        "addr_clean": ["12 main road", "12 main road", "", "7 side lane"],
        "numbers": ["12", "12", "", "7"],
        "addr_tokens": ["main road", "main road", "", "side lane"],
        "name_nonlatin": [False, False, True, False],
        "is_domain": [False, False, False, True],
        "name_core_fallback": [False, False, False, True]})
    s = s1_stats_from_frame(t)
    assert s["s1_name_freq"].iloc[0] == pytest.approx(float(np.log1p(2)))
    assert s["s1_name_freq"].iloc[2] == pytest.approx(float(np.log1p(1)))
    assert s["s1_addr_freq"].iloc[0] == pytest.approx(float(np.log1p(2)))
    assert list(s["s1_addr_missing"]) == [0.0, 0.0, 1.0, 0.0]
    assert list(s["s1_name_tokens"]) == [2.0, 2.0, 1.0, 0.0]
    assert list(s["s1_addr_tokens"]) == [2.0, 2.0, 0.0, 2.0]
    assert list(s["s1_n_numbers"]) == [1.0, 1.0, 0.0, 1.0]
    assert list(s["s1_nonlatin"]) == [0.0, 0.0, 1.0, 0.0]
    assert s.dtypes.unique().tolist() == [np.dtype(np.float32)]


def test_s1_stats_tolerate_missing_flag_columns():
    """The flags are optional so the stats still build from a reduced table."""
    from count_model import s1_stats_from_frame
    t = pd.DataFrame({"name_core": ["a"], "addr_clean": ["b"], "numbers": [""], "addr_tokens": ["b"]})
    s = s1_stats_from_frame(t)
    assert s["s1_nonlatin"].iloc[0] == 0.0 and s["s1_is_domain"].iloc[0] == 0.0
