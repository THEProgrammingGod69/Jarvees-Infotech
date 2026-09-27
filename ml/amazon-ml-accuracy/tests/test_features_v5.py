"""Tests for src/features_v5.py: every family is checked on the exact failure the error log describes."""
import numpy as np
import pandas as pd
import pytest

from features_v5 import (V5_PAIR_COLS, V5_STAGE2_COLS, add_v5_features, cross_source_p1_features,
                         idf_features, legal_form_features, number_sequence_features, token_df)


# ------------------------------------------------------------------ legal forms
def test_private_vs_public_limited_is_a_conflict():
    """The decoy pattern from logs/model_v4_errors.txt: identical name_core, different legal form."""
    f = legal_form_features(["PRIVATE_LIMITED"], ["PUBLIC_LIMITED"])
    assert f["lf_conflict"][0] == 1.0 and f["lf_compatible"][0] == 0.0 and f["lf_both"][0] == 1.0


def test_generic_limited_is_compatible_with_the_specific_form():
    """'Limited' against 'Pvt Ltd' is the same business written two ways, not a conflict."""
    f = legal_form_features(["LIMITED", "PRIVATE_LIMITED"], ["PRIVATE_LIMITED", "LIMITED"])
    assert list(f["lf_compatible"]) == [1.0, 1.0]
    assert list(f["lf_conflict"]) == [0.0, 0.0]
    assert list(f["lf_equal"]) == [0.0, 0.0]


def test_missing_legal_form_is_not_a_conflict():
    """A side without any legal form carries no evidence either way."""
    f = legal_form_features(["", "LLC", ""], ["LLC", "", ""])
    assert list(f["lf_conflict"]) == [0.0, 0.0, 0.0]
    assert list(f["lf_missing"]) == [1.0, 1.0, 2.0]
    assert np.isnan(f["lf_jaccard"]).all()


def test_multi_code_sets_use_jaccard():
    """Codes are sets ('A|B'), so partial agreement is measurable."""
    f = legal_form_features(["LLC|CO"], ["LLC"])
    assert f["lf_jaccard"][0] == pytest.approx(0.5)
    assert f["lf_compatible"][0] == 1.0


# ------------------------------------------------------------------ number sequences
def test_sibling_sub_numbers_are_separated():
    """12-1-331/C/8 vs 12-1-331/C/1 normalise to number lists that differ only in the tail."""
    f = number_sequence_features(["12 1 331 8"], ["12 1 331 1"])
    assert f["nseq_prefix"][0] == pytest.approx(0.75)
    assert f["nseq_last_conflict"][0] == 1.0 and f["nseq_last_equal"][0] == 0.0
    assert f["nseq_ratio"][0] > 0.8                      # the set-based features see a near-perfect match
    assert f["nseq_jaccard"][0] == pytest.approx(0.6, abs=0.16)


def test_identical_sequences_score_one():
    """The same compound number on both sides."""
    f = number_sequence_features(["5 100"], ["5 100"])
    assert f["nseq_prefix"][0] == 1.0 and f["nseq_pos_agree"][0] == 1.0 and f["nseq_ratio"][0] == 1.0


def test_missing_numbers_are_nan_not_zero():
    """An address with no digits must not look like a conflict."""
    f = number_sequence_features(["", "7"], ["7", ""])
    assert np.isnan(f["nseq_ratio"]).all() and np.isnan(f["nseq_jaccard"]).all()
    assert list(f["nseq_last_conflict"]) == [0.0, 0.0]


def test_reordered_numbers_lose_position_agreement():
    """Sequence order matters: '12 331' and '331 12' share a set but not an order."""
    f = number_sequence_features(["12 331"], ["331 12"])
    assert f["nseq_jaccard"][0] == 1.0
    assert f["nseq_pos_agree"][0] == 0.0 and f["nseq_prefix"][0] == 0.0


# ------------------------------------------------------------------ token rarity
def test_rare_shared_token_beats_a_common_one():
    """Sharing a rare token is stronger evidence than sharing 'enterprises'."""
    df, n = token_df(["acme enterprises", "beta enterprises", "gamma enterprises", "shakuntala mills"])
    f = idf_features(["shakuntala mills", "acme enterprises"], ["shakuntala mills", "beta enterprises"], df, n)
    assert f["idf_shared_max"][0] > f["idf_shared_max"][1]


def test_extra_token_rarity_is_reported_per_side():
    """A rare extra word on the query side is the sibling marker the FP analysis describes."""
    df, n = token_df(["acme exports", "beta exports", "acme"])
    f = idf_features(["acme exports"], ["acme"], df, n)
    assert f["idf_extra_q_max"][0] > 0.0 and f["idf_extra_s1_max"][0] == 0.0
    assert 0.0 < f["idf_cover_q"][0] < 1.0


def test_unseen_tokens_get_the_maximum_rarity():
    """A token absent from the reference records is as rare as it gets, not silently zero."""
    df, n = token_df(["acme enterprises"] * 10)
    f = idf_features(["zzzz"], ["acme"], df, n)
    assert f["idf_q_rarest"][0] == pytest.approx(float(np.log(1.0 + n)))


def test_empty_names_do_not_raise():
    """Fallback names can be empty; the features must stay finite where they are defined."""
    df, n = token_df(["acme", "beta", "gamma"])
    f = idf_features(["", "acme"], ["", ""], df, n)
    assert f["idf_shared_max"][0] == 0.0 and f["idf_q_rarest"][1] > 0.0


# ------------------------------------------------------------------ cross-source agreement on p1
def test_cross_source_features_look_at_the_other_source():
    """S1 0 has two S2 claimants (0.9, 0.4) and one S3 claimant (0.8)."""
    s1 = np.array([0, 0, 0])
    qid = np.array([2 * 10 ** 8 + 1, 2 * 10 ** 8 + 3, 3 * 10 ** 8 + 2])
    p1 = np.array([0.9, 0.4, 0.8])
    f = cross_source_p1_features(s1, qid, p1)
    assert list(f["xs_p1_max"]) == pytest.approx([0.8, 0.8, 0.9])
    assert list(f["xs_n"]) == [1.0, 1.0, 2.0]
    assert f["xs_p1_margin"][0] == pytest.approx(0.1)
    assert f["ss_p1_max"][0] == pytest.approx(0.4)        # its own source, excluding itself
    assert f["ss_p1_max"][2] == 0.0                       # the only S3 claimant


def test_no_partner_in_the_other_source_scores_zero():
    """An S1 claimed from one source only - the pattern a lone decoy produces."""
    f = cross_source_p1_features(np.array([7]), np.array([3 * 10 ** 8 + 5]), np.array([0.95]))
    assert f["xs_p1_max"][0] == 0.0 and f["xs_n"][0] == 0.0
    assert f["xs_p1_margin"][0] == pytest.approx(0.95)


def test_stage2_columns_are_complete():
    """Every advertised stage-2 column is produced."""
    f = cross_source_p1_features(np.array([0, 0]), np.array([2 * 10 ** 8, 3 * 10 ** 8]), np.array([0.5, 0.6]))
    assert set(f) == set(V5_STAGE2_COLS)


# ------------------------------------------------------------------ orchestration
def test_add_v5_features_adds_every_column():
    """The one-line insertion into features_v3.build_partition produces all the advertised columns."""
    df = pd.DataFrame({"query_id": [2 * 10 ** 8, 3 * 10 ** 8], "s1_id": [0, 0]})
    qt = {"name_core": np.array(["acme mills", "acme mills exports"], dtype=object),
          "legal_form": np.array(["PRIVATE_LIMITED", ""], dtype=object),
          "numbers": np.array(["12 1 331 8", "12 1 331 1"], dtype=object),
          "addr_clean": np.array(["12 1 331 8 main road", ""], dtype=object)}
    st = {"name_core": np.array(["acme mills", "acme mills"], dtype=object),
          "legal_form": np.array(["PUBLIC_LIMITED", "PRIVATE_LIMITED"], dtype=object),
          "numbers": np.array(["12 1 331 8", "12 1 331 8"], dtype=object),
          "addr_clean": np.array(["12 1 331 8 main road", "12 1 331 8 main road"], dtype=object)}
    cols = add_v5_features(df, qt, st)
    assert set(cols) == set(V5_PAIR_COLS)
    for c in V5_PAIR_COLS:
        assert c in df.columns and df[c].dtype == np.float32
    assert df["lf_conflict"].iloc[0] == 1.0               # Private vs Public on an identical name
    assert df["nseq_last_conflict"].iloc[1] == 1.0        # the sibling sub-number
    assert df["name_only_pair"].iloc[0] == 0.0
