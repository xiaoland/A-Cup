import type { Profile } from '../profileList/types';

export interface Props {
  profile: Profile;
}

export interface Emits {
  (e: 'edit', id: number): void;
  (e: 'delete', profile: Profile): void;
  (e: 'duplicate', profile: Profile): void;
  (e: 'export', profile: Profile): void;
}