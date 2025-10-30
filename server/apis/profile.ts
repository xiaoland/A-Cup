import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  CreateProfileSchema,
  UpdateProfileSchema,
  type CreateProfile,
} from "../../schemas/profile";
import { profiles } from "../db/schema";
import { ProfileService } from "../services/profile";
import { exportProfileCreateToSingBox } from "../services/profile";
import { v4 as uuidv4 } from "uuid";
import { authMiddleware } from "../auth";
import type { HonoEnv } from "../types";
import { eq } from "drizzle-orm";

const profileRouter = new Hono<HonoEnv>();

profileRouter.use(authMiddleware);

profileRouter.post("/", zValidator("json", CreateProfileSchema), async (c) => {
  const body = c.req.valid("json");
  const db = c.get("db");
  const userId = c.get("userId");

  const profileId = uuidv4();

  // 1. Save to DB
  const insertedProfile = await db
    .insert(profiles)
    .values({
      id: profileId,
      name: body.name,
      tags: JSON.stringify(body.tags),
      createdBy: userId,
      outbounds: JSON.stringify(body.referencedOutbounds),
      rule_sets: JSON.stringify(body.referencedRuleSets),
    })
    .returning()
    .get();

  // 2. Save to R2
  const singBoxProfile = exportProfileCreateToSingBox(body);

  // 4. Save to R2
  await c.env.R2.put(
    `profiles/${profileId}.json`,
    JSON.stringify(singBoxProfile),
  );

  return c.json(insertedProfile, 201);
});

profileRouter.get("/", async (c) => {
  const userId = c.get("userId");
  const profileService = new ProfileService(c.get("db"));
  const profiles = await profileService.getProfiles(userId);
  return c.json(profiles);
});

profileRouter.get("/:id", async (c) => {
  const { id } = c.req.param();
  const userId = c.get("userId");
  const mode = c.req.query("mode");
  const profileService = new ProfileService(c.get("db"));
  const profile = await profileService.getProfileById(id, userId);

  if (!profile) {
    return c.json({ message: "Profile not found" }, 404);
  }

  // If mode=edit, return full profile data that fits CreateProfileSchema
  if (mode === "edit") {
    // Fetch the singbox profile from R2
    const r2Object = await c.env.R2.get(`profiles/${id}.json`);

    if (!r2Object) {
      return c.json({ message: "Profile configuration not found" }, 404);
    }

    const singBoxProfile = await r2Object.json();

    // Combine DB data with R2 data to create CreateProfile format
    const editProfile: CreateProfile = {
      name: profile.name,
      tags: profile.tags,
      referencedOutbounds: profile.outbounds,
      referencedRuleSets: profile.rule_sets,
      outbounds: singBoxProfile.outbounds || [],
      route: singBoxProfile.route || { rules: [] },
      dns: singBoxProfile.dns || { servers: [], rules: [] },
      inbounds: singBoxProfile.inbounds || [],
    };

    return c.json(editProfile);
  }

  return c.json(profile);
});

profileRouter.get("/:id/singbox", async (c) => {
  const { id } = c.req.param();
  const r2PublicUrl = c.env.R2_PUBLIC_URL;
  return c.json({ url: `${r2PublicUrl}/profiles/${id}.json` });
});

profileRouter.put(
  "/:id",
  zValidator("json", UpdateProfileSchema),
  async (c) => {
    const { id } = c.req.param();
    const body = c.req.valid("json");
    const db = c.get("db");
    const userId = c.get("userId");

    const profileService = new ProfileService(db);
    const existingProfile = await profileService.getProfileById(id, userId);

    if (!existingProfile) {
      return c.json({ message: "Profile not found" }, 404);
    }

    await db
      .update(profiles)
      .set({
        name: body.name,
        tags: JSON.stringify(body.tags),
        outbounds: JSON.stringify(body.referencedOutbounds),
        rule_sets: JSON.stringify(body.referencedRuleSets),
      })
      .where(eq(profiles.id, id));

    const singBoxProfile = exportProfileCreateToSingBox(body);
    await c.env.R2.put(`profiles/${id}.json`, JSON.stringify(singBoxProfile));

    return c.body(null, 204);
  },
);

profileRouter.delete("/:id", async (c) => {
  const { id } = c.req.param();
  const userId = c.get("userId");
  const profileService = new ProfileService(c.get("db"));

  const success = await profileService.deleteProfile(id, userId);

  if (!success) {
    return c.json({ message: "Profile not found" }, 404);
  }

  // Delete from R2
  await c.env.R2.delete(`profiles/${id}.json`);

  return c.body(null, 204);
});

export { profileRouter };
