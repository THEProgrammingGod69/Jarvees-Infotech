Simulated 60,000 S1 entities, 5 folds (11,983 in the gate fold); 4.889 kept candidates and 3.463 true matches per S1, 5.61% singletons.
Count model OOF: multi-logloss 0.54966, top-1 0.80626, mean predicted count 3.4537 vs actual 3.4584.

| decoder | OOF F0.5 | gate F0.5 | delta | precision | recall | pred/S1 | % empty | singleton F0.5 | config |
|---|---|---|---|---|---|---|---|---|---|
| threshold | 0.96924 | 0.96891 | -0.00018 | 0.986 | 0.945 | 3.33 | 5.72 | 0.970 | {"t_accept":0.7,"t_keep":0.7} |
| indep_hasmatch | 0.96986 | 0.96908 | +0.00000 | 0.984 | 0.945 | 3.33 | 5.42 | 0.947 | {"temperature":0.85,"miss":0.05} |
| count_decoder | 0.96999 | 0.96902 | -0.00006 | 0.985 | 0.943 | 3.31 | 5.37 | 0.941 | {"temperature":0.85,"miss":0.05,"alpha":0.5,"beta":0.25,"tau":1.0} |
| count_decoder_prior_only | 0.96935 | 0.96904 | -0.00005 | 0.987 | 0.938 | 3.29 | 5.58 | 0.961 | {"temperature":0.85,"miss":0.0,"alpha":0.25,"target":"prior_x_h"} |
