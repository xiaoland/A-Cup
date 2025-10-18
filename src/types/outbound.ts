import { z } from 'zod'
import type {
  ShadowsocksOutboundSchema,
  VmessOutboundSchema,
  VlessOutboundSchema,
  Hysteria2OutboundSchema,
  SelectorOutboundSchema,
  UrlTestOutboundSchema,
  OutboundSchema,
} from '@/schemas/outbound'

export type ShadowsocksOutbound = z.infer<typeof ShadowsocksOutboundSchema>
export type VmessOutbound = z.infer<typeof VmessOutboundSchema>
export type VlessOutbound = z.infer<typeof VlessOutboundSchema>
export type Hysteria2Outbound = z.infer<typeof Hysteria2OutboundSchema>
export type SelectorOutbound = z.infer<typeof SelectorOutboundSchema>
export type UrlTestOutbound = z.infer<typeof UrlTestOutboundSchema>

export type Outbound = z.infer<typeof OutboundSchema>