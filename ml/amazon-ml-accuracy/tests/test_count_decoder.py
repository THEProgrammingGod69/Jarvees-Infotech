"""Tests for src/count_decoder.py.

The first three tests are the safety net for dropping this in next to src/decoder.py: the new table must
reproduce the current one exactly when no count prior is supplied, when the supplied prior is the decoder's
own implied count distribution, and when alpha = 0. ``reference_expected_f05_table`` is the verbatim copy of
``expected_f05_table`` from the competition repo's src/decoder.py (commit ff25b6f) kept in
src/reference_decoder.py, so the comparison is self-contained and any future divergence shows up as a failing
test rather than a silent behaviour change.
"""
import numpy as np
import pytest

from count_decoder import count_decode, count_prior, count_weights, expected_f05_table, pmf_from_h


# ------------------------------------------------------------------ reference (src/decoder.py, unchanged)
from reference_decoder import expected_f05_table as reference_expected_f05_table  # noqa: E402


def implied_count_pmf(P, miss=0.0):
    """Return the total-count pmf the independent decoder itself implies (the convolution it already builds)."""
    from count_decoder import _backward
    return _backward(P, miss)[0]


@pytest.fixture
def probs():
    """A batch of sorted-descending probability rows covering the interesting shapes."""
    rng = np.random.default_rng(42)
    P = np.sort(rng.random((200, 8)), axis=1)[:, ::-1].copy()
    P[0] = 0.0                                    # an S1 with no kept candidate
    P[1] = [0.99, 0.99, 0.98, 0.55, 0.10, 0.02, 0.0, 0.0]
    P[2] = [0.40, 0.35, 0.05, 0.0, 0.0, 0.0, 0.0, 0.0]
    return P


# ------------------------------------------------------------------ equivalence with the current decoder
def test_no_target_matches_reference(probs):
    """Without a count prior the table is the current decoder's, bit for bit."""
    for miss in (0.0, 0.05):
        assert np.allclose(expected_f05_table(probs, None, miss),
                           reference_expected_f05_table(probs, None, miss), atol=0, rtol=0)


def test_target_equal_to_model_is_identity(probs):
    """Reweighting onto the decoder's own count distribution changes nothing (exactness of the reweighting)."""
    for miss in (0.0, 0.05):
        target = implied_count_pmf(probs, miss)
        got = expected_f05_table(probs, target, miss, alpha=1.0)
        assert np.allclose(got, reference_expected_f05_table(probs, None, miss), atol=1e-9)


def test_alpha_zero_is_identity(probs):
    """alpha = 0 switches the prior off, whatever the target is."""
    target = np.repeat(count_prior()[None, :], len(probs), axis=0)
    assert np.allclose(expected_f05_table(probs, target, 0.0, alpha=0.0),
                       reference_expected_f05_table(probs, None, 0.0), atol=1e-9)


def test_weights_keep_the_joint_normalised(probs):
    """sum_n model(n) lam(n) = 1 for every row, so the reweighted joint is still a distribution."""
    model = implied_count_pmf(probs, 0.03)
    for alpha in (0.25, 0.5, 1.0):
        lam = count_weights(model, np.repeat(count_prior()[None, :], len(probs), axis=0), alpha)
        assert np.allclose((model * lam).sum(1), 1.0, atol=1e-9)


def test_table_is_a_valid_f05_expectation(probs):
    """Every entry is a convex combination of F0.5 values, so it lies in [0, 1]."""
    target = np.repeat(count_prior()[None, :], len(probs), axis=0)
    E = expected_f05_table(probs, target, 0.03)
    assert E.min() >= -1e-12 and E.max() <= 1 + 1e-12


# ------------------------------------------------------------------ the behaviour the change is for
def test_a_count_model_moves_the_prefix_both_ways():
    """The fold-0 failure case: three certain matches and a fourth at p = 0.55.

    Independent Bernoulli stops at 3 (the 0.55 pair is expected to cost more precision than it buys recall).
    A count model that puts its mass on n = 4 takes it - that is bucket (a) of logs/fn_buckets_v4.json
    (13,717 true pairs, p2 median 0.531, none above p = 0.8). A count model that says n = 2 instead shortens
    the prefix and drops a p = 0.98 pair, which is the same mechanism working for precision.
    """
    P = np.array([[0.99, 0.99, 0.98, 0.55, 0.08, 0.02]])
    assert reference_expected_f05_table(P, None, 0.0).argmax(1)[0] == 3
    for n, want in ((2, 2), (3, 3), (4, 4), (5, 4)):
        t = np.zeros((1, 12))
        t[0, n], t[0, n - 1], t[0, min(n + 1, 11)] = 0.8, 0.1, 0.1
        assert expected_f05_table(P, t, 0.0).argmax(1)[0] == want, n


def test_prefix_is_monotone_in_the_count_target():
    """A count target concentrated on a larger n never shortens the prefix."""
    P = np.array([[0.90, 0.70, 0.60, 0.50, 0.40, 0.20]])
    sizes = []
    for n in range(7):
        t = np.zeros((1, 12))
        t[0, n] = 1.0
        sizes.append(int(expected_f05_table(P, t, 0.0).argmax(1)[0]))
    assert sizes == sorted(sizes)
    assert sizes[0] == 0


def test_h_prior_lifts_a_diffuse_candidate_set():
    """The zero-training target (global train prior scaled by the existing h) already lifts bucket-(a) shapes.

    Four candidates in the 0.45-0.60 band: independent Bernoulli keeps 3, the count prior keeps 4, because
    under it "this S1 has 4 matches" is far more likely than the flat convolution of the four p values says.
    """
    P = np.array([[0.60, 0.55, 0.50, 0.45, 0.05]])
    assert reference_expected_f05_table(P, None, 0.0).argmax(1)[0] == 3
    assert expected_f05_table(P, pmf_from_h(np.array([1.0])), 0.0).argmax(1)[0] == 4


def test_singleton_stays_empty_when_h_is_low():
    """A weak candidate set with a low has-match probability still decodes to the empty set."""
    P = np.array([[0.30, 0.12, 0.04, 0.0]])
    target = pmf_from_h(np.array([0.05]))
    assert expected_f05_table(P, target, 0.0).argmax(1)[0] == 0


def test_alpha_interpolates_between_the_two_decoders():
    """Raising alpha moves the prefix from the independent choice towards the prior's, never past it."""
    P = np.array([[0.60, 0.55, 0.50, 0.45, 0.05]])
    target = pmf_from_h(np.array([1.0]))
    sizes = [int(expected_f05_table(P, target, 0.0, alpha=a).argmax(1)[0]) for a in (0.0, 0.25, 0.5, 1.0)]
    assert sizes[0] == 3 and sizes[-1] == 4
    assert sizes == sorted(sizes)


def test_pmf_from_h_is_a_pmf():
    """P(n = 0) = 1 - h and the rows sum to 1."""
    h = np.array([0.0, 0.3, 0.95, 1.0])
    pmf = pmf_from_h(h)
    assert np.allclose(pmf.sum(1), 1.0)
    assert np.allclose(pmf[:, 0], 1 - h)


# ------------------------------------------------------------------ the pair-level entry point
def test_count_decode_selects_prefixes_by_probability():
    """count_decode keeps a per-entity prefix of the p-sorted pairs and never touches ent = -1 rows."""
    ent = np.array([0, 0, 0, 1, 1, -1, 2])
    p = np.array([0.20, 0.99, 0.60, 0.97, 0.96, 0.99, 0.02])
    keep = count_decode(ent, p, 3, count_prior()[None, :])
    assert keep.dtype == bool and len(keep) == len(p)
    assert not keep[5]                                       # dropped by the one-to-one rule
    assert keep[1] and keep[3] and keep[4]                   # confident pairs are kept
    assert not keep[0]                                       # p = 0.20 is below the p = 0.60 pair of its S1
    assert not keep[6]                                       # a lone p = 0.02 candidate decodes to empty


def test_count_decode_matches_the_table_choice():
    """The mask agrees with the table's argmax prefix on a random batch (chunking included)."""
    rng = np.random.default_rng(7)
    n = 500
    ent = np.repeat(np.arange(n), 4)
    p = rng.random(len(ent))
    target = np.repeat(count_prior()[None, :], n, axis=0)
    keep = count_decode(ent, p, n, target, chunk=97)
    from count_decoder import padded
    P, _, _ = padded(ent, p, n)
    want = expected_f05_table(P, target).argmax(1)
    assert np.array_equal(np.bincount(ent[keep], minlength=n), want)


def test_shared_and_per_entity_targets_agree():
    """A (1 x T) shared prior and the same prior repeated per entity decode identically."""
    rng = np.random.default_rng(11)
    n = 300
    ent = np.repeat(np.arange(n), 5)
    p = rng.random(len(ent))
    prior = count_prior()[None, :]
    assert np.array_equal(count_decode(ent, p, n, prior),
                          count_decode(ent, p, n, np.repeat(prior, n, axis=0)))
