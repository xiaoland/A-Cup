import { z } from 'zod'
import { RouteRuleSchema } from '../routeRuleEditor/types'

export const RouteSchema = z.object({
  final: z.boolean().optional(),
  auto_detect_interface: z.boolean().optional(),
  override_android_vpn: z.boolean().optional(),
  default_interface: z.string().optional(),
  rules: z.array(RouteRuleSchema).optional(),
})

export type Route = z.infer<typeof RouteSchema>