import json
import numpy as np

with open('experiments/research_novelty/metrics/phase5a_experiment_results.json') as f:
    d = json.load(f)

print("Policy Validation:")
for k, v in d['workstream_d_conformal']['policies'].items():
    cov = v['coverage_pct']
    n_tot = 3409
    se = np.sqrt(cov * (100 - cov) / n_tot)
    ci = (round(cov - 1.96 * se, 2), round(cov + 1.96 * se, 2))
    print(f"  {k:<20}: Coverage = {cov:5.2f}% (95% CI: [{ci[0]}%, {ci[1]}%]), Mean Width = {v['mean_width_t']:5.2f} t/ha, Winkler = {v['winkler_score']}")

print("\nPer Crop Statistical Breakdown:")
for c, v in d['workstream_d_conformal']['per_crop_breakdown'].items():
    n = v['n']
    c_cov = v['crop_cond_cov']
    s_cov = v['sacap_cov']
    c_se = np.sqrt(c_cov * (100 - c_cov) / n)
    s_se = np.sqrt(s_cov * (100 - s_cov) / n)
    c_ci = (round(max(0, c_cov - 1.96 * c_se), 1), round(min(100, c_cov + 1.96 * c_se), 1))
    s_ci = (round(max(0, s_cov - 1.96 * s_se), 1), round(min(100, s_cov + 1.96 * s_se), 1))
    print(f"  {c:<22} (N={n:3d}) | Cond: {c_cov:5.2f}% [{c_ci[0]}%, {c_ci[1]}%] (W={v['crop_cond_width']:5.2f}) | SACAP: {s_cov:5.2f}% [{s_ci[0]}%, {s_ci[1]}%] (W={v['sacap_width']:5.2f}) | Gain: {s_cov - c_cov:+5.2f}%")
