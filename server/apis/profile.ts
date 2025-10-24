import { Hono } from 'hono';
import { z } from 'zod';
import { ProfileService } from '../services/profile.service';
import { zValidator, Hook } from '@hono/zod-validator';
import { Profile } from '../business/profile';
import { ProfileExportResponseSchema } from '../schemas/export';
import { SpecialOutbound } from '../business/outbound';

export const profileRouter = new Hono();

const ProfileForCreate = z.object({
  name: z.string().min(1),
  tags: z.array(z.string()),
  outbounds: z.array(z.number().int().positive()),
  special_outbounds: z.array(SpecialOutbound.schema()),
  rule_sets: z.array(z.number().int().positive()),
});

const IDPathParamSchema = z.object({
  id: z.string(),
});

const handleApiError = (c: any, error: any, message: string) => {
  console.error(`${message}:`, error);
  if (error instanceof z.ZodError) {
    return c.json({ error: 'Validation failed', issues: error.errors }, 400);
  }
  return c.json({ error: 'Internal Server Error', message: error.message }, 500);
};

const validationHook: Hook<any, any, any, any> = (result, c) => {
  if (!result.success) {
    return c.json({
      error: 'Validation failed',
      issues: result.error.issues,
    }, 400);
  }
};

// Create Profile
profileRouter.post('/', zValidator('json', ProfileForCreate, validationHook), async (c) => {
  try {
    const body = c.req.valid('json');
    const user_id = parseInt((c.get('jwtPayload')?.sub || '0').toString());
    const profileService = new ProfileService(c.get('db'), c.env);
    const newProfile = await profileService.createProfile(user_id, body);
    return c.json(newProfile, 201);
  } catch (error) {
    return handleApiError(c, error, 'Failed to create profile');
  }
});

// Get All Profiles
profileRouter.get('/', async (c) => {
  try {
    const user_id = parseInt((c.get('jwtPayload')?.sub || '0').toString());
    const profileService = new ProfileService(c.get('db'), c.env);
    const profiles = await profileService.getProfiles(user_id);
    return c.json(profiles);
  } catch (error) {
    return handleApiError(c, error, 'Failed to get profiles');
  }
});

// Get Profile by ID
profileRouter.get('/:id', zValidator('param', IDPathParamSchema, validationHook), async (c) => {
  try {
    const { id } = c.req.valid('param');
    const user_id = parseInt((c.get('jwtPayload')?.sub || '0').toString());
    const profileService = new ProfileService(c.get('db'), c.env);
    const profile = await profileService.getProfileWithSingboxConfig(user_id, id);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }
    return c.json(profile);
  } catch (error) {
    return handleApiError(c, error, 'Failed to get profile');
  }
});

// Update Profile
profileRouter.put('/:id', zValidator('param', IDPathParamSchema, validationHook), zValidator('json', ProfileForCreate, validationHook), async (c) => {
  try {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const user_id = parseInt((c.get('jwtPayload')?.sub || '0').toString());
    const profileService = new ProfileService(c.get('db'), c.env);
    const updatedProfile = await profileService.updateProfile(user_id, id, body);
    if (!updatedProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }
    return c.json(updatedProfile);
  } catch (error) {
    return handleApiError(c, error, 'Failed to update profile');
  }
});

// Delete Profile
profileRouter.delete('/:id', zValidator('param', IDPathParamSchema, validationHook), async (c) => {
  try {
    const { id } = c.req.valid('param');
    const user_id = parseInt((c.get('jwtPayload')?.sub || '0').toString());
    const profileService = new ProfileService(c.get('db'), c.env);
    const deleted = await profileService.deleteProfile(user_id, id);
    if (!deleted) {
      return c.json({ error: 'Profile not found' }, 404);
    }
    return c.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    return handleApiError(c, error, 'Failed to delete profile');
  }
});

// Export Profile
profileRouter.get('/:id/export', zValidator('param', IDPathParamSchema, validationHook), async (c) => {
  try {
    const { id } = c.req.valid('param');
    const user_id = parseInt((c.get('jwtPayload')?.sub || '0').toString());
    const profileService = new ProfileService(c.get('db'), c.env);
    const exportData = await profileService.exportProfile(user_id, id);
    if (!exportData) {
      return c.json({ error: 'Profile not found' }, 404);
    }
    return c.json(ProfileExportResponseSchema.parse(exportData));
  } catch (error) {
    return handleApiError(c, error, 'Failed to export profile');
  }
});
