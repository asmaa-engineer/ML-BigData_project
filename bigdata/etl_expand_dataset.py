from __future__ import annotations

import math
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parent
SOURCE_DATASET = ROOT.parent / "ml" / "data" / "quality_training_dataset.csv"
OUTPUT_DIR = ROOT / "output"
OUTPUT_DATASET = OUTPUT_DIR / "quality_training_large.csv"


def main() -> None:
    if not SOURCE_DATASET.exists():
        raise FileNotFoundError(f"Source dataset missing at {SOURCE_DATASET}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    base = pd.read_csv(SOURCE_DATASET)

    partitions = []
    for index in range(40):
        chunk = base.copy()
        chunk["batch_partition"] = index
        chunk["temperature"] = chunk["temperature"] + (index % 5) * 0.6
        chunk["vibration"] = chunk["vibration"] + (index % 3) * 0.15
        chunk["event_id"] = [f"E-{index}-{row}" for row in range(len(chunk))]
        partitions.append(chunk)

    expanded = pd.concat(partitions, ignore_index=True)
    expanded.to_csv(OUTPUT_DATASET, index=False)

    print(f"Expanded dataset rows: {len(expanded)}")
    print(f"Written to {OUTPUT_DATASET}")


if __name__ == "__main__":
    main()
