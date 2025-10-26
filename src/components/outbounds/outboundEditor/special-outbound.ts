import { z } from 'zod';
import { BaseOutboundSchema } from '../../../../schemas/outbound';

const SpecialOutboundBaseSchema = BaseOutboundSchema.pick({
  id: true,
  readableBy: true,
  writeableBy: true,
  name: true,
  region: true,
  provider: true,
});

export const SelectorOutboundSchema = SpecialOutboundBaseSchema.extend({
  type: z.literal('selector'),
  outbounds: z.array(z.string()).default([]),
  default: z.string().default(''),
  interrupt_exist_connections: z.boolean().optional(),
});

export const UrlTestOutboundSchema = SpecialOutboundBaseSchema.extend({
  type: z.literal('urltest'),
  outbounds: z.array(z.string()).default([]),
  url: z.string().default('https://www.gstatic.com/generate_204'),
  interval: z.string().default('3m'),
  tolerance: z.number().int().optional(),
  idle_timeout: z.string().optional(),
  interrupt_exist_connections: z.boolean().optional(),
});

export const DirectOutboundSchema = SpecialOutboundBaseSchema.extend({
  type: z.literal('direct'),
  override_address: z.string().optional(),
  override_port: z.number().int().optional(),
});
