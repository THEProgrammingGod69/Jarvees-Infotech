# Accuracy work for the Amazon ML Challenge 2026 entity-resolution pipeline

Analysis and drop-in code for [`ambekararya2005/Amazon-ML-Challenge-Competition-`](https://github.com/ambekararya2005/Amazon-ML-Challenge-Competition-)
(read at commit `ff25b6f`; best submission there: public LB **0.945**, fold-0 gate 0.9719).

> This folder is unrelated to the Jarvees Academy website that makes up the rest of this repository — it lives
> here only because this is where the work was requested. Nothing in it is imported by the site, and the four
> shipping modules are meant to be copied into the competition repo's
> `code/business_entity_resolution/src/`.

Read [`ANALYSIS.md`](ANALYSIS.md) first — it is the actual answer: where the remaining error sits, why, and
which levers move it. This file is how to run what is here.

The competition dataset is not in that repository (git-ignored), so **nothing here was run against the real
data**. Everything is either (a) tested on synthetic inputs, (b) measured on a simulator calibrated to the
published fold-0 operating point, or (c) an explicitly labelled estimate. The one number to trust is the fold-0
score you get after running `--stage count` on your own machine.

---

## The short version

| # | lever | new compute | expected effect |
|---|---|---|---|
| 0 | Cross-fitted evaluation over all 5 folds instead of fold 0 alone | one scoring pass | no score — but fold-0's region spread is ±0.015, so without this the rest is a coin flip |
| 1 | **Wider region sample** (more regions, same row budget) | full re-block + retrain | 0.005–0.015, aimed at the **−0.027 leaderboard gap** rather than at fold 0 |
| 2 | **v5 features**: legal-form conflict, sub-number sequences, token rarity, cross-source p1 | one CV retrain | 0.002–0.004 — the error log's own list of remaining failures |
| 3 | Hard-negative stage-1 sampling, capacity + seed bagging, a lambdarank head | 1–4 CV retrains | 0.002–0.005 |
| 4 | **Count-conditioned decoder** + per-S1 count model | ~40 CPU-min, **no retraining, no re-blocking** | 0–0.004, and it closes the question either way in one run |

2 and 4 are implemented here; 1 and 3 are parameter and sampling changes in existing files, written up in
`ANALYSIS.md` §3.1 and §3.3.

**The headline finding.** The repo's own error split blames 0.0096 of the 0.0281 fold-0 loss on the decoder
("the true pair was kept by the one-to-one rule and then not selected"). That reading does not survive
measurement. On a simulator calibrated to the published fold-0 operating point (`sim/`, and it reproduces that
point on F0.5, predictions/S1, % empty, precision and recall):

| information the decoder is given | macro F0.5 | vs today |
|---|---|---|
| its own has-match model (today) | 0.9702 | — |
| a *perfect* has-match model (the true singleton flag) | 0.9728 | +0.0026 |
| **the exact match count** | **0.9857** | **+0.0155** |
| every label (nothing can beat this) | 0.9921 | +0.0221 |
| a count model **learned from the candidate scores** (top-1 0.81, well calibrated) | 0.9690 | **+0.0000** |

The count prior has real headroom — 70% of the whole prefix-choice loss, and almost none of it is the
singleton question their has-match model already answers — and re-deriving it from the probabilities the
decoder is already reading captures none of it. So the decision layer is close to optimal *given p2*, and
bucket (a) is a feature / data / capacity problem, not a decoder problem — which is why the ranking above puts
region breadth and features first. The count decoder still ships here because it is exact, `alpha = 0` recovers today's behaviour, and
`--stage count` reports in one run whether the S1-side statistics carry count information that p2 does not.

---

## Files

```
src/count_decoder.py     count-conditioned expected-F0.5 decoder; drop in next to src/decoder.py
src/count_model.py       per-S1 LightGBM count model P(n matches | the S1's scored candidates)
src/features_v5.py       legal-form / number-sequence / IDF / cross-source-p1 pair features
src/model_lgb_v5.py      stages: count (fit + tune + gate), submit (rescore test), verify
src/reference_decoder.py verbatim copy of the repo's current decoder, for the equivalence tests only
sim/decoder_sim.py       calibrates the simulator to fold 0, then compares every score-derived decoder
sim/count_ceiling.py     the ceiling: what a perfect singleton flag / a perfect count / omniscience would buy
sim/pipeline_sim.py      the full proposal under the repo's protocol, count model and has-match both learned
tests/                   44 tests (pytest); includes "must reproduce the current decoder exactly"
results/                 simulation output (json + md)
```

Only the four `src/` modules are meant to ship. They add no dependency: numpy, pandas, pyarrow, lightgbm and
rapidfuzz are already pinned in `code/business_entity_resolution/requirements.txt`.

---

## Installing into the competition repo

Copy the modules into the package (they use the same relative imports as their neighbours):

```bash
cp src/count_decoder.py src/count_model.py src/features_v5.py src/model_lgb_v5.py \
   <amazon-ml-repo>/code/business_entity_resolution/src/
```

### Step 1 — the decoder change (nothing to retrain)

From `code/business_entity_resolution/`, with the v4 artefacts in place
(`FEATURE_VARIANT=v4`, `<output>/models_v4/bench_preds.parquet` from `--stage train`):

```bash
# Windows: set FEATURE_VARIANT=v4     (the repo's own convention)
export FEATURE_VARIANT=v4

python -m src.model_lgb_v5 --stage verify   # alpha = 0 must reproduce the current decoder, pair for pair
python -m src.model_lgb_v5 --stage count    # fit the count model on folds 1-4, tune on OOF, score fold 0 once
```

`--stage count` writes `<output>/models_v4_v5/` (fold models + `artifacts.json` + the per-S1 count pmf) and
`logs/model_v4_v5_report.{json,md}`. The report prints, side by side:

- **`current`** — the decoder submission #4 ran, re-decoded from the saved probabilities. Its fold-0 macro F0.5
  should come out at **0.9719**; if it does not, the inputs are not the ones that produced #4, and the
  comparison below is meaningless. Check this first.
- **`count_decoder`** — the same pairs, decoded with the count prior, every setting (`temperature`, `miss`,
  `alpha`, `beta`, `tau`) chosen on OOF folds 1–4 only.
- `fold0_delta` — the number that decides whether to ship.

Then rescore test from the saved per-pair probabilities (no rescoring of the pair model):

```bash
# these files come from src/model_lgb.py --stage submit with SAVE_PAIRS=1
python -m src.model_lgb_v5 --stage submit          # all countries; or SUBMIT_COUNTRY=France for one

export PARTS_DIR=<output>/submit_parts_v4_v5
export FINAL_SUBDIR=final_v5
python -m src.model_lgb --stage assemble           # the repo's own writer + organiser validator
python -m src.check_submission --dir <output>/final_v5
```

`--stage submit` emits exactly the per-country part schema `--stage assemble` already consumes
(`entity_id, country, candidates, matches`), so the existing subset check, `\n`-only writers and validator run
unchanged. The candidate lists are rebuilt from the same saved tables, so `candidate_pairs.tsv` stays
identical to #4's — only `matching_results.tsv` changes.

If `bench_preds.parquet` or the `test_pairs_v4/` tables are missing, regenerate them with the existing stages:

```bash
python -m src.model_lgb --stage train                    # writes bench_preds.parquet
SAVE_PAIRS=1 SUBMIT_PARTS=1 python -m src.model_lgb --stage submit
```

### Step 2 — the v5 features (one retrain)

Three edits, all one line each.

**a. `src/features_v3.py`** — the text loader needs two more normalised columns:

```python
# before
TEXT_COLS = ["name_core", "addr_clean"]
# after
TEXT_COLS = ["name_core", "addr_clean", "legal_form", "numbers"]
```

**b. `src/features_v3.py::build_partition`** — add the features next to the twin features (and add
`from .features_v5 import add_v5_features, token_df` to the imports):

```python
    v2 = score_v2(df, cfg).astype(np.float32)
    group_features(df, v2)
    twin_features(df, v2, qtext, uq, logger)
    add_v5_features(df,                                                  # <-- add
                    {c: qtext[c][qinv] for c in TEXT_COLS},
                    {c: stext[c][sinv] for c in TEXT_COLS},
                    df_map=token_df(stext["name_core"]))   # document frequency over UNIQUE S1 records
    return df
```

`qinv` / `sinv` are already in scope, but the current code does `del qtags, stags, sinv` earlier — move that
`del` below this call. Pass `df_map` explicitly as shown: `stext["name_core"]` before the `sinv` indexing is
one entry per S1 record, which is what a document frequency means; the per-pair array would weight each record
by how many candidates it has.

For the 50M-pair test partition, put the three per-pair families in the pool instead of the main process —
`v5_chunk` has the same signature shape as the existing `_pair_worker`, so it slots into the
`pooled_map(pool, ...)` loop that is already there, and only `name_only_pair` (vectorised) stays outside.

**c. `src/model_lgb.py`** — cross-source agreement is a stage-2 feature, so it goes where the other p1
aggregates are built:

```python
from .features_v5 import V5_STAGE2_COLS, cross_source_p1_features

AGG1 = [...] + list(V5_STAGE2_COLS)          # so stage 2 uses them

def p1_aggregates(df, p1):
    ...                                       # unchanged body
    for k, v in cross_source_p1_features(s1, qid, p1).items():
        df[k] = v
```

Then rebuild features and retrain as usual (`--split bench`, `--stage train`), and check the new columns show
up in `importance_stage1` / `importance_stage2` in the report. `lf_conflict`, `nseq_last_conflict` and
`idf_extra_q_max` are the three I would expect to earn their place.

### Step 3 — sampling and capacity

`ANALYSIS.md` §3.3 and §3.2. These are parameter changes in `src/model_lgb.py` (`NEG_KEEP` applied to
non-claimant pairs only, `LGB_PARAMS`, a seed loop) and `src/benchmark.py` (`SAMPLE_SHARE` + a per-region cap).
No new modules, so they are written up rather than coded here.

---

## Running what is in this folder

```bash
pip install numpy pandas pyarrow lightgbm rapidfuzz pytest

python -m pytest tests -q                                    # 44 tests, ~2 s
python -m sim.decoder_sim   --entities 150000 --calibrate    # ~30 min, single core
python -m sim.count_ceiling --entities 100000                # ~10 min
SIM_THREADS=2 python -m sim.pipeline_sim --entities 60000    # ~15 min (fits two LightGBM models)
```

`tests/test_count_decoder.py` is the safety net: three tests assert the new decoder reproduces the current one
exactly (no target, target = its own implied count distribution, `alpha = 0`), and the rest pin the behaviour
the change is for. `src/reference_decoder.py` is a verbatim copy of the repo's decoder so those assertions do
not need a checkout of the other repository — if the upstream decoder ever changes, re-copy it and the tests
will report the difference.

Simulation results live in `results/` (regenerate to overwrite). Read §4 of `ANALYSIS.md` for what they are
evidence of and what they are not: the simulator reproduces the *published operating point* (F0.5 0.971,
3.30 predictions/S1, 5.7% empty, precision 0.986, recall 0.945 against the real 0.9719 / 3.29 / 5.89 / 0.990 /
0.946), but its signals are independent and exchangeable, while real decoys are near-copies of the true
siblings. Order of magnitude, not a leaderboard prediction.

---

## What I did not do

- **No run against the real data.** No dataset, no Kaggle account, no leaderboard access from here. Every
  fold-0 number in `ANALYSIS.md` is quoted from the repo's logs, not reproduced.
- **No changes to `student_resource/`**, to the submission writers, or to the one-to-one rule.
- **No country, region or geography feature anywhere**, no external data, no new dependency, no GPL.
- **No rule-tuning for France.** The French legal forms are already handled by the normaliser; the two things
  that would actually help France (a target-encoding vocabulary fitted beyond the 17 benchmark regions, and
  self-training on high-confidence test pairs) are written up in `ANALYSIS.md` §3.6 with their risks.
