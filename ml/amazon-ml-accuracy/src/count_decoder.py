"""Count-conditioned expected-F0.5 set decoder (drop-in replacement for src/decoder.py's decoder).

Why
---
``src/decoder.py`` chooses, per S1 entity, the prefix of its candidates that maximises the exact expected
F0.5 under **independent** Bernoulli(p) pair labels (plus a Poisson term for matches lost in blocking and an
optional S1-level P(has any match) = h). Independence is the wrong prior for this task: the number of true
matches per S1 entity is a sharply peaked distribution (train: 5.6% singletons, then 5.4% / 17.0% / 24.0% /
21.9% / 14.6% for 1 / 2 / 3 / 4 / 5 matches, max 11), so "this S1 already has 3 confident matches" is strong
evidence that a 4th candidate at p = 0.55 is real. The independent decoder cannot use that; it drops the 4th.

That is exactly where the model loses most: ``logs/fn_buckets_v4.json`` attributes 0.00956 of the 0.0281
points lost on fold 0 to bucket (a) - true pairs whose query argmax *was* the right S1, kept by the
one-to-one rule, and then rejected by the decoder (13,717 pairs, p2 median 0.531, 71% in 0.3-0.8, none
above 0.8). Nothing is wrong with p there; the prefix length is wrong.

How
---
The existing decoder already computes the exact joint distribution of (a = true pairs inside the prefix,
b = true pairs outside it, including those lost in blocking) under independence. Its total-count
distribution ``P_model(n)`` is the convolution of those two, which does not depend on the prefix size k.
Reweighting that joint by

    lam(n) = P_target(n) / P_model(n)          (n = a + b)

turns it *exactly* into the distribution whose total-count marginal is ``P_target`` and whose conditional
label structure given n is unchanged (the conditional-Bernoulli / weighted-without-replacement conditional
of the independent model). No approximation is introduced, the normalisation is automatic
(sum_n P_model(n) lam(n) = 1), and with ``P_target = P_model`` the table is identical to the old one -
``tests/test_count_decoder.py`` asserts both properties.

``P_target`` can come from (cheapest first):
    1. ``pmf_from_h`` - the global train count prior scaled by the existing has-match model's h. No new
       model, no retraining: strictly more informative than the current ``Q = min(p / h, 1)`` rescaling,
       which only shifts the mean.
    2. ``src/count_model.py`` - a per-S1 LightGBM multiclass model over n = 0..N_MAX. It subsumes the
       has-match model (h = 1 - P(n = 0)) and only needs the saved pair probabilities.

``alpha`` (0 = ignore the prior and reproduce the old decoder, 1 = apply it fully) is the safety dial to
tune on OOF folds next to ``temperature`` and ``miss``, the same way the current decoder is tuned.

How much this is worth - read this before spending a Kaggle slot on it
---------------------------------------------------------------------
Measured on the simulator in ../sim, calibrated to the published fold-0 operating point:

    knowing the exact match count          +0.0155 macro F0.5   (../results/count_ceiling.md)
    a count model fitted on the scores     +0.0000              (../results/pipeline_sim.md)

So the mechanism has real headroom, but only for count information the pair scores do not already carry - a
count distribution re-derived from the same candidate probabilities the decoder is already looking at adds
nothing, however accurate it is. That is why ``src/count_model.py`` also takes S1-side statistics (hubness,
text size, script) and why ``src/model_lgb_v5.py --stage count`` fits the model twice and reports how many
nats the S1-side features add over the score profile alone. If that number is ~0 on the real data, this lever
is spent and the tuning grid will say so by picking alpha near 0.

API mirrors ``src/decoder.py`` so the call sites change by one line.
"""
import numpy as np

BETA2 = 0.25          # F0.5: beta^2
K_MAX = 12            # candidates per S1 considered by the decoder (after one-to-one, sorted by p)
M_MAX = 4             # Poisson truncation for matches lost in blocking
N_MAX = 11            # largest true-match count per S1 seen in train

# Train match-count histogram (student_resource/eda_report.txt, 2,206,821 S1; bucket 10 = 10+, so the tail
# is spread over 10 and 11 in proportion 0.75 / 0.25 - only the shape matters, it is renormalised).
TRAIN_COUNTS = (123247, 119157, 375212, 530841, 484115, 321957, 164868, 63968, 18680, 4205, 428, 143)


def count_prior(counts=TRAIN_COUNTS, n_max: int = N_MAX) -> np.ndarray:
    """Return a normalised count pmf over 0..n_max from a histogram (longer input is truncated and renormalised)."""
    p = np.zeros(n_max + 1, dtype=np.float64)
    c = np.asarray(counts, dtype=np.float64)[:n_max + 1]
    p[:len(c)] = c
    total = p.sum()
    if total <= 0:
        raise ValueError("count histogram is empty")
    return p / total


def pmf_from_h(h: np.ndarray, prior: np.ndarray = None) -> np.ndarray:
    """Return a per-S1 target count pmf from the has-match probability h and a global prior over n >= 1.

    P(n = 0) = 1 - h and P(n = k) = h * prior(k) / sum_{j>=1} prior(j) for k >= 1: the cheapest useful target,
    available wherever the current has-match model already runs.
    """
    prior = count_prior() if prior is None else np.asarray(prior, dtype=np.float64)
    tail = prior[1:] / prior[1:].sum()
    h = np.clip(np.asarray(h, dtype=np.float64).reshape(-1, 1), 0.0, 1.0)
    return np.concatenate([1.0 - h, h * tail[None, :]], axis=1)


def logit_temperature(p: np.ndarray, t: float) -> np.ndarray:
    """Return sigmoid(logit(p) / t) (t > 1 flattens, t < 1 sharpens). Same as src/decoder.py."""
    if t == 1.0:
        return p
    q = np.clip(p, 1e-6, 1 - 1e-6)
    return 1 / (1 + np.exp(-np.log(q / (1 - q)) / t))


def padded(ent: np.ndarray, p: np.ndarray, n: int, k_max: int = K_MAX) -> tuple:
    """Return (P n x k_max probabilities sorted desc per entity, pair index matrix (-1 = pad), dropped count).

    Copied from src/decoder.py so this module stays importable on its own.
    """
    m = ent >= 0
    idx = np.flatnonzero(m)
    order = idx[np.lexsort((-p[idx], ent[idx]))]
    e = ent[order]
    start = np.r_[0, np.flatnonzero(e[1:] != e[:-1]) + 1]
    pos = np.arange(len(e)) - np.repeat(start, np.diff(np.r_[start, len(e)]))
    ok = pos < k_max
    P = np.zeros((n, k_max))
    I = np.full((n, k_max), -1, dtype=np.int64)
    P[e[ok], pos[ok]] = p[order[ok]]
    I[e[ok], pos[ok]] = order[ok]
    return P, I, int((~ok).sum())


def _poisson(lam: np.ndarray, m_max: int = M_MAX) -> np.ndarray:
    """Return the truncated (renormalised) Poisson pmf 0..m_max for each lambda (n x (m_max + 1))."""
    k = np.arange(m_max + 1)
    fact = np.array([np.prod(np.arange(1, i + 1)) for i in k], dtype=float)
    pmf = np.exp(-lam[:, None]) * lam[:, None] ** k / fact
    return pmf / pmf.sum(1, keepdims=True)


def _backward(Q: np.ndarray, miss: float) -> np.ndarray:
    """Return B (K + 1, n, K + M_MAX + 1): distribution of true pairs among items k..K-1 plus the missed count.

    Identical to the backward pass of src/decoder.py's expected_f05_table.
    """
    n, K = Q.shape
    lam = miss / (1 - miss) * Q.sum(1) if miss > 0 else np.zeros(n)
    M = _poisson(lam)
    B = np.zeros((K + 1, n, K + M_MAX + 1))
    B[K, :, :M_MAX + 1] = M
    for k in range(K - 1, -1, -1):
        q = Q[:, k:k + 1]
        B[k] = B[k + 1] * (1 - q)
        B[k, :, 1:] += B[k + 1, :, :-1] * q
    return B


def count_weights(model_pmf: np.ndarray, target_pmf: np.ndarray, alpha: float = 1.0,
                  clip: float = 100.0, eps: float = 1e-9) -> np.ndarray:
    """Return the per-row reweighting lam(n) that maps the model's count pmf onto ``target_pmf``.

    ``model_pmf`` (n x S) is the decoder's own total-count distribution, ``target_pmf`` (n x T or 1 x T) the
    wanted one; the result is (n x S). ``alpha`` interpolates on the log scale (0 = all ones = the old
    decoder, 1 = full reweighting), ``clip`` bounds the ratio so a count the pair model considers nearly
    impossible cannot dominate. Rows are renormalised so sum_n model_pmf(n) lam(n) = 1 exactly, which keeps
    the reweighted joint a probability distribution.
    """
    n, S = model_pmf.shape
    t = np.zeros((len(target_pmf), S), dtype=np.float64)
    T = min(S, target_pmf.shape[1])
    t[:, :T] = np.asarray(target_pmf, dtype=np.float64)[:, :T]
    if t.shape[0] == 1 and n > 1:
        t = np.repeat(t, n, axis=0)
    t = t / np.maximum(t.sum(1, keepdims=True), eps)
    ratio = (t + eps) / (model_pmf + eps)
    lam = ratio if alpha == 1.0 else ratio ** alpha
    lam = np.clip(lam, 1.0 / clip, clip)
    z = (model_pmf * lam).sum(1, keepdims=True)
    return lam / np.maximum(z, eps)


def expected_f05_table(P: np.ndarray, target_pmf: np.ndarray = None, miss: float = 0.0, alpha: float = 1.0,
                       clip: float = 100.0) -> np.ndarray:
    """Return E[F0.5] for every prefix size k = 0..K of each row of sorted probabilities P (n x (K + 1)).

    With ``target_pmf = None`` this is exactly src/decoder.py's table without h. With a target pmf the joint
    over (true inside prefix, true outside prefix + lost in blocking) is reweighted so its total-count
    marginal becomes ``target_pmf``; the conditional structure given the total count is untouched.
    """
    n, K = P.shape
    Q = P
    B = _backward(Q, miss)
    lam = None if target_pmf is None else count_weights(B[0], target_pmf, alpha, clip)
    E = np.zeros((n, K + 1))
    E[:, 0] = B[0, :, 0] if lam is None else B[0, :, 0] * lam[:, 0]     # empty set is right iff n = 0
    D = np.zeros((n, K + 1))
    D[:, 0] = 1.0                                                      # forward: TP count among the first k
    a = np.arange(K + 1)[:, None]
    b = np.arange(K + M_MAX + 1)[None, :]
    # a + b can exceed the support of the count pmf; those states have probability 0 (a counts pairs inside
    # the prefix, b the same pairs' complement plus the missed ones), so clipping the lookup is harmless.
    nb = None if lam is None else np.minimum(a + b, lam.shape[1] - 1)
    for k in range(1, K + 1):
        q = Q[:, k - 1:k]
        D = D * (1 - q) + np.concatenate([np.zeros((n, 1)), D[:, :-1]], 1) * q
        W = np.where(a > 0, (1 + BETA2) * a / (k + BETA2 * (a + b)), 0.0)          # (K+1) x (K+M+1)
        if lam is None:
            E[:, k] = np.einsum("na,nb,ab->n", D, B[k], W)
        else:
            L = lam[:, nb]                                             # n x (K+1) x (K+M+1): lam(a + b)
            E[:, k] = np.einsum("na,nb,nab->n", D, B[k], W[None] * L)
    return E


def count_decode(ent: np.ndarray, p: np.ndarray, n: int, target_pmf: np.ndarray = None,
                 temperature: float = 1.0, miss: float = 0.0, alpha: float = 1.0, clip: float = 100.0,
                 chunk: int = 50_000) -> np.ndarray:
    """Return the predicted-pair mask choosing, per entity, the prefix with the highest expected F0.5.

    ``ent`` / ``p`` must already be restricted to the one-to-one kept pairs (others: ent = -1), exactly as
    for src/decoder.py's expected_f05_decode. ``target_pmf`` is (n x T) aligned with the entity index, or
    (1 x T) for one shared prior, or None to fall back to the independent decoder.
    """
    P, I, _ = padded(ent, logit_temperature(p, temperature), n)
    keep = np.zeros(len(p), dtype=bool)
    shared = target_pmf is not None and np.asarray(target_pmf).shape[0] == 1
    for s in range(0, n, chunk):
        sl = slice(s, s + chunk)
        tp = None if target_pmf is None else (target_pmf if shared else target_pmf[sl])
        E = expected_f05_table(P[sl], tp, miss, alpha, clip)
        best = E.argmax(1)
        take = np.arange(P.shape[1])[None, :] < best[:, None]
        rows = I[sl][take & (I[sl] >= 0)]
        keep[rows] = True
    return keep


def expected_size(E: np.ndarray) -> np.ndarray:
    """Return the chosen prefix size per row of an expected-F0.5 table (diagnostics)."""
    return E.argmax(1)
