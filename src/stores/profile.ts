import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Profile } from '../../schemas/profile';

export const useProfileStore = defineStore('profile', () => {
  const profiles = ref<Profile[]>([]);

  async function fetchProfiles() {
    const response = await fetch('/api/profiles');
    profiles.value = await response.json();
  }

  async function deleteProfile(id: string) {
    await fetch(`/api/profiles/${id}`, { method: 'DELETE' });
    await fetchProfiles();
  }

  // TODO: Implement create profile action
  async function createProfile(profile: Profile) {
    console.log('createProfile', profile);
  }

  // TODO: Implement update profile action
  async function updateProfile(profile: Profile) {
    console.log('updateProfile', profile);
  }

  return {
    profiles,
    fetchProfiles,
    deleteProfile,
    createProfile,
    updateProfile,
  };
});
