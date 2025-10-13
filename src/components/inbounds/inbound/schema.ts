import { z } from 'zod'

// Listen Fields shared by mixed and tun inbounds
export const ListenFieldsSchema = z
  .object({
    listen: z.string().optional(),
    listen_port: z.number().int().min(0).max(65535).optional(),
    bind_interface: z.string().optional(),
    routing_mark: z.union([z.number().int(), z.string()]).optional(),
    reuse_addr: z.boolean().optional(),
    netns: z.string().optional(),
    tcp_fast_open: z.boolean().optional(),
    tcp_multi_path: z.boolean().optional(),
    udp_fragment: z.boolean().optional(),
    udp_timeout: z.string().optional(),
    detour: z.string().optional(),
  })
  .partial()

// Mixed inbound schema
export const MixedInboundSchema = z
  .object({
    tag: z.string().min(1, { message: 'Tag is required' }),
    type: z.literal('mixed'),
    // Listen fields
    ...ListenFieldsSchema.shape,
    users: z
      .array(
        z.object({
          username: z.string().min(1),
          password: z.string().min(1),
        })
      )
      .optional(),
    set_system_proxy: z.boolean().optional(),
  })
  .strict()

// Tun inbound schema
export const TunInboundSchema = z
  .object({
    tag: z.string().min(1, { message: 'Tag is required' }),
    type: z.literal('tun'),
    interface_name: z.string().optional(),
    address: z.array(z.string()).optional(), // CIDRs
    mtu: z.number().int().optional(),
    auto_route: z.boolean().optional(),
    strict_route: z.boolean().optional(),
    iproute2_table_index: z.number().int().optional(),
    iproute2_rule_index: z.number().int().optional(),
    route_address: z.array(z.string()).optional(),
    route_exclude_address: z.array(z.string()).optional(),
    route_address_set: z.array(z.string()).optional(),
    route_exclude_address_set: z.array(z.string()).optional(),
    auto_redirect: z.boolean().optional(),
    auto_redirect_input_mark: z.string().optional(),
    auto_redirect_output_mark: z.string().optional(),
    loopback_address: z.array(z.string()).optional(),
    endpoint_independent_nat: z.boolean().optional(),
    udp_timeout: z.string().optional(),
    stack: z.enum(['system', 'gvisor', 'mixed']).optional(),
    include_interface: z.array(z.string()).optional(),
    exclude_interface: z.array(z.string()).optional(),
    include_uid: z.array(z.number().int()).optional(),
    include_uid_range: z.array(z.string()).optional(),
    exclude_uid: z.array(z.number().int()).optional(),
    exclude_uid_range: z.array(z.string()).optional(),
    include_android_user: z.array(z.number().int()).optional(),
    include_package: z.array(z.string()).optional(),
    exclude_package: z.array(z.string()).optional(),
    platform: z
      .object({
        http_proxy: z
          .object({
            enabled: z.boolean().optional(),
            server: z.string().optional(),
            server_port: z.number().int().min(0).max(65535).optional(),
            bypass_domain: z.array(z.string()).optional(),
            match_domain: z.array(z.string()).optional(),
          })
          .partial()
          .optional(),
      })
      .partial()
      .optional(),
  })
  .strict()

export const InboundSchema = z.union([MixedInboundSchema, TunInboundSchema])

export type MixedInbound = z.infer<typeof MixedInboundSchema>
export type TunInbound = z.infer<typeof TunInboundSchema>
export type Inbound = z.infer<typeof InboundSchema>

export const defaultMixed = (): MixedInbound => ({ type: 'mixed', tag: '' })
export const defaultTun = (): TunInbound => ({ type: 'tun', tag: '', mtu: 9000, stack: 'mixed' })
export const defaultInbound = (): Inbound => defaultMixed()
