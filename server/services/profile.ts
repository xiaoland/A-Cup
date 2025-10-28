import { CreateProfile } from '../../schemas/profile';
import { SingBoxProfile } from '../../schemas/singbox';

export function exportProfileCreateToSingBox(
  profileCreate: CreateProfile
): SingBoxProfile {
  const { name, tags, referencedOutbounds, referencedRuleSets, ...result } = profileCreate;
  return result;
}
