import { Profile } from '../../schemas/profile';
import { Outbound } from '../../schemas/outbound';
import { RuleSet } from '../../schemas/ruleset';
import { SingBoxProfile } from '../../schemas/singbox';
import { exportOutboundToSingBox } from './outbound';
import { exportRuleSetToSingBox } from './ruleset';
import { DnsSchema } from '../../schemas/dns';
import { InboundSchema } from '../../schemas/singbox';
import { RouteSchema } from '../../schemas/route';
import { z } from 'zod';

type Dns = z.infer<typeof DnsSchema>;
type Inbound = z.infer<typeof InboundSchema>;
type Route = z.infer<typeof RouteSchema>;

export function exportProfileToSingBox(
  profile: Profile,
  outbounds: Outbound[],
  ruleSets: RuleSet[],
  dns: Dns,
  inbounds: Inbound[],
  route: Route,
): SingBoxProfile {
  const singBoxOutbounds = outbounds.map(exportOutboundToSingBox);
  const singBoxRuleSets = ruleSets.map(exportRuleSetToSingBox);

  return {
    dns,
    inbounds,
    outbounds: singBoxOutbounds,
    route: {
      ...route,
      rule_set: singBoxRuleSets,
    },
  };
}
