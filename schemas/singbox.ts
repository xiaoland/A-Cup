import { z } from 'zod';
import { DnsSchema } from './dns';
import { InboundSchema } from './inbound';
import { RouteSchema } from './route';

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
