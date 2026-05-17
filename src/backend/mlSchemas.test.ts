import test from "node:test";
import assert from "node:assert/strict";

import { mlPredictSchema } from "./mlSchemas";

test("mlPredictSchema accepts numeric inference payload", () => {
  const parsed = mlPredictSchema.parse({
    weight: 22.5,
    length: 51.2,
    thickness: 7.8,
    temperature: 69.1,
  });

  assert.equal(parsed.length, 51.2);
});

test("mlPredictSchema rejects non-finite values", () => {
  assert.throws(
    () =>
      mlPredictSchema.parse({
        weight: Infinity,
        length: 51.2,
        thickness: 7.8,
        temperature: 69.1,
      }),
    /Invalid input/i,
  );
});
