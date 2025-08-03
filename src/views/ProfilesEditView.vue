<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import ProfileEditor from '@/components/profileEditor/profileEditor.vue'
import type { Profile } from '@/components/profileEditor/types'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const profileEditorRef = ref<InstanceType<typeof ProfileEditor> | null>(null)
const currentProfile = ref<Profile | undefined>()
const loading = ref(false)

const profileId = computed(() => route.params.id as string)

const handleSave = (profile: Profile) => {
  // Profile update is handled by the ProfileEditor component
  console.log('Profile updated:', profile)
  router.push('/profiles')
}

const handleCancel = () => {
  router.push('/profiles')
}

const loadProfile = async () => {
  loading.value = true
  try {
    const response = await userStore.authorizedFetch(`/api/profiles/${profileId.value}`)
    
    if (response.ok) {
      currentProfile.value = await response.json()
    } else if (response.status === 404) {
      console.error('Profile not found')
      router.push('/profiles')
    } else {
      console.error('Failed to load profile:', response.statusText)
    }
  } catch (error) {
    console.error('Error loading profile:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<template>
  <div v-if="loading" class="d-flex justify-center align-center" style="min-height: 200px;">
    <v-progress-circular indeterminate color="primary" />
  </div>
  <ProfileEditor 
    v-else-if="currentProfile"
    ref="profileEditorRef"
    mode="edit"
    :profile="currentProfile"
    @save="handleSave"
    @cancel="handleCancel"
  />
  <div v-else class="text-center pa-4">
    <v-icon size="64" color="error">mdi-alert-circle</v-icon>
    <h3>Profile not found</h3>
  </div>
</template>

<style>
</style>
