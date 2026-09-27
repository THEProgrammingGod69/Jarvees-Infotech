"""Verbatim copy of the competition repo's src/decoder.py decoder (commit ff25b6f), kept for comparison.

Nothing imports this in production - it exists so the tests can assert that count_decoder reproduces the
current behaviour exactly, and so the simulation in sim/ can score the current decoder against the new one
without depending on a checkout of the other repository. Do not "improve" this file; if the upstream decoder
changes, re-copy it and let the tests report the difference.
"""
import numpy as np
import pandas as pd

BETA2 = 0.25
K_MAX = 12
M_MAX = 4


def logit_temperature(p: np.ndarray, t: float) -> np.ndarray:
    """Return sigmoid(logit(p) / t) (t > 1 flattens, t < 1 sharpens)."""
    if t == 1.0:
        return p
    q = np.clip(p, 1e-6, 1 - 1e-6)
    return 1 / (1 + np.exp(-np.log(q / (1 - q)) / t))


def padded(ent: np.ndarray, p: np.ndarray, n: int, k_max: int = K_MAX) -> tuple:
    """Return (P n x k_max probabilities sorted desc per entity, pair index matrix (-1 = pad), dropped count)."""
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
    """Return the truncated (renormalised) Poisson pmf 0..m_max for each lambda."""
    k = np.arange(m_max + 1)
    fact = np.array([np.prod(np.arange(1, i + 1)) for i in k], dtype=float)
    pmf = np.exp(-lam[:, None]) * lam[:, None] ** k / fact
    return pmf / pmf.sum(1, keepdims=True)


def expected_f05_table(P: np.ndarray, h: np.ndarray = None, miss: float = 0.0) -> np.ndarray:
    """Return E[F0.5] for every prefix size k = 0..K of each row of sorted probabilities P."""
    n, K = P.shape
    if h is not None:
        h = np.clip(h, 1e-6, 1.0)
        Q = np.minimum(P / h[:, None], 1.0)
    else:
        Q = P
    lam = miss / (1 - miss) * Q.sum(1) if miss > 0 else np.zeros(n)
    M = _poisson(lam)
    B = np.zeros((K + 1, n, K + M_MAX + 1))
    B[K, :, :M_MAX + 1] = M
    for k in range(K - 1, -1, -1):
        q = Q[:, k:k + 1]
        B[k] = B[k + 1] * (1 - q)
        B[k, :, 1:] += B[k + 1, :, :-1] * q
    E = np.zeros((n, K + 1))
    E[:, 0] = B[0, :, 0]
    D = np.zeros((n, K + 1))
    D[:, 0] = 1.0
    a = np.arange(K + 1)[:, None]
    b = np.arange(K + M_MAX + 1)[None, :]
    for k in range(1, K + 1):
        q = Q[:, k - 1:k]
        D = D * (1 - q) + np.concatenate([np.zeros((n, 1)), D[:, :-1]], 1) * q
        W = np.where(a > 0, (1 + BETA2) * a / (k + BETA2 * (a + b)), 0.0)
        E[:, k] = np.einsum("na,nb,ab->n", D, B[k], W)
    if h is not None:
        E = h[:, None] * E
        E[:, 0] += 1 - h
    return E


def expected_f05_decode(ent: np.ndarray, p: np.ndarray, n: int, h: np.ndarray = None, temperature: float = 1.0,
                        miss: float = 0.0, chunk: int = 100_000) -> np.ndarray:
    """Return the predicted-pair mask choosing, per entity, the prefix with the highest expected F0.5."""
    P, I, _ = padded(ent, logit_temperature(p, temperature), n)
    keep = np.zeros(len(p), dtype=bool)
    for s in range(0, n, chunk):
        sl = slice(s, s + chunk)
        E = expected_f05_table(P[sl], None if h is None else h[sl], miss)
        best = E.argmax(1)
        take = np.arange(P.shape[1])[None, :] < best[:, None]
        rows = I[sl][take & (I[sl] >= 0)]
        keep[rows] = True
    return keep


def threshold_decode(ent: np.ndarray, p: np.ndarray, t_accept: float, t_keep: float) -> np.ndarray:
    """Return the mask p >= t_accept, keeping an S1's pairs only if its best p >= t_keep (the empty rule)."""
    keep = (ent >= 0) & (p >= t_accept)
    if t_keep > t_accept:
        mx = pd.Series(np.where(keep, p, -np.inf)).groupby(ent).transform("max").to_numpy()
        keep &= mx >= t_keep
    return keep
