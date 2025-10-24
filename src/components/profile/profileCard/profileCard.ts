import type { Profile } from '../profileEditor/schema';

export interface Props {
  profile: Profile;
}

export interface Emits {
  (e: 'edit', profile: Profile): void;
  (e: 'delete', profile: Profile): void;
  (e: 'duplicate', profile: Profile): void;
  (e: 'export', profile: Profile): void;
}