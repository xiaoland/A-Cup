import { z } from 'zod'
import { InboundSchema } from '@/components/inbounds/inbound/schema'
import { OutboundSchema } from '@/components/profile/profileEditor/schema'
import { RouteSchema } from './route'
import { dnsSchema } from './dns'

export const SingboxProfileSchema = z.object({
  log: z.any().optional(),
  dns: dnsSchema.optional(),
  ntp: z.any().optional(),
  certificate: z.any().optional(),
  endpoints: z.any().optional(),
  inbounds: z.array(InboundSchema).optional(),
  outbounds: z.array(OutboundSchema).optional(),
  route: RouteSchema.optional(),
  services: z.any().optional(),
  experimental: z.any().optional(),
})

export type SingboxProfile = z.infer<typeof SingboxProfileSchema>