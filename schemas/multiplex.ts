import { z } from 'zod';

export const SingBoxMultiplexSchema = z.object({
  enabled: z.boolean().optional(),
  protocol: z.enum(['smux', 'yamux', 'h2mux']).optional(),
  max_connections: z.number().int().optional(),
  min_streams: z.number().int().optional(),
  max_streams: z.number().int().optional(),
  padding: z.boolean().optional(),
});
