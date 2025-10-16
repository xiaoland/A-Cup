import { z } from 'zod'
import { InboundSchema } from '@/components/inbounds/inbound/schema'
import { RouteSchema } from '@/schemas/route'
import { dnsSchema } from '@/schemas/dns'

export const OutboundSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  region: z.string().optional(),
  provider: z.string().optional(),
  tag: z.string().optional(),
  type: z.string(),
  server: z.string(),
  server_port: z.number(),
  credential: z.any(),
  transport: z.any().optional(),
  tls: z.any().optional(),
  mux: z.any().optional(),
  other: z.any().optional(),
  readable_by: z.array(z.number()).optional(),
  writable_by: z.array(z.number()).optional(),
  created_at: z.number().optional(),
  updated_at: z.number().optional(),
})

export const ProfileSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Name is required'),
  tags: z.array(z.string()),
  inbounds: z.array(InboundSchema),
  outbounds: z.array(z.string()),
  route: RouteSchema,
  dns: dnsSchema,
})

export type Profile = z.infer<typeof ProfileSchema>

export const defaultProfile = (): Profile => ({
  name: '',
  tags: [],
  inbounds: [],
  outbounds: [],
  route: {},
  dns: { servers: [] },
})