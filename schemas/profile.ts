import { z } from 'zod';
import { RouteSchema } from './route';
import { DnsSchema } from './dns';
import { InboundSchema } from './inbound';
import { SingBoxOutboundSchema } from './singbox';

export const ProfileSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  tags: z.array(z.string()),
  outbounds: z.array(z.int()),
  rule_sets: z.array(z.int()),
});

export type Profile = z.infer<typeof ProfileSchema>;

export const CreateProfileSchema = z.object({
  name: z.string(),  // save to db
  tags: z.array(z.string()),  // save to db
  referencedOutbounds: z.array(z.int()),  // save to db `outbounds`
  referencedRuleSets: z.array(z.int()),  // save to db `rule_sets`
  outbounds: z.array(SingBoxOutboundSchema),  // save to r2
  route: RouteSchema,  // save to r2
  dns: DnsSchema,  // save to r2
  inbounds: z.array(InboundSchema),  // save to r2
});

export type CreateProfile = z.infer<typeof CreateProfileSchema>;

export const UpdateProfileSchema = CreateProfileSchema;
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;
