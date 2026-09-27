# Handoff: drop these into the competition repo and run them

Unzip `amazon-ml-v5/` at the **root of the Amazon-ML-Challenge repo**. Every path it writes is a new file, so
nothing of yours is overwritten — checked against the repo at commit `ff25b6f`.

| path in the zip | what it is |
|---|---|
| `code/business_entity_resolution/src/count_decoder.py` | count-conditioned expected-F0.5 decoder; `alpha=0` reproduces `src/decoder.py` exactly |
| `code/business_entity_resolution/src/count_model.py` | per-S1 count model P(n matches \| the S1's scored candidates), plus the diagnostic that decides the lever |
| `code/business_entity_resolution/src/features_v5.py` | legal-form conflict, sibling sub-numbers, token rarity, cross-source p1 |
| `code/business_entity_resolution/src/model_lgb_v5.py` | the runner: stages `count` / `submit` / `verify` |
| `code/business_entity_resolution/src/reference_decoder.py` | verbatim copy of the current decoder (commit `ff25b6f`), for the equivalence tests only |
| `code/business_entity_resolution/tests/test_count_decoder.py` | 14 tests; three assert the new decoder matches the old one bit for bit |
| `code/business_entity_resolution/V5_HANDOFF.md` | this sheet, so it travels with the code |
| `code/business_entity_resolution/V5_ANALYSIS.md` | the reasoning: error ledger, ranked levers, measurements, stop conditions |
| `v5-evidence/` | self-contained development copy — the simulator, its results, and the tests for the standalone helpers. Nothing here goes into the pipeline; it is how the numbers below were produced |
| `READ-ME-FIRST.md` | the same sheet at the zip root (delete it after unzipping if you unzip in place) |

No new dependency: numpy, pandas, pyarrow, lightgbm and rapidfuzz are already in
`code/business_entity_resolution/requirements.txt`.

To check the evidence bundle on its own, from `v5-evidence/`: `python -m pytest tests -q` (44 tests).

---

## What this zip is not

It is **not** a submission you can upload. A competition upload is the ~350 MB package the repo already builds
(`dist/ENIGMA_submission.zip`: the code plus `output/matching_results.tsv` and `output/candidate_pairs.tsv`),
and those two TSVs can only be produced by running the pipeline over `student_resource/dataset/`, which is not
in the repo and was not available where this code was written. So this zip holds the **code changes and the
evidence**; the commands in step 4 below are what turn them into an upload on a machine that has the data.

Also: none of this has been run against the real data. Every fold-0 number quoted here is from the repo's own
logs, and every gain is either simulator-measured or labelled an estimate.

---

## Paste this into the new session

```text
We are improving the Amazon ML Challenge 2026 business entity-resolution pipeline in this repo (best
submission: public LB 0.945, fold-0 gate 0.9719). A previous analysis session produced four new modules and
three one-line integration edits, which are already in place under code/business_entity_resolution/ (from a
handoff zip). Read code/business_entity_resolution/ANALYSIS.md if you want the full reasoning.

Context you need. These are measured on a simulator calibrated to this repo's own published fold-0 operating
point (it reproduces F0.5 0.971 vs 0.9719, 3.30 predictions/S1 vs 3.29, 5.7% empty vs 5.89, precision 0.986
vs 0.990, recall 0.945 vs 0.946):

- logs/fn_buckets_v4.json blames 0.0096 of the 0.0281 fold-0 loss on the set decoder (bucket (a): the true
  pair was kept by the one-to-one rule and then not selected; p2 median 0.531, none above 0.8). That reading
  is wrong. An exact expected-F0.5 decoder is already within about 0.001 of the best achievable from those
  probabilities, so bucket (a) is a feature / data / capacity problem, not a decoder problem.
- Knowing an S1's exact match count would be worth +0.0155 macro F0.5, 70% of all the prefix-choice headroom
  (0.0221). A perfect has-match model is worth only +0.0026. A count model learned from the candidate scores
  is worth +0.0000, because the decoder already reads those scores.
- So the count decoder only pays if the S1-side statistics predict the match count beyond p2. The
  --stage count run measures exactly that and prints it in nats per S1.
- The -0.027 fold-0-to-leaderboard gap tracks regional coverage, not France alone: each shipped model saw
  14.5% of the labelled S1 across 17 regions of 2 countries, and the uncertain 0.3-0.7 probability band is
  2.5% on fold-0 US against 3.9% on test US and 5.0% on France.
- fold 0 is 3-4 regions, so its region spread exceeds every remaining improvement: v3 to v4 moved fold-0 US
  by +0.0001 and fold-0 India by +0.0152. Gate on cross-fitted scores over all five folds where you can.

Do this in order, from code/business_entity_resolution/:

1. python -m pytest tests/test_count_decoder.py -q     (14 tests)
   Three of them assert the new decoder reproduces src/decoder.py bit for bit: no target, target equal to its
   own implied count pmf, and alpha=0. If any of those three fail, stop and fix the wiring before reading any
   score.

2. FEATURE_VARIANT=v4 python -m src.model_lgb_v5 --stage verify
   alpha=0 must reproduce the current decoder pair for pair on the benchmark.

3. FEATURE_VARIANT=v4 python -m src.model_lgb_v5 --stage count
   Read the report in this order:
   (a) the `current` row must come out at fold-0 0.9719. If it does not, the inputs are not the ones that
       produced submission #4 and nothing else in the report means anything. Say so and stop.
   (b) the line "the S1-side statistics add N nats per S1 over the score profile alone". Below about 0.02
       nats the lever is spent: report that, do not ship it, and move to step 5.
   (c) only if the fold-0 delta is positive: --stage submit, then the repo's existing
       python -m src.model_lgb --stage assemble with PARTS_DIR and FINAL_SUBDIR set, then
       python -m src.check_submission.

4. Then the v5 features: make the three edits in the "Integration edits" section of
   code/business_entity_resolution/HANDOFF.md (features_v3.py TEXT_COLS, features_v3.py build_partition,
   model_lgb.py p1_aggregates and AGG1), rebuild the bench features, retrain, and check that lf_conflict,
   nseq_last_conflict and idf_extra_q_max appear in the stage-1 importance table. If they do not earn a place,
   say so rather than keeping them.

Constraints from CLAUDE.md that still apply: no country, region or geography as a model feature; no external
data; no new dependency; the one-to-one rule unchanged; matches must stay a subset of candidates; \n line
endings only; seeds fixed at 42; a docstring on every function; never modify anything under
student_resource/.
```

---

## Integration edits (needed only for the v5 features, not for the decoder)

**1. `src/features_v3.py`** — the text loader needs two more normalised columns:

```python
# before
TEXT_COLS = ["name_core", "addr_clean"]
# after
TEXT_COLS = ["name_core", "addr_clean", "legal_form", "numbers"]
```

**2. `src/features_v3.py::build_partition`** — add `from .features_v5 import add_v5_features, token_df` to the
imports, then:

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

For the 50M-pair test partition, put the three per-pair families in the existing process pool instead of the
main process — `v5_chunk` has the same signature shape as `_pair_worker`, so it slots into the
`pooled_map(pool, ...)` loop that is already there, and only `name_only_pair` (vectorised) stays outside.

**3. `src/model_lgb.py`** — cross-source agreement is a stage-2 feature, so it goes where the other p1
aggregates are built:

```python
from .features_v5 import V5_STAGE2_COLS, cross_source_p1_features

AGG1 = [...] + list(V5_STAGE2_COLS)          # so stage 2 uses them

def p1_aggregates(df, p1):
    ...                                       # unchanged body
    for k, v in cross_source_p1_features(s1, qid, p1).items():
        df[k] = v
```

---

## What produces an actual upload

On a machine that has `student_resource/dataset/`, from `code/business_entity_resolution/`:

```bash
export FEATURE_VARIANT=v4

# 1. the artefacts the decoder stage reads (skip whichever you already have)
python -m src.model_lgb --stage train                       # writes <output>/models_v4/bench_preds.parquet
SAVE_PAIRS=1 SUBMIT_PARTS=1 python -m src.model_lgb --stage submit

# 2. the new decoder: fit, tune on OOF folds 1-4, score fold 0 once
python -m src.model_lgb_v5 --stage verify
python -m src.model_lgb_v5 --stage count                    # ship only if fold 0 improves

# 3. rescore test from the saved per-pair probabilities and write the files
python -m src.model_lgb_v5 --stage submit                   # or SUBMIT_COUNTRY=France for one partition
export PARTS_DIR=<output>/submit_parts_v4_v5
export FINAL_SUBDIR=final_v5
python -m src.model_lgb --stage assemble                    # the repo's own writer + organiser validator
python -m src.check_submission --dir <output>/final_v5

# 4. package
python -m src.kaggle_runner.make_final_zip --validate       # whatever the repo's packaging entry point is
```

Step 2 needs no re-blocking, no re-featurising and no pair-model retraining — about 40 CPU-minutes. Step 3 is
about 10 minutes because it decodes saved probabilities rather than rescoring the pair model. The v5 features
(the three edits above) do need one full feature rebuild and CV retrain, so they are a separate, larger run.

---

## The numbers this all rests on

Measured on the calibrated simulator (`sim/`, output in `results/`):

| information the decoder is given | macro F0.5 | vs today |
|---|---|---|
| its own has-match model (today) | 0.9702 | — |
| a perfect has-match model (the true singleton flag) | 0.9728 | +0.0026 |
| **the exact match count** | **0.9857** | **+0.0155** |
| every label (nothing can beat this) | 0.9921 | +0.0221 |
| a count model learned from the candidate scores (top-1 0.81, well calibrated) | 0.9690 | **+0.0000** |

Ranked levers, and where the effort should go:

| # | lever | new compute | expected |
|---|---|---|---|
| 0 | cross-fitted evaluation over all 5 folds instead of fold 0 alone | one scoring pass | no score — but fold-0's region spread is ±0.015 |
| 1 | wider region sample (more regions, same row budget) | full re-block + retrain | 0.005–0.015, aimed at the −0.027 gap |
| 2 | v5 features (in this zip) | one CV retrain | 0.002–0.004 |
| 3 | hard-negative stage-1 sampling, capacity + 3 seeds, a lambdarank head | 1–4 CV retrains | 0.002–0.005 |
| 4 | count decoder (in this zip) | ~40 CPU-min | 0–0.004, and it closes the question either way |

`ANALYSIS.md` has the evidence for each row, the run order, and the stop conditions.
