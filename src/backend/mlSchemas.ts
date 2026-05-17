import { z } from "zod";

export const mlPredictSchema = z.object({
  weight: z.number().finite(),
  length: z.number().finite(),
  thickness: z.number().finite(),
  temperature: z.number().finite(),
});
