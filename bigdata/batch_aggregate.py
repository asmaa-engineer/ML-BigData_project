from __future__ import annotations

from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parent
INPUT_DATASET = ROOT / "output" / "quality_training_large.csv"
OUTPUT_DIR = ROOT / "output"
LINE_AGG_PATH = OUTPUT_DIR / "line_daily_aggregates.csv"
PRODUCT_AGG_PATH = OUTPUT_DIR / "product_risk_aggregates.csv"


def main() -> None:
    if not INPUT_DATASET.exists():
        raise FileNotFoundError(f"Expanded dataset missing at {INPUT_DATASET}. Run etl_expand_dataset.py first.")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    data = pd.read_csv(INPUT_DATASET)

    line_aggregates = (
        data.groupby(["line_id", "shift"], as_index=False)
        .agg(
            inspections=("event_id", "count"),
            avg_temperature=("temperature", "mean"),
            avg_vibration=("vibration", "mean"),
            defect_rate=("is_defect", "mean"),
        )
        .sort_values(["line_id", "shift"])
    )
    line_aggregates["defect_rate"] = line_aggregates["defect_rate"] * 100

    product_aggregates = (
        data.groupby(["product_id", "line_id"], as_index=False)
        .agg(
            inspections=("event_id", "count"),
            defect_rate=("is_defect", "mean"),
            avg_temperature=("temperature", "mean"),
        )
        .sort_values(["defect_rate", "inspections"], ascending=[False, False])
    )
    product_aggregates["defect_rate"] = product_aggregates["defect_rate"] * 100

    line_aggregates.to_csv(LINE_AGG_PATH, index=False)
    product_aggregates.to_csv(PRODUCT_AGG_PATH, index=False)

    print(f"Line aggregates written to {LINE_AGG_PATH}")
    print(f"Product aggregates written to {PRODUCT_AGG_PATH}")


if __name__ == "__main__":
    main()
