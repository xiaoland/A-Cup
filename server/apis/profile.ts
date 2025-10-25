import { Hono } from 'hono';
import { jwt } from 'hono/jwt';
import { zValidator } from '@hono/zod-validator';
import { CreateProfileSchema, UpdateProfileSchema } from '../../schemas/profile';
import { profiles, outbounds as outboundsTable, ruleSets as ruleSetsTable } from '../db/schema';
import { exportProfileToSingBox } from '../services/profile';
import { inArray, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const profileRouter = new Hono();

profileRouter.use('*', async (c, next) => {
  const auth = jwt({ secret: c.env.JWT_SECRET });
  return auth(c, next);
});

profileRouter.post('/', zValidator('json', CreateProfileSchema), async (c) => {
  const { name, tags, outbounds, route, dns, inbounds } = c.req.valid('json');
  const db = c.get('db');
  const user = c.get('jwtPayload');
  const profileId = uuidv4();

  // 1. Insert profile into database
  await db.insert(profiles).values({
    id: profileId,
    name,
    tags: JSON.stringify(tags),
    createdBy: user.sub,
    outbounds: JSON.stringify(outbounds),
    rule_sets: JSON.stringify(route.rule_set),
  });

  // 2. Fetch and parse full outbound and ruleset objects
  const outboundObjects = (await db.select().from(outboundsTable).where(inArray(outboundsTable.id, outbounds))).map(o => ({
    ...o,
    credential: JSON.parse(o.credential),
    tls: o.tls ? JSON.parse(o.tls) : undefined,
    mux: o.mux ? JSON.parse(o.mux) : undefined,
    other: o.other ? JSON.parse(o.other) : undefined,
  }));
  const ruleSetObjects = (await db.select().from(ruleSetsTable).where(inArray(ruleSetsTable.id, route.rule_set))).map(r => ({
    ...r,
  }));

  // 3. Export profile to SingBox format
  const singBoxProfile = exportProfileToSingBox(
    { id: profileId, name, tags, createdBy: user.sub, outbounds, rule_sets: route.rule_set },
    outboundObjects,
    ruleSetObjects,
    dns,
    inbounds,
    route
  );

  // 4. Save to R2
  await c.env.R2.put(`profiles/${profileId}`, JSON.stringify(singBoxProfile));

  return c.json({ id: profileId }, 201);
});

profileRouter.get('/:id', async (c) => {
  const { id } = c.req.param();
  const db = c.get('db');

  const profile = await db.select().from(profiles).where(eq(profiles.id, id)).get();

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
  const { id } = c.req.param();
  const { name, tags, outbounds, route, dns, inbounds } = c.req.valid('json');
  const db = c.get('db');
  const user = c.get('jwtPayload');

  // 1. Update profile in database
  await db.update(profiles).set({
    name,
    tags: JSON.stringify(tags),
    outbounds: JSON.stringify(outbounds),
    rule_sets: JSON.stringify(route.rule_set),
  }).where(eq(profiles.id, id));

  // 2. Fetch and parse full outbound and ruleset objects
  const outboundObjects = (await db.select().from(outboundsTable).where(inArray(outboundsTable.id, outbounds))).map(o => ({
    ...o,
    credential: JSON.parse(o.credential),
    tls: o.tls ? JSON.parse(o.tls) : undefined,
    mux: o.mux ? JSON.parse(o.mux) : undefined,
    other: o.other ? JSON.parse(o.other) : undefined,
  }));
  const ruleSetObjects = (await db.select().from(ruleSetsTable).where(inArray(ruleSetsTable.id, route.rule_set))).map(r => ({
    ...r,
  }));

  // 3. Export profile to SingBox format
  const singBoxProfile = exportProfileToSingBox(
    { id, name, tags, createdBy: user.sub, outbounds, rule_sets: route.rule_set },
    outboundObjects,
    ruleSetObjects,
    dns,
    inbounds,
    route
  );

  // 4. Save to R2
  await c.env.R2.put(`profiles/${id}`, JSON.stringify(singBoxProfile));

  return c.body(null, 204);
});

profileRouter.delete('/:id', async (c) => {
  const { id } = c.req.param();
  const db = c.get('db');

  // 1. Delete profile from database
  await db.delete(profiles).where(eq(profiles.id, id));

  // 2. Delete from R2
  await c.env.R2.delete(`profiles/${id}`);

  return c.body(null, 204);
});

export { profileRouter };
