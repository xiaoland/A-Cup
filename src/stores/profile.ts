import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Profile, CreateProfile, UpdateProfile } from '../../schemas/profile';

export const useProfileStore = defineStore('profile', () => {
  const profiles = ref<Profile[]>([]);
  const currentProfile = ref<Profile | null>(null);

  async function fetchProfiles() {
    const response = await fetch('/api/profiles');
    profiles.value = await response.json();
  }

  async function getProfile(id: string) {
    const response = await fetch(`/api/profiles/${id}`);
    currentProfile.value = await response.json();
    return currentProfile.value;
  }

  async function deleteProfile(id: string) {
    await fetch(`/api/profiles/${id}`, { method: 'DELETE' });
    await fetchProfiles();
  }

  async function createProfile(profile: CreateProfile) {
    await fetch('/api/profiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    });
    await fetchProfiles();
  }

  async function updateProfile(id: string, profile: UpdateProfile) {
    await fetch(`/api/profiles/${id}`, {
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
