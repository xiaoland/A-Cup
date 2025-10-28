import { z } from 'zod';

export const SingBoxMultiplexSchema = z.object({
  enabled: z.boolean().optional(),
  protocol: z.enum(['smux', 'yamux', 'h2mux']).optional(),
  max_connections: z.int().optional(),
  min_streams: z.int().optional(),
  max_streams: z.int().optional(),
  padding: z.boolean().optional(),
});
