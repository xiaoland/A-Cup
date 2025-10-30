import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Profile, CreateProfile, UpdateProfile } from '../../schemas/profile';
import { useUserStore } from './user';

export const useProfileStore = defineStore('profile', () => {
  const profiles = ref<Profile[]>([]);
  const currentProfile = ref<Profile | null>(null);
  const userStore = useUserStore();

  async function fetchProfiles() {
    profiles.value = await userStore.authorizedRequest<Profile[]>('/api/profiles');
  }

  async function getProfile(id: string) {
    currentProfile.value = await userStore.authorizedRequest<Profile>(`/api/profiles/${id}`);
    return currentProfile.value;
  }

  async function deleteProfile(id: string) {
    await userStore.authorizedRequest(`/api/profiles/${id}`, { method: 'DELETE' });
    await fetchProfiles();
  }

  async function createProfile(profile: CreateProfile) {
    await userStore.authorizedRequest('/api/profiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    });
    await fetchProfiles();
  }

  async function updateProfile(id: string, profile: UpdateProfile) {
    await userStore.authorizedRequest(`/api/profiles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    });
    await fetchProfiles();
  }

  return {
    profiles,
    currentProfile,
    fetchProfiles,
    getProfile,
    deleteProfile,
    createProfile,
    updateProfile,
  };
});
