<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import ProfileList from '@/components/profile/profileList/profileList.vue'
import type { Profile, ExportOptions } from '@/components/profile/profileList/types'

const router = useRouter()
const userStore = useUserStore()
const profileListRef = ref<InstanceType<typeof ProfileList> | null>(null)

const handleCreate = () => {
  router.push('/profiles/create')
}

const handleEdit = (id: number) => {
  router.push(`/profiles/${id}/edit`)
}

const handleDelete = (id: number) => {
  // Profile deletion is handled by the ProfileList component
  console.log('Profile deleted:', id)
}

const handleDuplicate = (profile: Profile) => {
  // Profile duplication is handled by the ProfileList component
  console.log('Profile duplicated:', profile)
}

const handleExport = (profile: Profile, options: ExportOptions) => {
  // Export is handled by the ProfileList component
  console.log('Profile exported:', profile, 'with options:', options)
}
</script>

<template>
  <ProfileList 
    ref="profileListRef"
    @create="handleCreate"
    @edit="handleEdit"
    @delete="handleDelete"
    @duplicate="handleDuplicate"
    @export="handleExport"
  />
</template>

<style>
</style>
