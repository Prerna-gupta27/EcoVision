from __future__ import annotations

from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier


HERE = Path(__file__).resolve().parent
DATASET_PATH = HERE / "dataset" / "best_combo_dataset.csv"
MODEL_PATH = HERE / "aqi_model.pkl"


df = pd.read_csv(DATASET_PATH)

required_columns = ["aqi", "temperature", "humidity", "risk"]
missing = set(required_columns) - set(df.columns)
if missing:
    raise ValueError(
        f"Dataset is missing required columns: {sorted(missing)}. "
        f"Found columns: {list(df.columns)}"
    )

df = df[required_columns].copy()
for col in required_columns:
    df[col] = pd.to_numeric(df[col], errors="coerce")
df = df.dropna()

X = df.drop("risk", axis=1)
y = df["risk"].astype(int)

model = RandomForestClassifier(random_state=42)
model.fit(X, y)

joblib.dump(model, MODEL_PATH)

print(f"Model trained and saved successfully: {MODEL_PATH}")