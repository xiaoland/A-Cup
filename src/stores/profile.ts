import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUserStore } from './user'
import type { Profile } from '@/components/profile/profileList/types'

export const useProfileStore = defineStore('profile', () => {
  const profiles = ref<Profile[]>([])
  const loading = ref(false)
  const userStore = useUserStore()

  async function fetchProfiles() {
    loading.value = true
    try {
      const response = await userStore.authorizedFetch('/api/profiles')
      if (response.ok) {
        profiles.value = await response.json()
      } else {
        console.error('Failed to fetch profiles')
      }
    } finally {
      loading.value = false
    }
  }

  async function createProfile(profileData: any) {
    const response = await userStore.authorizedFetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    })
    if (response.ok) {
      fetchProfiles()
    } else {
      console.error('Failed to create profile')
    }
  }

  async function updateProfile(id: number, profileData: any) {
    const response = await userStore.authorizedFetch(`/api/profiles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    })
    if (response.ok) {
      fetchProfiles()
    } else {
      console.error('Failed to update profile')
    }
  }

  async function deleteProfile(id: number) {
    const response = await userStore.authorizedFetch(`/api/profiles/${id}`, {
      method: 'DELETE',
    })
    if (response.ok) {
      fetchProfiles()
    } else {
      console.error('Failed to delete profile')
    }
  }

  async function exportProfile(profile: Profile) {
    const response = await userStore.authorizedFetch(`/api/profiles/${profile.id}/export`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to export profile');
    }

    return await response.json();
  }

  return { profiles, loading, fetchProfiles, createProfile, updateProfile, deleteProfile, exportProfile }
})