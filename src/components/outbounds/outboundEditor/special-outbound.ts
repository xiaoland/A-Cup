import { z } from 'zod';
import { OutboundSchema } from '../../../../schemas/outbound';

const SpecialOutboundBaseSchema = OutboundSchema.pick({
  id: true,
  readableBy: true,
  writeableBy: true,
  name: true,
  region: true,
  provider: true,
});

export const SelectorOutboundSchema = SpecialOutboundBaseSchema.extend({
  type: z.literal('selector'),
  outbounds: z.array(z.string()),
  default: z.string().optional(),
  interrupt_exist_connections: z.boolean().optional(),
});

export const UrlTestOutboundSchema = SpecialOutboundBaseSchema.extend({
  type: z.literal('urltest'),
  outbounds: z.array(z.string()),
  url: z.string().optional(),
  interval: z.string().optional(),
  tolerance: z.number().int().optional(),
  idle_timeout: z.string().optional(),
  interrupt_exist_connections: z.boolean().optional(),
});

export const DirectOutboundSchema = SpecialOutboundBaseSchema.extend({
  type: z.literal('direct'),
  override_address: z.string().optional(),
  override_port: z.number().int().optional(),
});
