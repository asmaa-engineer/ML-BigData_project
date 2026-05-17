from __future__ import annotations

import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


ROOT = Path(__file__).resolve().parent
DATASET_PATH = ROOT / "data" / "quality_training_dataset.csv"
ARTIFACTS_DIR = ROOT / "artifacts"
MODEL_PATH = ARTIFACTS_DIR / "defect_random_forest.joblib"
REPORT_PATH = ARTIFACTS_DIR / "evaluation_report.json"

NUMERIC_FEATURES = ["weight", "length", "thickness", "temperature", "vibration", "humidity", "shift"]
CATEGORICAL_FEATURES = ["line_id", "product_id"]
TARGET = "is_defect"


def main() -> None:
    if not DATASET_PATH.exists():
      raise FileNotFoundError(f"Dataset not found at {DATASET_PATH}. Run generate_dataset.py first.")

    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

    dataset = pd.read_csv(DATASET_PATH)
    features = dataset[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
    target = dataset[TARGET]

    x_train, x_test, y_train, y_test = train_test_split(
        features,
        target,
        test_size=0.2,
        random_state=42,
        stratify=target,
    )

    numeric_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
        ]
    )
    categorical_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore")),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, NUMERIC_FEATURES),
            ("cat", categorical_transformer, CATEGORICAL_FEATURES),
        ]
    )

    model = RandomForestClassifier(
        n_estimators=180,
        max_depth=12,
        min_samples_split=6,
        min_samples_leaf=3,
        random_state=42,
        class_weight="balanced_subsample",
        n_jobs=-1,
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("model", model),
        ]
    )

    pipeline.fit(x_train, y_train)

    y_pred = pipeline.predict(x_test)
    y_prob = pipeline.predict_proba(x_test)[:, 1]

    report = {
        "model_name": "RandomForestClassifier",
        "dataset_path": str(DATASET_PATH),
        "features": NUMERIC_FEATURES + CATEGORICAL_FEATURES,
        "target": TARGET,
        "train_rows": int(len(x_train)),
        "test_rows": int(len(x_test)),
        "accuracy": round(float(accuracy_score(y_test, y_pred)) * 100, 4),
        "precision": round(float(precision_score(y_test, y_pred, zero_division=0)) * 100, 4),
        "recall": round(float(recall_score(y_test, y_pred, zero_division=0)) * 100, 4),
        "f1": round(float(f1_score(y_test, y_pred, zero_division=0)) * 100, 4),
        "roc_auc": round(float(roc_auc_score(y_test, y_prob)) * 100, 4),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
        "classification_report": classification_report(y_test, y_pred, zero_division=0, output_dict=True),
        "threshold": 0.5,
    }

    joblib.dump(pipeline, MODEL_PATH)
    REPORT_PATH.write_text(json.dumps(report, indent=2), encoding="utf-8")

    print(f"Model saved to {MODEL_PATH}")
    print(f"Report saved to {REPORT_PATH}")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
