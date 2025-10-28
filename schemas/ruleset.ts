import { z } from 'zod';

export const RuleSetSchema = z.object({
  id: z.int().optional(),
  readableBy: z.array(z.uuid()),
  writeableBy: z.array(z.uuid()),
  name: z.string(),
  type: z.enum(['remote', 'inline']),
  format: z.string().nullable(),
  content: z.string(),
});

export type RuleSet = z.infer<typeof RuleSetSchema>;
