# Amazon ML Challenge 2026 — accuracy analysis and the moves that are left

Target repository: [`ambekararya2005/Amazon-ML-Challenge-Competition-`](https://github.com/ambekararya2005/Amazon-ML-Challenge-Competition-)
(read at commit `ff25b6f`). Task: business entity resolution — for every Source-1 entity find all matching
Source-2/3 records. Metric: macro F0.5 per S1 entity, singletons included, precision weighted 2× over recall.

Best submission so far: **#4 (v4-safe), public LB 0.945**, fold-0 gate 0.9719.

Everything below is derived from the repository's own logs (`logs/model_v4_report.md`,
`logs/fn_buckets_v4.json`, `logs/test_gap_v4.json`, `logs/experiments.md`, `logs/submissions.md`,
`student_resource/eda_report.txt`). The competition data is not in the repo (it is git-ignored), so no number
here comes from re-running the pipeline. Where I state a *measured* result it comes from the simulator in
`sim/`, which reproduces the published fold-0 operating point, and I say which experiment produced it.

---

## 1. What the pipeline already does well

Nothing in the modelling stack is naive, and the obvious wins are taken:

- **Blocking** (v4): pass A (address keys) + pass C (char 4-gram cosine) + pass D (rarest name token), a
  cross-script dictionary mined from train true pairs, adaptive top-k. Benchmark recall 0.9806.
- **Pairs**: 38 base features + v3 (tagged street/floor/postal numbers, extra-word target encoding, group
  ranks within the S1's claimants, near-twin features against the top-8 claimants).
- **Two-stage LightGBM**: stage 1 on pair features, stage 2 on stage-1 group aggregates — the right shape for
  a problem whose decision is "which S1 does this record belong to, and how many does that S1 have".
- **Decision layer**: one-to-one per query (correct — zero S2/S3 records link to more than one S1), an
  S1-level has-match model, and an **exact expected-F0.5 set decoder** rather than a tuned threshold.
- **Discipline**: a geo-dense benchmark built after the first validation split under-represented decoys
  (LB 0.636 vs local 0.964), fold 0 frozen as the gate since, an error budget per submission, post-hoc audits
  of every upload, and negative results recorded rather than quietly dropped.

The remaining accuracy is not in "add a model". It is in four specific places, and — this is the main finding
below — the decision layer is **not** one of them, even though the repo's own error split makes it look like
the biggest one.

---

## 2. The accuracy ledger

### 2.1 Fold-0 error budget (v4, points of macro F0.5 lost; total 0.0281)

| loss | points | share | what it is |
|---|---|---|---|
| FN scoring / decoder | **0.0119** | 42% | the true pair is in the candidate set but not predicted |
| FN blocking | 0.0073 | 26% | the true pair never reaches the model |
| FP decoy | 0.0037 | 13% | a predicted record matches nobody |
| FP other | 0.0028 | 10% | a predicted record belongs to a different S1 |
| singleton predicted non-empty | 0.0024 | 9% | a true singleton got a prediction |

`logs/fn_buckets_v4.json` splits the biggest line:

- **0.0096 — bucket (a)**: the query's argmax *was* the right S1, the one-to-one rule kept the pair, and the
  **decoder did not select it**. 13,717 pairs, p2 median 0.531, 71% between 0.3 and 0.8, **none above 0.8**.
- 0.0023 — bucket (b2): the argmax was another S1 and nobody selected it (p2 median 0.06).
- 0.0001 — bucket (b1): negligible.

The natural reading of bucket (a) is "the decoder is leaving 0.0096 on the table". **That reading is wrong**,
and §4 measures why: at this operating point an exact expected-F0.5 decoder is already within 0.000–0.001 of
the best any decoder can do *with these probabilities*. Bucket (a) is not a decoder defect — it is the price
of p2 sitting at 0.53 on pairs that are actually true. It is a **feature, data and capacity** problem wearing
a decoder's clothes.

### 2.2 The leaderboard gap

| submission | fold 0 | public LB | gap |
|---|---|---|---|
| #2 (rule scorer v2) | 0.8230 | 0.829 | +0.006 |
| #3 (v3 model) | 0.9652 | 0.941 | −0.024 |
| #4 (v4-safe) | 0.9719 | 0.945 | −0.027 |
| #5 (full retrain) | — | 0.944 | — |

The gap appeared with the LightGBM models and is stable at about −0.025. `logs/test_gap_v4.json` locates part
of it: the share of queries whose best probability sits in the uncertain 0.3–0.7 band is 2.5% on fold-0 US and
3.3% on fold-0 India, but **3.9% on test US** and **5.0% on test France**. Test US is not in the benchmark's
13 US regions, and it is already harder than fold-0 US — so the gap is not only France. It is regional
coverage, and it is **larger than every fold-0 improvement on this list put together**.

### 2.3 How little labelled data the model actually sees

| | S1 entities | share of train |
|---|---|---|
| train S1 | 2,206,821 | 100% |
| geo-dense benchmark (`SAMPLE_SHARE = 0.20`, 17 regions: 4 India + 13 US) | 535,608 | 24% |
| benchmark folds 1–4 (training + tuning) | ≈ 428,000 | 19% |
| **one CV fold model** (leave-one-fold-out over folds 1–4) | ≈ **321,000** | **14.5%** |

The shipped submission (#4) is the mean of four models, each fitted on ~14.5% of the labelled S1 entities and
on **17 regions of 2 countries**, then applied to 1.73M test S1 including 259k in a country with no labels at
all. Full-train labels exist for all 2.2M S1 and 7.64M true pairs. The benchmark's *density* design is right —
it is what caught the decoy problem after submission #1 — but its *breadth* was never the thing being traded
off, and breadth is what the test set asks for.

### 2.4 A measurement problem sitting under every decision

The gate is fold 0 = 3–4 regions. Region heterogeneity dwarfs sampling noise: v3 → v4 moved fold-0 US by
**+0.0001** and fold-0 India by **+0.0152**. With ~126k S1 in fold 0 the standard error of macro F0.5 is
≈0.0004, so statistical noise is not the problem — *which regions landed in fold 0* is. Every remaining lever
is worth 0.002–0.015, i.e. inside the region-to-region spread of the gate.

**Do this first, it costs one scoring pass:** evaluate with 5-fold cross-fitting over all five benchmark folds
— each fold scored by the models that did not see it — and report the per-region spread next to the mean.
That is 5× the evaluation data and it makes a +0.003 result legible instead of a coin flip. Keep fold 0 as the
untouched gate for the final call, but stop deciding from it alone.

---

## 3. The levers, ranked

### 3.1 Train breadth: more regions, same row budget — the biggest lever

**Evidence.** §2.2 (test US is harder than fold-0 US, France harder still) and §2.3 (17 regions, 14.5% of the
labelled S1 per model).

**Change.** Keep the geo-dense construction — it is what makes decoys realistic — but spend the row budget on
*more regions with fewer S1 each* instead of *all S1 of a few regions*. Two knobs in `src/benchmark.py`:

- raise `SAMPLE_SHARE` (0.20 → 0.45–0.60) and cap the S1 per region (a new `REGION_CAP`, e.g. 20k), keeping
  **all** S2/S3 records mapped to a sampled region so the decoy density per kept S1 is unchanged;
- deal regions into folds by size-balanced round-robin rather than plain hash order, so each fold holds a
  comparable number of S1 *and* of regions — which also fixes §2.4 at the source.

The fold-0 number may go *down* while the LB goes up (fold 0 acquires harder neighbours). Judge it on the
cross-fitted estimate, not on fold 0 alone.

**Cost.** The expensive one: re-block + re-featurise + retrain at 2–3× the current row count (pass C
dominates — the tuning log projects ~145 min per country per kernel at the current width).
**Expected.** 0.005–0.015 of the LB gap. This is an estimate, not a measurement, and it is the only lever
aimed at the gap rather than at fold 0.

**Cheap partial version, do it regardless (CPU-minutes).** Refit the **extra-word target-encoding vocabulary**
on every labelled pair available (`cache/cand` train/validation candidates), not just the 17 benchmark
regions. Today an extra word absent from those regions — most French decoy markers — falls back to the global
prior, so France gets the least out of the feature that was built specifically to catch siblings.

### 3.2 The features the error log asks for — implemented here

`logs/model_v4_errors.txt` names its own remaining error modes. `src/features_v5.py` adds one family per item:

| family | what it fixes | why it is missing today |
|---|---|---|
| `lf_*` legal-form agreement | "decoys differing only by a legal form (… Public Limited)" | `legal_form` is extracted per record and **never compared**; legal words are stripped from `name_core`, so *Acme Private Limited* and *Acme Public Limited* are identical on **every** name feature the model sees |
| `nseq_*` number sequences | "sibling sub-numbers (12-1-331/C/8 vs /C/1)" | normalisation drops `-` and `/`, so the compound number survives only as the ordered `numbers` list; the existing street-number features are set-based and cannot see a differing tail |
| `idf_*` token rarity | name-only queries (empty address) | there is **no rarity signal anywhere** in the current features: sharing "enterprises" counts as much as sharing a rare surname. Document frequencies are counted on the partition's own records — no external data |
| `xs_*` cross-source p1 | the dropped "Step 2" | a true match usually has a partner record in the *other* source with a high p1; a decoy is more often alone. Text-only versions exist (`tw_*`, `g_same_src`); the p1 version does not |

These attack the two lines the decoder cannot touch: FP decoy (0.0037) and the part of FN scoring that is
missing evidence rather than missing capacity. `lf_conflict` is the one I would bet on — a hard, cheap,
high-precision veto the model currently cannot express at all.

**Cost.** One CV retrain. The first three families are per-pair Python loops (~10% on the feature stage, and
they belong in the existing process pool — `v5_chunk` has the right signature); `xs_*` is group arithmetic at
stage-2 time, effectively free. **Expected.** 0.002–0.004.

### 3.3 Where stage-1 capacity is spent

Stage 1 trains on all ~14.5M benchmark pairs with binary log-loss and `NEG_KEEP` downsamples negatives
*uniformly*. But 95%+ of pairs are trivially separable and the entire decision lives in the band the FN bucket
sits in (p2 0.3–0.8, ~14% of kept pairs per `logs/test_gap_v4.json`).

1. **Hard-negative-focused sampling.** Keep every positive and every pair with `base_score >= CLAIM_MIN`;
   downsample only the rest, hard (0.2–0.3), with the inverse-probability weights that are already there to
   preserve calibration. Same rows, far more of them near the boundary — or the same boundary coverage at a
   third of the training time, which pays for items 2 and 3.
2. **Capacity + seed bagging** (the repo's own dropped "Step 5"): `learning_rate` 0.03, `num_leaves` 255,
   three seeds averaged. Typically +0.001–0.003, with variance reduction as a bonus.
3. **A ranking head.** The decisive quantities are ranks (`s1_rank` is 48% of stage-1 gain, `p1_q_margin` 26%
   of stage-2). Train one extra LightGBM with `objective="lambdarank"` grouped by `query_id` and feed its
   score into stage 2. Log-loss spends capacity on the easy mass; a pairwise objective spends it exactly where
   bucket (a) lives.

**Cost.** 1 is free (it saves time), 2 is ~3× a stage-1 CV run, 3 is one extra CV run.
**Expected.** 0.002–0.005 combined. Together with §3.2 this is the only route to bucket (a)'s 0.0096.

### 3.4 The decoder: a measured ceiling and a measured null — implemented here

This is where I started, on the strength of bucket (a), and the measurements moved it down the list. Both
results are worth having, because one of them is a *stop* signal that saves a Kaggle slot.

**The modelling flaw is real.** `src/decoder.py` maximises the exact expected F0.5 under **independent**
Bernoulli(p) labels, plus a Poisson term for blocking misses and an S1-level P(has any match) = h applied as
`Q = min(p / h, 1)`. Independence is the wrong prior: the match count per S1
(`student_resource/eda_report.txt`) is sharply peaked, and P(n = 1) is *lower* than P(n = 2) and P(n = 3):

| n | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8+ |
|---|---|---|---|---|---|---|---|---|---|
| share | 5.6% | 5.4% | 17.0% | 24.1% | 21.9% | 14.6% | 7.5% | 2.9% | 1.1% |

So "this S1 already has three confident matches" is evidence that a fourth candidate at p = 0.55 is real, and
the current decoder cannot express it: `h` shifts the mean of the count, never its shape.

**The fix is exact and cheap.** The decoder already builds the joint distribution of (true pairs inside the
prefix, true pairs outside it + lost in blocking). Its implied total-count distribution `P_model(n)` does not
depend on the prefix size, so multiplying that joint by `lam(n) = P_target(n) / P_model(n)` makes the
total-count marginal exactly `P_target` while leaving the conditional label structure untouched. It
self-normalises, and with `P_target = P_model` it reproduces the current table bit for bit — asserted by
`tests/test_count_decoder.py`. In code it is one extra factor inside one `einsum`.

**What it is worth** (`sim/`, calibrated to fold 0 — see §4; full tables in `results/`):

| information the decoder is given | macro F0.5 | vs today |
|---|---|---|
| its own has-match model (today) | 0.9702 | — |
| a *perfect* has-match model (the true singleton flag) | 0.9728 | +0.0026 |
| **the exact match count** | **0.9857** | **+0.0155** |
| every label (no decoder can beat this) | 0.9921 | +0.0221 |
| a count model **learned from the candidate scores** (top-1 0.81, mean count 3.454 vs 3.458 actual) | 0.9690 | **+0.0000** |

Read those four together:

- the count prior has real headroom — **+0.0155, which is 70% of the entire prefix-choice loss**;
- almost none of it is the singleton question (a perfect has-match model is worth only +0.0026, and theirs is
  already good: mean h 0.944 against a 94.4% non-singleton rate). The value is in *how many*, not *whether*;
- **a count model built from the candidate probabilities captures none of it**, however accurate — the decoder
  already extracts that information from the same probabilities.

So the gain exists only for count information the pair scores do not carry.

**So the shipped code asks that question directly.** `src/count_model.py` takes the score profile *and*
S1-side statistics that p2 cannot contain — how often the same name or address repeats (hubness), how much
text the record carries, non-Latin script, domain-style names, per-source candidate counts.
`src/model_lgb_v5.py --stage count` fits the model **twice**, with and without those, and prints how many nats
per S1 the S1-side features add over the score profile alone. That number decides the lever:

- ≈ 0 nats → the count is not predictable beyond p2 on this data, the OOF grid picks `alpha` ≈ 0, nothing
  changes, and you have spent 30 CPU-minutes to close the question.
- > 0.02 nats → there is count information outside the scores, and up to +0.0155 of headroom to convert.

**Cost.** ~30 CPU-minutes to fit + tune on the benchmark from `bench_preds.parquet`, ~10 minutes to rescore
test from the saved per-pair probabilities. **No re-blocking, no re-featurising, no pair-model retraining.**
**Risk.** Bounded by `alpha` (tuned on OOF folds 1–4, 0 = today's decoder exactly) and by `beta`/`tau` (blend
toward, and flatten toward, the global prior). The count model also *subsumes* the has-match model
(h = 1 − P(n = 0)), so the `p / h` rescaling can go either way in the same grid.
**Expected.** 0 to 0.004 on fold 0. I would run it because it is cheap and self-terminating, not because I
expect it to be the win. The ceiling says the prize is real (+0.0155); the rehearsal says you only collect it
with count evidence that is not already in p2.

### 3.5 Blocking recall (0.0073)

Two targeted passes rather than a wider pass C (which the tuning log shows is already at its time budget):

- **pass E keyed on (rarest name token × main street number)** for queries whose address is present but whose
  name is non-Latin or corrupted — the recorded miss pattern in `logs/blocking_misses.txt`;
- **adaptive top-k for name-only queries** (`addr_empty`), which are over-represented in both the FN buckets
  and the remaining errors: they need more candidates, not fewer.

**Cost.** High (test blocking is the 2–3 hour-per-country stage). **Expected.** 0.002–0.003. Do it last.

### 3.6 France and the unlabelled part of test

France is 259k S1 with **no training labels** and the most uncertain partition at query level (5.0% of queries
in the 0.3–0.7 band vs 2.5% on fold-0 US). In order of risk:

1. Refit the extra-word TE vocabulary on all available labelled pairs (§3.1, cheap version). France gains the
   most, because its decoy markers are the ones missing from the vocabulary.
2. **Self-training on test**: take France pairs with p2 ≥ 0.98 as positives and p2 ≤ 0.02 as negatives, add
   them to stage-1 training at weight 0.2–0.3, retrain, rescore. Legal under the rules — no external data, no
   extra labels, only the model's own output. Validate by checking fold 0 does not move; the France effect
   itself is unmeasurable before the leaderboard.
3. Nothing else. Do not hand-write French rules: `logs/test_gap_france_examples.txt` shows SARL / SASU / SCI /
   EI are already handled by the normaliser.

**Expected.** 0 to 0.01, the highest-variance item here. Ship it only with a fold-0 check and a fallback
submission ready.

---

## 4. What I measured, and what the measurement is worth

No data here, so I simulated the **decision layer** and calibrated it to the published operating point.
`sim/decoder_sim.py`:

- match counts per S1 drawn from the train histogram (`eda_report.txt`);
- each true match survives blocking + one-to-one with probability 0.98 (from the fold-0 blocking budget);
- decoys per S1 ~ Poisson(1.5), so kept candidates per S1 ≈ 4.9 (`test_gap_v4.json`: India 5.07, US 4.66);
- every candidate emits a Gaussian signal; the separation `delta` is fitted so that **the current decoder**
  lands on fold 0's numbers.

At `delta = 3.6` the simulated operating point matches the real one on every published statistic:

| | F0.5 | pred/S1 | % empty | precision | recall | kept cands/S1 |
|---|---|---|---|---|---|---|
| fold 0 (v4, real) | 0.9719 | 3.29 | 5.89 | 0.990 | 0.946 | 4.87 |
| simulator | 0.971 | 3.30 | 5.7 | 0.986 | 0.945 | 4.89 |

Three experiments run on it:

1. **`sim/decoder_sim.py`** — every decoder whose count information comes from the candidate scores: the best
   threshold rule, the current independent + h decoder, and the count decoder with the global prior, with a
   half-exact count distribution, and with the **exact Bayesian count posterior**. Spread: −0.0012 to +0.0001.
   Two pair-model qualities are simulated (p from the pair's own signal; p from all of the S1's signals, a
   stand-in for stage 2's group aggregates) and both behave the same.
2. **`sim/count_ceiling.py`** — the same decoder given information no model has: the true singleton flag, then
   the exact count, then every label. This is the table in §3.4. Knowing whether the S1 has any match at all
   is worth +0.0026; knowing the exact count is worth +0.0155; knowing everything is worth +0.0221. So the
   count carries 70% of the prefix-choice headroom and the singleton flag only 12% of it.
3. **`sim/pipeline_sim.py`** — the full proposal under the repo's own protocol: 5 folds, the count model *and*
   the has-match baseline both **learned** from `count_features`, every decoder setting tuned on OOF folds 1–4,
   fold 0 scored once. The learned count model reaches top-1 accuracy 0.81 with a mean predicted count of
   3.454 against an actual 3.458 — and still moves fold 0 by −0.00006.

**What this is evidence for:** the mechanism is exact and safe (`alpha` → 0 recovers today's decoder), the
prefix-choice headroom is 0.0221 of which the count is 0.0155, and a count model that only re-reads the
candidate scores gets none of it. That last point is what turned this from "the biggest lever" into "the
cheapest experiment", and it is why §3.1–3.3 are ranked above it.

**What it is not:** a leaderboard prediction. The simulator's signals are independent and exchangeable, while
real decoys are near-copies of the true siblings (`logs/experiments.md`: median name/address similarity
decoy ↔ closest sibling 0.78 / 0.88). Real p2 is also not a Bayes posterior, so a count model may correct
aggregation errors that the simulator's ideal probabilities do not have. Treat the ceiling as the order of
magnitude and gate on the real fold 0.

---

## 5. Run order

| # | lever | new compute | measure on | expect |
|---|---|---|---|---|
| 0 | cross-fitted evaluation over all 5 folds (§2.4) | one scoring pass | — | better decisions, no score |
| 1 | count model + count decoder (§3.4) | ~40 CPU-min, **no retrain** | fold 0 + cross-fit | 0–0.004, self-terminating |
| 2 | TE vocabulary on all labelled pairs (§3.1 cheap) | CPU-minutes | fold 0 + France stats | small, France-weighted |
| 3 | v5 features + hard-negative sampling (§3.2, §3.3.1) | one CV retrain | fold 0 + cross-fit | 0.002–0.005 |
| 4 | capacity + 3 seeds + ranking head (§3.3.2–3) | 3–4 CV retrains | cross-fit | 0.002–0.005 |
| 5 | **wider region sample (§3.1)** | full re-block + retrain | cross-fit, then LB | 0.005–0.015 on the gap |
| 6 | blocking passes (§3.5); France self-training (§3.6) | large | LB | 0.002–0.003; 0–0.01 |

Steps 0–4 fit in a day of CPU with no re-blocking. Step 5 is the one that needs the Kaggle budget and the one
aimed at the gap; if only one thing gets done, do step 5.

---

## 6. Constraints I kept

Checked against `CLAUDE.md` before writing anything:

- **No country feature.** Country partitions work only. The count model uses no country, no region and no
  geography; its features are score-profile shapes, per-source counts and S1 text statistics.
- **No external data, APIs, geocoders or downloaded dictionaries.** IDF is counted on the provided records;
  the count prior is the train label histogram.
- **Licences.** numpy / pandas / pyarrow / lightgbm / rapidfuzz only — already pinned in the repo's
  `requirements.txt`. No new dependency, nothing GPL.
- **One-to-one.** Unchanged: the decoder still runs after `best_per_query`, and `matches ⊆ candidates` still
  holds because the count decoder only ever selects a prefix of the kept pairs.
- **I/O.** No new writers. `--stage submit` emits the same per-country parts that
  `src/model_lgb.py --stage assemble` already validates (`\n` line endings, `assert_no_cr_file`, organiser
  validator).
- **Seeds fixed at 42, a docstring on every function, runtimes through `StageTimer`.**
- **Nothing under `student_resource/` touched.**

## 7. What would make me stop

- `--stage verify` fails: `alpha = 0` must reproduce the current decoder pair for pair. That means the wiring,
  not the idea, is wrong — fix it before reading any score.
- The `current` row of the report does not come out at fold-0 0.9719. Then the inputs are not the ones that
  produced submission #4 and the comparison is meaningless.
- The S1-side statistics add ≈ 0 nats over the score profile (§3.4). Then this lever is spent — stop, and move
  the effort to §3.1–3.3.
- Fold 0 improves but the cross-fitted estimate does not. That is a region artefact, not an improvement.
