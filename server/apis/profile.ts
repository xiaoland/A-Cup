import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { CreateProfileSchema, UpdateProfileSchema } from '../../schemas/profile';
import { profiles, outbounds as outboundsTable, ruleSets as ruleSetsTable } from '../db/schema';
import { exportProfileCreateToSingBox } from '../services/profile';
import { inArray, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../auth';
import { OutboundService } from '../services/outbound';
import type { HonoEnv } from '../types';

const profileRouter = new Hono<HonoEnv>();

profileRouter.use(authMiddleware);

profileRouter.post('/', zValidator('json', CreateProfileSchema), async (c) => {
  const body = c.req.valid('json');
  const db = c.get('db');
  const userId = c.get('userId');

  const profileId = uuidv4();

  // 1. Save to DB
  const insertedProfile = await db.insert(profiles).values({
    id: profileId,
    name: body.name,
    tags: JSON.stringify(body.tags),
    createdBy: userId,
    outbounds: JSON.stringify(body.referencedOutbounds),
    rule_sets: JSON.stringify(body.referencedRuleSets),
  });

  // 2. Save to R2
  const singBoxProfile = exportProfileCreateToSingBox(body);

  // 4. Save to R2
  await c.env.R2.put(`profiles/${profileId}`, JSON.stringify(singBoxProfile));

  return c.json(insertedProfile, 201);
});

profileRouter.get('/:id', async (c) => {
  const { id } = c.req.param();
  const userId = c.get('userId');
  const profileService = new ProfileService(c.get('db'));
  const profile = await profileService.getProfileById(id, userId);

  if (!profile) {
    return c.json({ message: 'Profile not found' }, 404);
  }

  return c.json(profile);
});

profileRouter.get('/:id/singbox', async (c) => {
  const { id } = c.req.param();
  const r2PublicUrl = c.env.R2_PUBLIC_URL;
  return c.json({ url: `${r2PublicUrl}/profiles/${id}` });
});

profileRouter.put('/:id', zValidator('json', UpdateProfileSchema), async (c) => {
  // TODO
});

profileRouter.delete('/:id', async (c) => {
  const { id } = c.req.param();
  const userId = c.get('userId');
  const profileService = new ProfileService(c.get('db'));

  const success = await profileService.deleteProfile(id, userId);

  if (!success) {
    return c.json({ message: 'Profile not found' }, 404);
  }

  // Delete from R2
  await c.env.R2.delete(`profiles/${id}`);

  return c.body(null, 204);
});

export { profileRouter };
