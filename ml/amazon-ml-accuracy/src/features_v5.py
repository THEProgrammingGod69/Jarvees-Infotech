"""v5 pair features: the three gaps the fold-0 error log names, plus token rarity and cross-source agreement.

``logs/model_v4_errors.txt`` summarises what the v4 model still gets wrong:

    "mostly name-only queries (empty address); decoys differing only by a legal form ('... Public Limited';
     legal forms are stripped from name_core -> add a legal-form mismatch feature); sibling sub-numbers
     (12-1-331/C/8 vs /C/1)"

and ``logs/experiments.md`` lists cross-source sibling agreement (Step 2) as dropped for time. This module
adds one family per item, all pure functions over the fields the normalisation stage already produces:

    legal_form_features      legal_form is a canonical 'A|B' code string per record and is *not* compared
                             anywhere today, because name_core has the legal words removed - so
                             "Acme Private Limited" and "Acme Public Limited" are identical on every name
                             feature the model sees
    number_sequence_features addr_clean drops '-' and '/', so 12-1-331/C/8 and 12-1-331/C/1 both become the
                             ordered number list in ``numbers``; comparing those lists as sequences (prefix,
                             tail, position agreement) separates sibling sub-numbers, which the existing
                             set-based street-number features cannot
    idf_features             no rarity signal exists in the current features: sharing "enterprises" counts as
                             much as sharing a rare surname. Document frequencies are counted on the provided
                             records only (no external data, no country logic)
    cross_source_p1_features the S1's claimants from the *other* source, scored by stage 1: a true match
                             usually has a partner record in the other source with a high p1, a decoy is more
                             often alone. Text-only versions of this exist (tw_*, g_same_src); the p1 version
                             is what Step 2 was going to add

Wiring (three one-line edits, spelled out in ../README.md "Step 2"):
    src/features_v3.py    TEXT_COLS += ["legal_form", "numbers"]
    src/features_v3.py::build_partition   add_v5_features(df, q_per_pair, s_per_pair, df_map=token_df(...))
    src/model_lgb.py::p1_aggregates       df[...] = cross_source_p1_features(s1, qid, p1)
and extend AGG1 with V5_STAGE2_COLS so stage 2 sees the cross-source columns.

For the 50M-pair test partition put the per-pair families in the existing process pool: ``v5_chunk`` has the
same shape as ``src/features_v3.py::_pair_worker``.
"""
from collections import Counter

import numpy as np
import pandas as pd
from rapidfuzz import fuzz, process

try:                                      # inside the competition package
    from .text_norm import LEGAL_SUBSUMED_BY
except ImportError:                       # standalone (tests, notebooks)
    # mirrors src/text_norm.py: a generic code is dropped when a specific one is present
    LEGAL_SUBSUMED_BY = {"LIMITED": {"PRIVATE_LIMITED", "PUBLIC_LIMITED"}}

QUERY_ID_MULT = 100_000_000               # src/blocking.py: query_id = source * 10**8 + row
QUERY_SOURCES = (2, 3)
_NAN = np.float32(np.nan)
V5_PAIR_COLS = ("lf_both", "lf_missing", "lf_equal", "lf_compatible", "lf_conflict", "lf_jaccard",
                "nseq_ratio", "nseq_prefix", "nseq_pos_agree", "nseq_last_equal", "nseq_last_conflict",
                "nseq_len_diff", "nseq_jaccard", "idf_shared_max", "idf_shared_sum", "idf_q_rarest",
                "idf_extra_q_max", "idf_extra_s1_max", "idf_cover_q", "name_only_pair")
V5_STAGE2_COLS = ("xs_p1_max", "xs_p1_sum", "xs_n", "xs_p1_margin", "ss_p1_max", "ss_p1_margin")


# ------------------------------------------------------------------ legal forms
def _codes(value: str) -> frozenset:
    """Return the set of legal-form codes in a canonical 'A|B' legal_form string."""
    return frozenset(c for c in value.split("|") if c) if value else frozenset()


def _compatible(a: frozenset, b: frozenset) -> bool:
    """Return True if two non-empty code sets can describe the same entity.

    Equal sets are compatible; so is a generic code against the specific code that subsumes it
    ('Limited' vs 'Pvt Ltd'). 'Private Limited' against 'Public Limited' is not - that is the decoy pattern
    the error log calls out.
    """
    if a == b:
        return True
    for x in a:
        for y in b:
            if x == y or y in LEGAL_SUBSUMED_BY.get(x, ()) or x in LEGAL_SUBSUMED_BY.get(y, ()):
                return True
    return False


def legal_form_features(q_legal, s_legal) -> dict:
    """Return the legal-form agreement features for aligned legal_form columns.

    lf_both / lf_missing   both sides carry a code / how many sides do not (0, 1, 2)
    lf_equal               identical code sets
    lf_compatible          both present and compatible (equal, or one subsumes the other)
    lf_conflict            both present and incompatible - 'Private Limited' vs 'Public Limited'
    lf_jaccard             |intersection| / |union| of the code sets (NaN when either side is empty)
    """
    n = len(q_legal)
    out = {k: np.zeros(n, dtype=np.float32) for k in
           ("lf_both", "lf_missing", "lf_equal", "lf_compatible", "lf_conflict")}
    out["lf_jaccard"] = np.full(n, _NAN, dtype=np.float32)
    for i, (a, b) in enumerate(zip(q_legal, s_legal)):
        ca, cb = _codes(a), _codes(b)
        out["lf_missing"][i] = (not ca) + (not cb)
        if not ca or not cb:
            continue
        out["lf_both"][i] = 1.0
        out["lf_equal"][i] = ca == cb
        ok = _compatible(ca, cb)
        out["lf_compatible"][i] = ok
        out["lf_conflict"][i] = not ok
        out["lf_jaccard"][i] = len(ca & cb) / len(ca | cb)
    return out


# ------------------------------------------------------------------ number sequences (sibling sub-numbers)
def number_sequence_features(q_numbers, s_numbers) -> dict:
    """Return sequence-aware comparisons of the ordered ``numbers`` fields.

    The normalisation drops '-' and '/', so a compound house number survives only as the ordered list of its
    parts: '12-1-331/C/8' -> '12 1 331 8'. Its sibling '12-1-331/C/1' shares every part but the last, which
    the set-based street-number features (st_compat / st_jaccard / st_main_*) cannot see.

    nseq_ratio         rapidfuzz ratio of the two space-joined sequences (NaN if either is empty)
    nseq_prefix        length of the common leading run / longer sequence length
    nseq_pos_agree     share of positions (up to the shorter length) holding the same number
    nseq_last_equal    the sequences end on the same number
    nseq_last_conflict both non-empty and ending on different numbers
    nseq_len_diff      absolute difference in length
    nseq_jaccard       set Jaccard over all numbers (not only the street-tagged ones)
    """
    n = len(q_numbers)
    out = {k: np.zeros(n, dtype=np.float32) for k in
           ("nseq_prefix", "nseq_pos_agree", "nseq_last_equal", "nseq_last_conflict", "nseq_len_diff")}
    out["nseq_ratio"] = np.full(n, _NAN, dtype=np.float32)
    out["nseq_jaccard"] = np.full(n, _NAN, dtype=np.float32)
    ratio = (process.cpdist(list(q_numbers), list(s_numbers), scorer=fuzz.ratio, workers=-1) / 100).astype(np.float32)
    for i, (a, b) in enumerate(zip(q_numbers, s_numbers)):
        qa, sa = a.split(), b.split()
        out["nseq_len_diff"][i] = abs(len(qa) - len(sa))
        if not qa or not sa:
            continue
        out["nseq_ratio"][i] = ratio[i]
        k = 0
        while k < min(len(qa), len(sa)) and qa[k] == sa[k]:
            k += 1
        out["nseq_prefix"][i] = k / max(len(qa), len(sa))
        same = sum(x == y for x, y in zip(qa, sa))
        out["nseq_pos_agree"][i] = same / min(len(qa), len(sa))
        out["nseq_last_equal"][i] = qa[-1] == sa[-1]
        out["nseq_last_conflict"][i] = qa[-1] != sa[-1]
        sq, ss = set(qa), set(sa)
        out["nseq_jaccard"][i] = len(sq & ss) / len(sq | ss)
    return out


# ------------------------------------------------------------------ token rarity
def token_df(texts) -> tuple:
    """Return ({token: document frequency}, number of documents) for space-joined token strings."""
    df = Counter()
    n = 0
    for t in texts:
        n += 1
        if t:
            df.update(set(t.split()))
    return dict(df), n


def _idf(token: str, df: dict, n_docs: int, unseen: float) -> float:
    """Return log((1 + n_docs) / (1 + df)) for a token, or ``unseen`` when the token was never counted."""
    d = df.get(token)
    return unseen if d is None else float(np.log((1.0 + n_docs) / (1.0 + d)))


def idf_features(q_core, s_core, df: dict, n_docs: int) -> dict:
    """Return rarity features over the shared and the extra name tokens of each pair.

    Document frequencies must be counted on the records of the same partition (``token_df`` over the S1
    name_core column is the cheap choice - it is the side that is present for every pair). Matching is exact
    on tokens, so it is unaffected by the fuzzy token matching used elsewhere.

    idf_shared_max / _sum   how distinctive the agreement is ("shakuntala" beats "enterprises")
    idf_q_rarest            the rarest token of the query name, shared or not
    idf_extra_q_max         the rarest token the query has and the S1 does not - a rare extra word is the
                            classic sibling marker ('... International', '... Exports' are common; a rare
                            extra token means a different business)
    idf_extra_s1_max        the same from the S1 side
    idf_cover_q             share of the query's IDF mass that the S1 covers
    """
    n = len(q_core)
    unseen = float(np.log(1.0 + n_docs))
    out = {k: np.zeros(n, dtype=np.float32) for k in ("idf_shared_max", "idf_shared_sum", "idf_q_rarest",
                                                      "idf_extra_q_max", "idf_extra_s1_max")}
    out["idf_cover_q"] = np.full(n, _NAN, dtype=np.float32)
    for i, (a, b) in enumerate(zip(q_core, s_core)):
        qa, sa = set(a.split()), set(b.split())
        if not qa and not sa:
            continue
        w_q = {t: _idf(t, df, n_docs, unseen) for t in qa}
        shared = qa & sa
        if shared:
            vals = [w_q[t] for t in shared]
            out["idf_shared_max"][i] = max(vals)
            out["idf_shared_sum"][i] = sum(vals)
        if qa:
            out["idf_q_rarest"][i] = max(w_q.values())
            extra_q = qa - sa
            out["idf_extra_q_max"][i] = max((w_q[t] for t in extra_q), default=0.0)
            total = sum(w_q.values())
            out["idf_cover_q"][i] = (out["idf_shared_sum"][i] / total) if total > 0 else _NAN
        extra_s = sa - qa
        out["idf_extra_s1_max"][i] = max((_idf(t, df, n_docs, unseen) for t in extra_s), default=0.0)
    return out


# ------------------------------------------------------------------ stage-2: cross-source agreement on p1
def _group_rank(key: np.ndarray, score: np.ndarray) -> np.ndarray:
    """Return the 1-based rank of each row within its key group by descending score (src/features_v3.py)."""
    order = np.lexsort((np.arange(len(key)), -score, key))
    k = key[order]
    start = np.r_[0, np.flatnonzero(k[1:] != k[:-1]) + 1]
    rank = np.empty(len(key), dtype=np.float32)
    rank[order] = np.arange(len(key)) - np.repeat(start, np.diff(np.r_[start, len(key)])) + 1
    return rank


def cross_source_p1_features(s1: np.ndarray, qid: np.ndarray, p1: np.ndarray) -> dict:
    """Return per-pair features from the stage-1 scores of the S1's claimants in the other / same source.

    xs_p1_max / xs_p1_sum / xs_n   best, total and number of the S1's candidate pairs whose query comes from
                                   the *other* source (S2 vs S3)
    xs_p1_margin                   this pair's p1 minus that best - negative when a cross-source partner is
                                   more convincing than this pair
    ss_p1_max / ss_p1_margin       the same within the pair's own source, excluding the pair itself
    """
    src = (qid // QUERY_ID_MULT).astype(np.int64)
    key = s1.astype(np.int64) * 8 + src
    g = pd.Series(p1)
    mx = g.groupby(key).transform("max").to_numpy()
    sm = g.groupby(key).transform("sum").to_numpy()
    cnt = g.groupby(key).transform("size").to_numpy()
    other_key = s1.astype(np.int64) * 8 + np.where(src == QUERY_SOURCES[0], QUERY_SOURCES[1], QUERY_SOURCES[0])
    tbl = pd.DataFrame({"key": key, "mx": mx, "sm": sm, "cnt": cnt}).drop_duplicates("key").set_index("key")
    o = tbl.reindex(other_key)
    xs_max = o["mx"].fillna(0.0).to_numpy(dtype=np.float32)
    # own source, excluding this pair: the group max unless this pair *is* the max, then the second best
    # (vectorised the same way as src/features_v3.py::group_top2 - no per-group Python)
    rank = _group_rank(key, p1)
    second = pd.Series(np.where(rank == 2, p1, -np.inf)).groupby(key).transform("max").to_numpy()
    second = np.where(np.isfinite(second), second, 0.0)
    ss_max = np.where(rank == 1, second, mx).astype(np.float32)
    return {"xs_p1_max": xs_max, "xs_p1_sum": o["sm"].fillna(0.0).to_numpy(dtype=np.float32),
            "xs_n": o["cnt"].fillna(0.0).to_numpy(dtype=np.float32),
            "xs_p1_margin": (p1 - xs_max).astype(np.float32), "ss_p1_max": ss_max,
            "ss_p1_margin": (p1 - ss_max).astype(np.float32)}


# ------------------------------------------------------------------ orchestration
def v5_chunk(args: tuple) -> dict:
    """Worker: the per-pair v5 features for one chunk of aligned texts.

    Same shape as ``src/features_v3.py::_pair_worker`` so it can go straight into that stage's process pool,
    which is where it belongs for the 50M-pair test partition. ``args`` is
    (q_legal, s_legal, q_numbers, s_numbers, q_core, s_core, (document frequency, document count)).
    """
    q_legal, s_legal, q_numbers, s_numbers, q_core, s_core, df_map = args
    out = {}
    out.update(legal_form_features(q_legal, s_legal))
    out.update(number_sequence_features(q_numbers, s_numbers))
    out.update(idf_features(q_core, s_core, *df_map))
    return out


def add_v5_features(df, qtext: dict, stext: dict, df_map: tuple = None) -> dict:
    """Add every v5 pair feature to a pair frame in place; return the column -> array mapping that was added.

    ``qtext`` / ``stext`` are the aligned **per-pair** text dicts of
    ``src/features_v3.py::build_partition`` (its ``unique_texts`` output indexed by ``qinv`` / ``sinv``), and
    must include legal_form, numbers, name_core and addr_clean.

    ``df_map`` is the (document frequency, document count) pair from ``token_df`` and should be counted over
    the partition's **unique** S1 records - passing the per-pair array instead weights every record by how
    many candidates it has, which is not a document frequency. When omitted it is counted on what is given,
    which is right only if ``stext`` is already unique.
    """
    if df_map is None:
        df_map = token_df(stext["name_core"])
    cols = {}
    cols.update(legal_form_features(qtext["legal_form"], stext["legal_form"]))
    cols.update(number_sequence_features(qtext["numbers"], stext["numbers"]))
    cols.update(idf_features(qtext["name_core"], stext["name_core"], *df_map))
    empty_q = np.array([not x for x in qtext.get("addr_clean", [""] * len(df))])
    empty_s = np.array([not x for x in stext.get("addr_clean", [""] * len(df))])
    cols["name_only_pair"] = (empty_q & empty_s).astype(np.float32)
    for k, v in cols.items():
        df[k] = v
    return cols
