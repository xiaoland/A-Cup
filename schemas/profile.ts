import { z } from 'zod';

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  tags: z.array(z.string()),
  createdBy: z.string().uuid(),
  outbounds: z.array(z.number().int()),
  rule_sets: z.array(z.number().int()),
});

export type Profile = z.infer<typeof ProfileSchema>;
