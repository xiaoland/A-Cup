import { z } from 'zod'

export const RouteRuleSchema = z.object({
  action: z.enum(['accept', 'reject']),
  outbound: z.string().optional(),
  domain: z.string().optional(),
  domain_suffix: z.string().optional(),
  domain_keyword: z.string().optional(),
  domain_regex: z.string().optional(),
  rule_set: z.string().optional(),
})

export type RouteRule = z.infer<typeof RouteRuleSchema>