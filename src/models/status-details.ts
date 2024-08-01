import { z } from "zod";
import { statusSchema } from "./status.js";

export const statusDetailsSchema = z.object({
  status: statusSchema.optional(),
  score: z.number(),
  progress: z.number(),
  favorite: z.boolean(),
  startedAt: z.object({
    year: z.number(),
    month: z.number(),
    day: z.number()
  }).optional(),
  completedAt: z.object({
    year: z.number(),
    month: z.number(),
    day: z.number()
  }).optional()
});

export type StatusDetails = z.infer<typeof statusDetailsSchema>;