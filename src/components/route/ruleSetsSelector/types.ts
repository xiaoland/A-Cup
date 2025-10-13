import { z } from 'zod'

export const RuleSetSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.enum(['remote', 'inline']),
  format: z.enum(['source', 'binary']),
  content: z.string(),
})

export type RuleSet = z.infer<typeof RuleSetSchema>