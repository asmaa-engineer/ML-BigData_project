from __future__ import annotations

import csv
import math
import random
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
DATASET_PATH = DATA_DIR / "quality_training_dataset.csv"

PRODUCT_IDS = [f"PRD-{index:03d}" for index in range(1, 21)]
LINES = ["Line Alpha", "Line Beta", "Line Gamma"]


def sigmoid(value: float) -> float:
    return 1 / (1 + math.exp(-value))


def main() -> None:
    random.seed(42)
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    with DATASET_PATH.open("w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(
            [
                "product_id",
                "line_id",
                "weight",
                "length",
                "thickness",
                "temperature",
                "vibration",
                "humidity",
                "shift",
                "is_defect",
            ]
        )

        for _ in range(25000):
            product_id = random.choice(PRODUCT_IDS)
            line_id = random.choice(LINES)
            weight = round(random.uniform(12, 58), 3)
            length = round(random.uniform(15, 120), 3)
            thickness = round(random.uniform(2, 18), 3)
            temperature = round(random.uniform(20, 95), 3)
            vibration = round(random.uniform(0.5, 7.2), 3)
            humidity = round(random.uniform(20, 90), 3)
            shift = random.randint(1, 3)

            score = -3.0
            score += 0.11 * max(temperature - 68, 0)
            score += 0.48 * max(5.5 - thickness, 0)
            score += 0.06 * max(weight - 40, 0)
            score += 0.55 if line_id == "Line Gamma" else 0
            score += 0.28 if product_id in {"PRD-003", "PRD-007", "PRD-014"} else 0
            score += 0.14 * max(vibration - 4.6, 0)
            score += 0.025 * max(humidity - 60, 0)
            score += 0.15 if shift == 3 else 0
            probability = sigmoid(score)
            is_defect = 1 if random.random() < probability else 0

            writer.writerow(
                [
                    product_id,
                    line_id,
                    weight,
                    length,
                    thickness,
                    temperature,
                    vibration,
                    humidity,
                    shift,
                    is_defect,
                ]
            )

    print(f"Dataset written to {DATASET_PATH}")


if __name__ == "__main__":
    main()
