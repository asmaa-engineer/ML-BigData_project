from __future__ import annotations

import json
import sys
from pathlib import Path

import joblib
import pandas as pd


ROOT = Path(__file__).resolve().parent
MODEL_PATH = ROOT / "artifacts" / "defect_random_forest.joblib"
REPORT_PATH = ROOT / "artifacts" / "evaluation_report.json"


def main() -> None:
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model artifact not found at {MODEL_PATH}. Run train_model.py first.")

    payload = json.loads(sys.stdin.read())
    model = joblib.load(MODEL_PATH)
    input_frame = pd.DataFrame(
        [
            {
                "product_id": payload.get("productId", "PRD-001"),
                "line_id": payload.get("lineId", "Line Alpha"),
                "weight": payload["weight"],
                "length": payload["length"],
                "thickness": payload["thickness"],
                "temperature": payload["temperature"],
                "vibration": payload.get("vibration", 3.5),
                "humidity": payload.get("humidity", 45.0),
                "shift": payload.get("shift", 1),
            }
        ]
    )

    probability = float(model.predict_proba(input_frame)[0][1])
    threshold = 0.5

    if REPORT_PATH.exists():
        report = json.loads(REPORT_PATH.read_text(encoding="utf-8"))
        threshold = float(report.get("threshold", 0.5))

    result = {
        "probability": probability,
        "isDefect": probability >= threshold,
        "threshold": threshold,
        "modelSource": "random_forest_artifact",
    }
    print(json.dumps(result))


if __name__ == "__main__":
    main()
