import { z } from 'zod';

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  tags: z.array(z.string()),
  createdBy: z.string().uuid(),
  outbounds: z.array(z.number().int()),
  rule_sets: z.array(z.number().int()),
});

export type Profile = z.infer<typeof ProfileSchema>;

import { RouteSchema } from './route';
import { DnsSchema } from './dns';
import { InboundSchema } from './inbound';

export const CreateProfileSchema = z.object({
  name: z.string(),
  tags: z.array(z.string()),
  outbounds: z.array(z.number().int()),
  route: RouteSchema.extend({
    rule_set: z.array(z.number().int()),
  }),
  dns: DnsSchema,
  inbounds: z.array(InboundSchema),
});

export type CreateProfile = z.infer<typeof CreateProfileSchema>;

export const UpdateProfileSchema = CreateProfileSchema;
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;
