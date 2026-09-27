Simulated 150,000 S1 entities (delta 3.6, decoys ~Poisson(1.5), blocking retention 0.98); 4.89 kept candidates and 3.462 true matches per S1.

| pair model | decoder | F0.5 | delta | precision | recall | pred/S1 | % empty | config |
|---|---|---|---|---|---|---|---|---|
| pair | threshold | 0.9694 | -0.0004 | 0.986 | 0.944 | 3.30 | 5.81 | {"t_accept":0.725,"t_keep":0.775} |
| pair | indep_h | 0.9698 | +0.0000 | 0.985 | 0.946 | 3.31 | 5.70 | {"temperature":0.85,"miss":0.05} |
| pair | lam_prior_h | 0.9698 | -0.0001 | 0.987 | 0.942 | 3.27 | 5.79 | {"temperature":0.7,"miss":0.05,"alpha":0.5,"target":"prior_x_h"} |
| pair | lam_count_50 | 0.9692 | -0.0006 | 0.985 | 0.943 | 3.28 | 5.52 | {"temperature":0.7,"miss":0.015,"alpha":0.75,"target":"half_exact"} |
| pair | lam_count_exact | 0.9700 | +0.0001 | 0.986 | 0.945 | 3.30 | 5.71 | {"temperature":0.85,"miss":0.015,"alpha":1.0,"target":"exact"} |
| pair | oracle | 0.9919 | +0.0221 | 1.000 | 0.975 | 3.37 | 5.75 |  |
| group | threshold | 0.9687 | -0.0012 | 0.983 | 0.952 | 3.34 | 5.94 | {"t_accept":0.65,"t_keep":0.65} |
| group | indep_h | 0.9700 | +0.0000 | 0.985 | 0.947 | 3.31 | 5.72 | {"temperature":0.85,"miss":0.0} |
| group | lam_prior_h | 0.9696 | -0.0003 | 0.985 | 0.947 | 3.31 | 5.87 | {"temperature":0.7,"miss":0.03,"alpha":0.25,"target":"prior_x_h"} |
| group | lam_count_50 | 0.9699 | -0.0000 | 0.985 | 0.946 | 3.30 | 5.72 | {"temperature":0.7,"miss":0.0,"alpha":0.5,"target":"half_exact"} |
| group | lam_count_exact | 0.9700 | +0.0000 | 0.985 | 0.946 | 3.30 | 5.73 | {"temperature":0.85,"miss":0.0,"alpha":0.75,"target":"exact"} |
| group | oracle | 0.9919 | +0.0220 | 1.000 | 0.975 | 3.37 | 5.75 |  |
