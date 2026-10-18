import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

df_raw = pd.read_csv("data/yield_df.csv")
print("1. Raw CSV shape:", df_raw.shape)
print("Columns in raw:", list(df_raw.columns))
print("Has 'Unnamed: 0':", "Unnamed: 0" in df_raw.columns)

# Drop Unnamed: 0
df_no_idx = df_raw.drop(columns=["Unnamed: 0"]) if "Unnamed: 0" in df_raw.columns else df_raw.copy()
print("Duplicates before dropping index column:", df_raw.duplicated().sum())
print("Duplicates after dropping index column:", df_no_idx.duplicated().sum())

df_clean = df_no_idx.drop_duplicates().reset_index(drop=True)
print("Clean shape:", df_clean.shape)

features = ["Area", "Item", "Year", "average_rain_fall_mm_per_year", "pesticides_tonnes", "avg_temp"]
target = "hg/ha_yield"
X = df_clean[features]
y = df_clean[target]

# Reproduce split
X_dev, X_test, y_dev, y_test = train_test_split(X, y, test_size=0.20, random_state=42)
X_train, X_calib, y_train, y_calib = train_test_split(X_dev, y_dev, test_size=0.20, random_state=42)

print(f"Set sizes: Train={len(X_train)}, Calib={len(X_calib)}, Test={len(X_test)}")

# Check index overlap
train_indices = set(X_train.index)
calib_indices = set(X_calib.index)
test_indices = set(X_test.index)

print("Index overlap Train & Calib:", len(train_indices.intersection(calib_indices)))
print("Index overlap Train & Test:", len(train_indices.intersection(test_indices)))
print("Index overlap Calib & Test:", len(calib_indices.intersection(test_indices)))

# Check semantic duplicate overlap between train and test across (Area, Item, Year)
train_combos = set(zip(X_train["Area"], X_train["Item"], X_train["Year"]))
calib_combos = set(zip(X_calib["Area"], X_calib["Item"], X_calib["Year"]))
test_combos = set(zip(X_test["Area"], X_test["Item"], X_test["Year"]))

print("Unique (Area, Item, Year) in clean dataset:", len(set(zip(df_clean["Area"], df_clean["Item"], df_clean["Year"]))))
print("Total rows in clean dataset:", len(df_clean))
if len(set(zip(df_clean["Area"], df_clean["Item"], df_clean["Year"]))) == len(df_clean):
    print("CRITICAL FINDING: Every (Area, Item, Year) tuple in clean dataset is STRICTLY UNIQUE!")
    print("Therefore, NO (Area, Item, Year) observation can ever exist in both Train and Test simultaneously!")
else:
    print("Repeated (Area, Item, Year) tuples exist:", len(df_clean) - len(set(zip(df_clean["Area"], df_clean["Item"], df_clean["Year"]))))
