import { z } from 'zod';
import { DnsSchema } from './dns';
import { RouteSchema } from './route';

// Inbound Schema
const InboundSchema = z.object({
  type: z.string(),
  tag: z.string(),
  listen: z.string(),
  listen_port: z.number(),
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
