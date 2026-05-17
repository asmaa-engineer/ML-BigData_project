import test from "node:test";
import assert from "node:assert/strict";

import {
  copilotSchema,
  executiveSchema,
  explainSchema,
  quadrantSchema,
} from "./aiSchemas";

test("explainSchema accepts valid model explanation payload", () => {
  const parsed = explainSchema.parse({
    inputs: {
      weight: 25,
      length: 50,
      thickness: 8,
      temperature: 70,
    },
    prob: 0.42,
    isDefect: true,
  });

  assert.equal(parsed.prob, 0.42);
  assert.equal(parsed.isDefect, true);
});

test("quadrantSchema rejects empty product names", () => {
  assert.throws(
    () =>
      quadrantSchema.parse({
        highRiskProducts: ["", "Product 1"],
      }),
    /Too small/i,
  );
});

test("executiveSchema enforces bounded numeric payloads", () => {
  const parsed = executiveSchema.parse({
    totalRev: 15200,
    defectRate: 11.3,
    modelAccuracy: 87.4,
  });

  assert.equal(parsed.modelAccuracy, 87.4);
});

test("copilotSchema rejects oversized user messages", () => {
  assert.throws(
    () =>
      copilotSchema.parse({
        userMessage: "x".repeat(2001),
        salesCount: 12,
        qualityCount: 9,
      }),
    /Too big/i,
  );
});
