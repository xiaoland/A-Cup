import { Hono } from 'hono';
import { z } from 'zod';
import { ProfileService } from '../services/profile.service';
import {
  SingBoxProfileRequestSchema,
  ProfileExportResponseSchema,
} from '../schemas/export';
import { zValidator } from '@hono/zod-validator';

export const profileRouter = new Hono();

const CreateProfileSchema = SingBoxProfileRequestSchema;
const UpdateProfileSchema = SingBoxProfileRequestSchema.partial();

const IDPathParamSchema = z.object({
  id: z.string().uuid(),
});

// Create Profile
profileRouter.post('/', zValidator('json', CreateProfileSchema), async (c) => {
  const body = c.req.valid('json');
  const user_id = parseInt((c.get('jwtPayload')?.sub || '0').toString());
  const profileService = new ProfileService(c.get('db'), c.env);

  try {
    const newProfile = await profileService.createProfile(user_id, body);
    return c.json(newProfile);
  } catch (error) {
    return c.text(error instanceof Error ? error.message : 'Validation failed', 400);
  }
});

// Get All Profiles
profileRouter.get('/', async (c) => {
  const user_id = parseInt((c.get('jwtPayload')?.sub || '0').toString());
  const profileService = new ProfileService(c.get('db'), c.env);

  const profiles = await profileService.getProfiles(user_id);
  return c.json(profiles);
});

// Get Profile by ID
profileRouter.get('/:id', zValidator('param', IDPathParamSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user_id = parseInt((c.get('jwtPayload')?.sub || '0').toString());
  const profileService = new ProfileService(c.get('db'), c.env);

  const profile = await profileService.getProfileById(user_id, id);

  if (!profile) {
    return c.text('Profile not found', 404);
  }

  return c.json(profile);
});

// Update Profile
profileRouter.put('/:id', zValidator('param', IDPathParamSchema), zValidator('json', UpdateProfileSchema), async (c) => {
  const { id } = c.req.valid('param');
  const body = c.req.valid('json');
  const user_id = parseInt((c.get('jwtPayload')?.sub || '0').toString());
  const profileService = new ProfileService(c.get('db'), c.env);

  try {
    const updatedProfile = await profileService.updateProfile(user_id, id, body);
    if (!updatedProfile) {
      return c.text('Profile not found', 404);
    }
    return c.json(updatedProfile);
  } catch (error) {
    return c.text(error instanceof Error ? error.message : 'Validation failed', 400);
  }
});

// Delete Profile
profileRouter.delete('/:id', zValidator('param', IDPathParamSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user_id = parseInt((c.get('jwtPayload')?.sub || '0').toString());
  const profileService = new ProfileService(c.get('db'), c.env);

  const deleted = await profileService.deleteProfile(user_id, id);

  if (!deleted) {
    return c.text('Profile not found', 404);
  }

  return c.json({ message: 'Profile deleted successfully' });
});

// Export Profile
profileRouter.get('/:id/export', zValidator('param', IDPathParamSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user_id = parseInt((c.get('jwtPayload')?.sub || '0').toString());
  const profileService = new ProfileService(c.get('db'), c.env);

  try {
    const exportData = await profileService.exportProfile(user_id, id);
    if (!exportData) {
      return c.text('Profile not found', 404);
    }
    return c.json(ProfileExportResponseSchema.parse(exportData));
  } catch (error) {
    console.error('Export error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return c.text(`Failed to generate signed URL for export: ${errorMessage}`, 500);
  }
});
