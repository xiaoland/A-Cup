import { z } from 'zod';

export const RuleSetSchema = z.object({
  id: z.number().int().optional(),
  readableBy: z.array(z.string().uuid()),
  writeableBy: z.array(z.string().uuid()),
  tag: z.string(),
  type: z.enum(['remote', 'inline']),
  format: z.string().nullable(),
  content: z.string(),
  download_detour: z.number().int(),
  update_interval: z.number().int(),
});

export type RuleSet = z.infer<typeof RuleSetSchema>;
