import { z } from "zod";

export const explainSchema = z.object({
  inputs: z.object({
    weight: z.number().finite(),
    length: z.number().finite(),
    thickness: z.number().finite(),
    temperature: z.number().finite(),
  }),
  prob: z.number().min(0).max(1),
  isDefect: z.boolean(),
});

export const quadrantSchema = z.object({
  highRiskProducts: z.array(z.string().min(1)).max(50),
});

export const executiveSchema = z.object({
  totalRev: z.number().finite(),
  defectRate: z.number().finite(),
  modelAccuracy: z.number().finite(),
});

export const copilotSchema = z.object({
  userMessage: z.string().min(1).max(2000),
  salesCount: z.number().int().nonnegative(),
  qualityCount: z.number().int().nonnegative(),
});
