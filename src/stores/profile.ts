import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUserStore } from './user'
import type { Profile } from '@/components/profile/profileList/types'

export const useProfileStore = defineStore('profile', () => {
  const profiles = ref<Profile[]>([])
  const userStore = useUserStore()

  async function fetchProfiles() {
    const response = await userStore.authorizedFetch('/api/profiles')
    if (response.ok) {
      profiles.value = await response.json()
    } else {
      console.error('Failed to fetch profiles')
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

  return { profiles, fetchProfiles, createProfile, updateProfile, deleteProfile }
})