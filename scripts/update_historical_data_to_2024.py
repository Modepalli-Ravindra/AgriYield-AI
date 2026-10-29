"""
Reproducible Historical Dataset Update & Aggregation Pipeline (1990-2024).

Ingests official UN FAOSTAT production (QCL) and pesticide use (RP) data,
preserves national long-term rainfall constants, aggregates temperatures
to annual country-level means, and generates the leakage-safe 1990-2024 dataset.

Output: data/yield_df_1990_2024.csv
Baseline preserved: data/yield_df.csv & data/yield_df_1990_2013_baseline.csv
"""
import os
import sys
import zipfile
import hashlib
import json
import time
from pathlib import Path
import pandas as pd
import numpy as np

# Ensure UTF-8 output encoding on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Root directory configuration
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
RAW_DIR.mkdir(parents=True, exist_ok=True)

BASELINE_CSV = DATA_DIR / "yield_df_1990_2013_baseline.csv"
ORIGINAL_CSV = DATA_DIR / "yield_df.csv"
OUTPUT_CSV = DATA_DIR / "yield_df_1990_2024.csv"
MANIFEST_JSON = DATA_DIR / "DATASET_1990_2024_MANIFEST.json"

# FAOSTAT Mapping Configuration
FAOSTAT_CROP_MAP = {
    "Maize (corn)": "Maize",
    "Potatoes": "Potatoes",
    "Rice": "Rice, paddy",
    "Sorghum": "Sorghum",
    "Soya beans": "Soybeans",
    "Wheat": "Wheat",
    "Cassava, fresh": "Cassava",
    "Sweet potatoes": "Sweet potatoes",
    "Yams": "Yams",
    "Plantains and cooking bananas": "Plantains and others"
}

FAOSTAT_COUNTRY_MAP = {
    223: "Turkey",
    150: "Netherlands",
    229: "United Kingdom"
}

def verify_baseline_preservation():
    """Verify that the baseline backup matches original yield_df.csv byte-for-byte."""
    if not ORIGINAL_CSV.exists():
        raise FileNotFoundError(f"Original dataset not found at {ORIGINAL_CSV}")
    if not BASELINE_CSV.exists():
        raise FileNotFoundError(f"Baseline backup not found at {BASELINE_CSV}")
    
    h_orig = hashlib.sha256(ORIGINAL_CSV.read_bytes()).hexdigest()
    h_base = hashlib.sha256(BASELINE_CSV.read_bytes()).hexdigest()
    if h_orig != h_base:
        raise ValueError("SHA-256 mismatch between original dataset and baseline backup!")
    print(f"[OK] Baseline preservation verified: SHA-256 = {h_orig}")
    return h_orig

def load_and_aggregate_historical_baseline():
    """Aggregate monthly-expanded historical records into single annual observations."""
    print("\n--- 1. Aggregating Historical Baseline (1990-2013) ---")
    df_raw = pd.read_csv(BASELINE_CSV)
    if "Unnamed: 0" in df_raw.columns:
        df_raw = df_raw.drop(columns=["Unnamed: 0"])
    
    clean_raw = df_raw.drop_duplicates()
    raw_count = len(df_raw)
    clean_count = len(clean_raw)
    print(f"  Raw records: {raw_count} | Deduplicated records: {clean_count}")
    
    # Aggregation to exact grain: 1 row per (Area, Item, Year)
    hist_agg = clean_raw.groupby(["Area", "Item", "Year"], as_index=False).agg({
        "hg/ha_yield": "first",
        "average_rain_fall_mm_per_year": "first",
        "pesticides_tonnes": "first",
        "avg_temp": "mean"
    })
    hist_agg["avg_temp"] = hist_agg["avg_temp"].round(2)
    hist_count = len(hist_agg)
    print(f"  Aggregated annual grain: {hist_count} unique (Area, Item, Year) observations")
    print(f"  Years present: {sorted(hist_agg['Year'].unique().tolist())}")
    print(f"  Countries: {hist_agg['Area'].nunique()} | Crops: {hist_agg['Item'].nunique()}")
    
    # Build national rainfall reference
    rainfall_ref = hist_agg.groupby("Area")["average_rain_fall_mm_per_year"].first().to_dict()
    return hist_agg, rainfall_ref

def compute_temperature_baselines(hist_agg):
    """Calibrate baseline temperatures using historical overlap with FAOSTAT temperature change."""
    print("\n--- 2. Calibrating Temperature Climatology from FAOSTAT Anomaly Data ---")
    temp_zip = RAW_DIR / "Environment_Temperature_change_E_All_Data_(Normalized).zip"
    with zipfile.ZipFile(temp_zip) as zf:
        fname = zf.namelist()[0]
        df_t = pd.read_csv(zf.open(fname), encoding="latin-1")
    
    df_t["Area"] = df_t["Area Code"].map(FAOSTAT_COUNTRY_MAP).fillna(df_t["Area"])
    df_t_met = df_t[(df_t["Months"] == "Meteorological year") & (df_t["Element"] == "Temperature change")]
    
    t_base_dict = {}
    for country in hist_agg["Area"].unique():
        c_hist = hist_agg[hist_agg["Area"] == country].groupby("Year")["avg_temp"].mean().reset_index()
        c_fao = df_t_met[df_t_met["Area"] == country][["Year", "Value"]]
        m = pd.merge(c_hist, c_fao, on="Year")
        if len(m) > 0:
            base_temp = (m["avg_temp"] - m["Value"]).mean()
            t_base_dict[country] = round(float(base_temp), 2)
        else:
            t_base_dict[country] = round(float(c_hist["avg_temp"].mean()), 2)
            
    t_anom_dict = df_t_met.set_index(["Area", "Year"])["Value"].to_dict()
    print(f"  Calibrated baseline temperatures for all {len(t_base_dict)} countries.")
    return t_base_dict, t_anom_dict

def load_pesticides_lookup():
    """Load official FAOSTAT agricultural pesticide use."""
    print("\n--- 3. Loading Official FAOSTAT Pesticides Use Archive ---")
    pest_zip = RAW_DIR / "Inputs_Pesticides_Use_E_All_Data_(Normalized).zip"
    with zipfile.ZipFile(pest_zip) as zf:
        fname = zf.namelist()[0]
        df_p = pd.read_csv(zf.open(fname), encoding="latin-1")
    
    df_p["Area"] = df_p["Area Code"].map(FAOSTAT_COUNTRY_MAP).fillna(df_p["Area"])
    df_p_sub = df_p[(df_p["Item"] == "Pesticides (total)") & (df_p["Element"] == "Agricultural Use")]
    pest_dict = df_p_sub.set_index(["Area", "Year"])["Value"].to_dict()
    print(f"  Loaded {len(pest_dict)} country-year pesticide records.")
    return pest_dict

def extract_verified_new_records(hist_agg, rainfall_ref, t_base_dict, t_anom_dict, pest_dict):
    """Extract verified crop yields for 2003 and 2014-2024 without synthetic imputation."""
    print("\n--- 4. Ingesting Official FAOSTAT Crop Yields (2003 & 2014-2024) ---")
    crops_zip = RAW_DIR / "Production_Crops_Livestock_E_All_Data_(Normalized).zip"
    with zipfile.ZipFile(crops_zip) as zf:
        fname = zf.namelist()[0]
        df_q = pd.read_csv(zf.open(fname), encoding="latin-1")
        
    df_q["Area"] = df_q["Area Code"].map(FAOSTAT_COUNTRY_MAP).fillna(df_q["Area"])
    df_q_sub = df_q[(df_q["Element"] == "Yield") & (df_q["Item"].isin(FAOSTAT_CROP_MAP.keys()))].copy()
    df_q_sub["TargetItem"] = df_q_sub["Item"].map(FAOSTAT_CROP_MAP)
    
    target_years = [2003] + list(range(2014, 2025))
    target_countries = set(hist_agg["Area"].unique())
    
    df_candidates = df_q_sub[
        df_q_sub["Year"].isin(target_years) & 
        df_q_sub["Area"].isin(target_countries)
    ]
    
    new_rows = []
    dropped_missing_pest = 0
    dropped_missing_temp = 0
    dropped_invalid_yield = 0
    
    for _, row in df_candidates.iterrows():
        c = row["Area"]
        item = row["TargetItem"]
        yr = int(row["Year"])
        yield_val = row["Value"]
        
        # Strict validation: No synthetic yield imputation
        if pd.isna(yield_val) or yield_val <= 0:
            dropped_invalid_yield += 1
            continue
            
        if (c, yr) not in pest_dict or pd.isna(pest_dict[(c, yr)]) or pest_dict[(c, yr)] < 0:
            dropped_missing_pest += 1
            continue
        pest_val = float(pest_dict[(c, yr)])
        
        if c not in t_base_dict or (c, yr) not in t_anom_dict or pd.isna(t_anom_dict[(c, yr)]):
            dropped_missing_temp += 1
            continue
        t_val = round(t_base_dict[c] + float(t_anom_dict[(c, yr)]), 2)
        
        rain_val = float(rainfall_ref[c])
        
        # Unit conversion: FAOSTAT QCL reports kg/ha -> 1 kg/ha = 10 hg/ha
        hg_ha_yield = round(float(yield_val) * 10.0, 1)
        
        new_rows.append({
            "Area": c,
            "Item": item,
            "Year": yr,
            "hg/ha_yield": hg_ha_yield,
            "average_rain_fall_mm_per_year": rain_val,
            "pesticides_tonnes": pest_val,
            "avg_temp": t_val
        })
        
    df_new = pd.DataFrame(new_rows)
    print(f"  Verified new observations added: {len(df_new)}")
    print(f"  Dropped due to missing pesticide report: {dropped_missing_pest}")
    print(f"  Dropped due to missing temperature report: {dropped_missing_temp}")
    print(f"  Dropped due to non-positive yield report: {dropped_invalid_yield}")
    print("  New observations by year:")
    for yr, cnt in df_new["Year"].value_counts().sort_index().items():
        print(f"    {yr}: {cnt} observations")
        
    return df_new

def compile_and_audit_dataset(hist_agg, df_new, orig_hash):
    """Concatenate, validate, sort, audit, and save data/yield_df_1990_2024.csv."""
    print("\n--- 5. Compiling & Auditing Final Dataset (1990-2024) ---")
    combined = pd.concat([hist_agg, df_new], ignore_index=True)
    
    # Sort chronologically and alphabetically
    combined = combined.sort_values(["Area", "Item", "Year"]).reset_index(drop=True)
    
    # Validation checks
    dups = combined.duplicated(subset=["Area", "Item", "Year"]).sum()
    nulls = combined.isnull().sum().to_dict()
    total_rows = len(combined)
    min_year = int(combined["Year"].min())
    max_year = int(combined["Year"].max())
    unique_years = sorted(combined["Year"].unique().tolist())
    unique_countries = int(combined["Area"].nunique())
    unique_crops = int(combined["Item"].nunique())
    
    if dups > 0:
        raise ValueError(f"Integrity check failed: {dups} duplicate (Area, Item, Year) keys detected!")
    if any(v > 0 for v in nulls.values()):
        raise ValueError(f"Integrity check failed: Null values detected: {nulls}")
        
    print(f"  [OK] Total rows: {total_rows}")
    print(f"  [OK] Year span: {min_year}-{max_year} ({len(unique_years)} continuous calendar years)")
    print(f"  [OK] Missing years in range: {set(range(min_year, max_year + 1)) - set(unique_years)}")
    print(f"  [OK] Duplicate keys: {dups}")
    print(f"  [OK] Null values across all columns: 0")
    print(f"  [OK] Countries: {unique_countries} | Crops: {unique_crops}")
    
    # Save final dataset
    combined.to_csv(OUTPUT_CSV, index=False)
    print(f"\n  [OK] Successfully generated: {OUTPUT_CSV}")
    
    # Compute output SHA-256
    out_hash = hashlib.sha256(OUTPUT_CSV.read_bytes()).hexdigest()
    
    # Generate Manifest & Audit Report
    manifest = {
        "dataset_name": "Terraflect Historical Crop Yield & Environmental Dataset (1990-2024)",
        "output_path": str(OUTPUT_CSV.relative_to(BASE_DIR)),
        "output_sha256": out_hash,
        "legacy_baseline_path": str(BASELINE_CSV.relative_to(BASE_DIR)),
        "legacy_baseline_sha256": orig_hash,
        "generation_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "grain": "Exactly one observation per (Area, Item, Year) tuple",
        "total_rows": total_rows,
        "historical_aggregated_rows_1990_2013": len(hist_agg),
        "verified_new_rows_2003_and_2014_2024": len(df_new),
        "year_range": [min_year, max_year],
        "total_continuous_years": len(unique_years),
        "unique_countries": unique_countries,
        "unique_crops": unique_crops,
        "crops_represented": sorted(combined["Item"].unique().tolist()),
        "columns": list(combined.columns),
        "summary_statistics": {
            "hg/ha_yield": {
                "min": float(combined["hg/ha_yield"].min()),
                "max": float(combined["hg/ha_yield"].max()),
                "mean": round(float(combined["hg/ha_yield"].mean()), 2)
            },
            "pesticides_tonnes": {
                "min": float(combined["pesticides_tonnes"].min()),
                "max": float(combined["pesticides_tonnes"].max()),
                "mean": round(float(combined["pesticides_tonnes"].mean()), 2)
            },
            "average_rain_fall_mm_per_year": {
                "min": float(combined["average_rain_fall_mm_per_year"].min()),
                "max": float(combined["average_rain_fall_mm_per_year"].max()),
                "mean": round(float(combined["average_rain_fall_mm_per_year"].mean()), 2)
            },
            "avg_temp": {
                "min": float(combined["avg_temp"].min()),
                "max": float(combined["avg_temp"].max()),
                "mean": round(float(combined["avg_temp"].mean()), 2)
            }
        },
        "sources": [
            {
                "domain": "UN FAOSTAT QCL (Crops and Livestock Products)",
                "url": "https://bulks-faostat.fao.org/production/Production_Crops_Livestock_E_All_Data_(Normalized).zip",
                "element": "Yield (Code 5419)",
                "source_unit": "kg/ha",
                "target_unit": "hg/ha (conversion factor 10.0)",
                "license": "CC-BY 3.0 IGO"
            },
            {
                "domain": "UN FAOSTAT RP (Inputs: Pesticides Use)",
                "url": "https://bulks-faostat.fao.org/production/Inputs_Pesticides_Use_E_All_Data_(Normalized).zip",
                "element": "Agricultural Use (Code 5157)",
                "item": "Pesticides (total)",
                "source_unit": "t (tonnes)",
                "target_unit": "tonnes (conversion factor 1.0)",
                "license": "CC-BY 3.0 IGO"
            },
            {
                "domain": "UN FAOSTAT ET (Temperature Change on Land)",
                "url": "https://bulks-faostat.fao.org/production/Environment_Temperature_change_E_All_Data_(Normalized).zip",
                "element": "Temperature change (Meteorological year)",
                "unit": "deg C anomaly relative to 1951-1980 climatology",
                "license": "CC-BY 3.0 IGO"
            },
            {
                "domain": "FAO AQUASTAT / World Bank (AG.LND.PRCP.MM)",
                "indicator": "Average precipitation in depth (mm per year)",
                "property": "National long-term climatological constant per country",
                "unit": "mm/year"
            }
        ]
    }
    
    with open(MANIFEST_JSON, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"  [OK] Manifest written to: {MANIFEST_JSON}")
    return combined, manifest

def main():
    print("=" * 80)
    print("TERRAFLECT: HISTORICAL DATASET UPDATE & AGGREGATION PIPELINE (1990-2024)")
    print("=" * 80)
    orig_hash = verify_baseline_preservation()
    hist_agg, rainfall_ref = load_and_aggregate_historical_baseline()
    t_base_dict, t_anom_dict = compute_temperature_baselines(hist_agg)
    pest_dict = load_pesticides_lookup()
    df_new = extract_verified_new_records(hist_agg, rainfall_ref, t_base_dict, t_anom_dict, pest_dict)
    combined, manifest = compile_and_audit_dataset(hist_agg, df_new, orig_hash)
    print("\n" + "=" * 80)
    print("DATASET GENERATION & AUDIT COMPLETED SUCCESSFULLY")
    print("=" * 80)

if __name__ == "__main__":
    main()
