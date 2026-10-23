"""Workstream A: Comprehensive Dataset, Feature Pipeline, and Temporal Continuity Audit."""
import os
import json
import numpy as np
import pandas as pd

def audit_dataset():
    csv_path = "data/yield_df_1990_2024.csv"
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Missing {csv_path}")

    df = pd.read_csv(csv_path)
    if "Unnamed: 0" in df.columns:
        df = df.drop(columns=["Unnamed: 0"])
    df = df.drop_duplicates().reset_index(drop=True)

    print(f"Total Rows: {len(df)}")
    print(f"Columns: {list(df.columns)}")
    print(f"Year Range: {df['Year'].min()} - {df['Year'].max()}")
    print(f"Countries: {df['Area'].nunique()}, Crops: {df['Item'].nunique()}")

    # 1. Duplicates
    dup_keys = int(df.duplicated(subset=["Area", "Item", "Year"]).sum())
    print(f"Duplicate (Area, Item, Year) keys: {dup_keys}")

    # 2. Missingness
    missing = {k: int(v) for k, v in df.isnull().sum().to_dict().items()}
    print(f"Missing values: {missing}")

    # 3. Temporal variation of features per country
    print("\n--- Environmental Feature Temporal Variation ---")
    rain_std = df.groupby("Area")["average_rain_fall_mm_per_year"].std()
    temp_std = df.groupby("Area")["avg_temp"].std()
    pest_std = df.groupby("Area")["pesticides_tonnes"].std()

    rain_zero_var_countries = int((rain_std.fillna(0) == 0).sum())
    total_countries = int(df["Area"].nunique())
    print(f"Rainfall std within country across years: Mean std = {rain_std.mean():.4f}, Min = {rain_std.min():.4f}, Max = {rain_std.max():.4f}")
    print(f"Countries with ZERO rainfall variation across years: {rain_zero_var_countries} / {total_countries} ({(rain_zero_var_countries/total_countries)*100:.1f}%)")
    print(f"Temperature std within country across years: Mean std = {temp_std.mean():.4f}, Min = {temp_std.min():.4f}, Max = {temp_std.max():.4f}")
    print(f"Pesticides std within country across years: Mean std = {pest_std.mean():.4f}, Min = {pest_std.min():.4f}, Max = {pest_std.max():.4f}")

    # 4. Time series continuity for temporal DL (Area, Item)
    print("\n--- Time Series Continuity Analysis ---")
    series_groups = df.groupby(["Area", "Item"])
    total_series = len(series_groups)
    series_lengths = series_groups.size()

    continuous_series = 0
    max_streak_list = []
    gaps_list = []
    series_details = []

    for (area, item), group in series_groups:
        years = sorted(group["Year"].unique())
        n_years = len(years)
        diffs = np.diff(years)
        has_gaps = bool(any(d > 1 for d in diffs))
        if not has_gaps:
            continuous_series += 1

        streak = 1
        max_streak = 1
        for d in diffs:
            if d == 1:
                streak += 1
                max_streak = max(max_streak, streak)
            else:
                streak = 1

        max_streak_list.append(max_streak)
        gaps_list.append(has_gaps)
        series_details.append({
            "area": area,
            "crop": item,
            "n_observations": n_years,
            "min_year": int(years[0]),
            "max_year": int(years[-1]),
            "has_gaps": has_gaps,
            "max_continuous_streak": max_streak
        })

    print(f"Total (Area, Item) series: {total_series}")
    print(f"Series length: Min={series_lengths.min()}, Median={series_lengths.median()}, Mean={series_lengths.mean():.1f}, Max={series_lengths.max()}")
    print(f"Strictly continuous annual series (no gaps): {continuous_series} / {total_series} ({(continuous_series/total_series)*100:.1f}%)")
    print(f"Series with gaps: {sum(gaps_list)} / {total_series} ({(sum(gaps_list)/total_series)*100:.1f}%)")
    print(f"Mean max streak of consecutive years: {np.mean(max_streak_list):.1f} years")

    # 5. Row counts by Crop
    crop_counts = df["Item"].value_counts().to_dict()
    print("\n--- Row Counts by Crop ---")
    for c, cnt in crop_counts.items():
        print(f"  {c:<25}: {cnt} records")

    # 6. Chronological split counts (1990-2018 vs 2019-2024)
    train_calib_mask = df["Year"] <= 2018
    test_mask = df["Year"] >= 2019
    n_train_calib = int(train_calib_mask.sum())
    n_test = int(test_mask.sum())
    print(f"\nChronological Split: Pre-Test (1990-2018) = {n_train_calib}, Test (2019-2024) = {n_test}")

    # Save metrics
    metrics = {
        "dataset_filename": csv_path,
        "total_records": len(df),
        "columns": list(df.columns),
        "year_min": int(df["Year"].min()),
        "year_max": int(df["Year"].max()),
        "num_countries": total_countries,
        "num_crops": int(df["Item"].nunique()),
        "duplicate_keys": dup_keys,
        "missing_values": missing,
        "climate_variation": {
            "rainfall_std_mean": float(rain_std.mean()),
            "rainfall_zero_var_countries": rain_zero_var_countries,
            "is_rainfall_static_per_country": bool(rain_zero_var_countries == total_countries),
            "temp_std_mean": float(temp_std.mean()),
            "pest_std_mean": float(pest_std.mean())
        },
        "series_continuity": {
            "total_series": total_series,
            "strictly_continuous_count": continuous_series,
            "strictly_continuous_pct": float(continuous_series / total_series * 100.0),
            "series_with_gaps_count": int(sum(gaps_list)),
            "series_with_gaps_pct": float(sum(gaps_list) / total_series * 100.0),
            "mean_series_length": float(series_lengths.mean()),
            "median_series_length": float(series_lengths.median()),
            "min_series_length": int(series_lengths.min()),
            "max_series_length": int(series_lengths.max()),
            "mean_max_continuous_streak": float(np.mean(max_streak_list))
        },
        "crop_counts": {k: int(v) for k, v in crop_counts.items()},
        "splits": {
            "pre_test_1990_2018": n_train_calib,
            "held_out_test_2019_2024": n_test
        }
    }

    out_metrics_path = "experiments/research_novelty/metrics/data_audit_metrics.json"
    with open(out_metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    print(f"\nAudit complete. Saved to {out_metrics_path}")

if __name__ == "__main__":
    audit_dataset()
