import { z } from 'zod';
import { ListenFieldsSchema } from './shared';

const InboundBaseSchema = z.object({
  tag: z.string(),
});

const MixedInboundSchema = InboundBaseSchema.extend({
  type: z.literal('mixed'),
  users: z.array(z.object({
    username: z.string(),
    password: z.string(),
  })).optional(),
  set_system_proxy: z.boolean().optional(),
}).merge(ListenFieldsSchema);

const TunInboundSchema = InboundBaseSchema.extend({
  type: z.literal('tun'),
  interface_name: z.string().optional(),
  address: z.union([z.string(), z.array(z.string())]).optional(),
  mtu: z.number().int().optional(),
  auto_route: z.boolean().optional(),
  iproute2_table_index: z.number().int().optional(),
  iproute2_rule_index: z.number().int().optional(),
  auto_redirect: z.boolean().optional(),
  auto_redirect_input_mark: z.string().optional(),
  auto_redirect_output_mark: z.string().optional(),
  exclude_mptcp: z.boolean().optional(),
  loopback_address: z.union([z.string(), z.array(z.string())]).optional(),
  strict_route: z.boolean().optional(),
  route_address: z.union([z.string(), z.array(z.string())]).optional(),
  route_exclude_address: z.union([z.string(), z.array(z.string())]).optional(),
  route_address_set: z.union([z.string(), z.array(z.string())]).optional(),
  route_exclude_address_set: z.union([z.string(), z.array(z.string())]).optional(),
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
  platform: z.object({
    http_proxy: z.object({
      enabled: z.boolean().optional(),
      server: z.string(),
      server_port: z.number().int(),
      bypass_domain: z.array(z.string()).optional(),
      match_domain: z.array(z.string()).optional(),
    }).optional(),
  }).optional(),
});

export const InboundSchema = z.discriminatedUnion('type', [
  MixedInboundSchema,
  TunInboundSchema,
]);

export type Inbound = z.infer<typeof InboundSchema>;
