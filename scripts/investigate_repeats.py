import pandas as pd
df_raw = pd.read_csv("data/yield_df.csv")
if "Unnamed: 0" in df_raw.columns:
    df_raw = df_raw.drop(columns=["Unnamed: 0"])
df_clean = df_raw.drop_duplicates().reset_index(drop=True)

repeats = df_clean[df_clean.duplicated(subset=["Area", "Item", "Year"], keep=False)].sort_values(["Area", "Item", "Year"])
print("Sample repeated (Area, Item, Year) tuples in clean dataset:")
print(repeats[["Area", "Item", "Year", "hg/ha_yield", "average_rain_fall_mm_per_year", "avg_temp"]].head(15))
