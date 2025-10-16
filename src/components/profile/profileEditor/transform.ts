import type { Profile } from './schema'
import type { SingboxProfile } from '@/schemas/singbox'
import merge from 'lodash.merge'

export function transformSingboxToProfile(
  singboxProfile: SingboxProfile,
  existingProfile: Profile
): Profile {
  const newProfileData = {
    inbounds: singboxProfile.inbounds,
    outbounds: singboxProfile.outbounds,
    route: singboxProfile.route,
    dns: singboxProfile.dns,
  }
  return merge({}, existingProfile, newProfileData)
}