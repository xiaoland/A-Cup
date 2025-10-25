import { z } from 'zod';
import { DnsSchema } from './dns';

// Inbound Schema
const InboundSchema = z.object({
  type: z.string(),
  tag: z.string(),
  listen: z.string(),
  listen_port: z.number(),
});

// Route Rule Schema
const RouteRuleSchema = z.object({
  type: z.string(),
  outbound: z.string(),
});

// SingBox RuleSet Schema
const SingBoxRuleSetSchema = z.object({
  type: z.string(),
  tag: z.string(),
  format: z.string(),
  url: z.string(),
  download_detour: z.string(),
  update_interval: z.string(),
});

// Route Schema
const RouteSchema = z.object({
  rules: z.array(RouteRuleSchema),
  rule_set: z.array(SingBoxRuleSetSchema),
});

// SingBox Outbound Schema (Simplified for now)
const SingBoxOutboundSchema = z.object({
  type: z.string(),
  tag: z.string(),
});

// SingBoxProfile Schema
export const SingBoxProfileSchema = z.object({
  dns: DnsSchema,
  inbounds: z.array(InboundSchema),
  outbounds: z.array(SingBoxOutboundSchema),
  route: RouteSchema,
});

export type SingBoxProfile = z.infer<typeof SingBoxProfileSchema>;
