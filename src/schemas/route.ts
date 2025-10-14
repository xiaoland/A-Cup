import { z } from 'zod';

// Schema for a single rule within a route
export const RouteRuleSchema = z.object({
  action: z.string().optional(), // 'proxy' or 'direct' or 'block'
  outbound: z.string().optional(), // outbound tag
  rule_set: z.array(z.number()).optional(),
  domain: z.array(z.string()).optional(),
  domain_suffix: z.array(z.string()).optional(),
  domain_keyword: z.array(z.string()).optional(),
  domain_regex: z.array(z.string()).optional(),
});

// Schema for the main route object
export const RouteSchema = z.object({
  rules: z.array(RouteRuleSchema).optional(),
  rule_set: z.array(z.number().int().positive()).optional(), // array of rule-set IDs
  final: z.string().optional(),
  auto_detect_interface: z.boolean().optional(),
  default_interface: z.string().optional(),
  default_mark: z.number().optional(),
  default_domain_resolver: z.string().optional(),
  default_network_strategy: z.string().optional(),
  default_network_type: z.string().optional(),
  default_fallback_network_type: z.string().optional(),
  default_fallback_delay: z.number().optional(),
  geoip: z.any().optional(),
  geosite: z.any().optional(),
});

// Schema for a rule set, used in the ruleSetEditor
export const RuleSetSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  type: z.enum(['inline', 'remote']),
  format: z.string().min(1),
  content: z.string().optional(),
  download_detour: z.string().optional(),
  update_interval: z.string().optional(),
});

export type Route = z.infer<typeof RouteSchema>;
export type RouteRule = z.infer<typeof RouteRuleSchema>;
export type RuleSet = z.infer<typeof RuleSetSchema>;