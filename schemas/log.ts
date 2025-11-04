import { z } from 'zod';

export const LogSchema = z.object({
  level: z.string().optional(),
  timestamp: z.boolean().optional(),
  output: z.string().optional(),
});

export type Log = z.infer<typeof LogSchema>;