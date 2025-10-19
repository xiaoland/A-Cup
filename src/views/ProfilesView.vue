<template>
  <div class="profile-list">
    <div class="flex justify-between items-center mb-4">
      <div class="text-2xl font-bold flex items-center">
        <span class="i-mdi-account-network-outline mr-2" />
        Profiles
      </div>
      <Button
        label="Create New"
        icon="i-mdi-plus"
        @click="handleCreate"
      />
    </div>

    <div>
      <template #content>
        <!-- Loading State -->
        <div v-if="loading">
          <Skeleton v-for="i in 3" :key="i" height="6rem" class="mb-2" />
        </div>

        <div v-else>
          <!-- Empty State -->
          <div v-if="profiles.length === 0" class="text-center p-4">
            <span class="i-mdi-account-network-outline text-6xl text-gray-400" />
            <h3 class="text-xl font-bold mt-4">No profiles found</h3>
            <p class="text-gray-500">Start by creating your first proxy profile</p>
            <Button
              label="Create First Profile"
              icon="i-mdi-plus"
              class="mt-4"
              @click="handleCreate"
            />
          </div>

          <!-- Profile List -->
          <div v-else class="flex flex-col gap-4">
            <ProfileCard
              v-for="profile in profiles"
              :key="profile.id"
              :profile="profile"
              @edit="handleEdit"
              @delete="confirmDelete"
              @duplicate="duplicateProfile"
              @export="exportProfile"
            />
          </div>
        </div>
      </template>
      </div>

    <!-- Export Result Dialog -->
    <Dialog
      v-model:visible="exportDialog.show"
      modal
      header="Export Profile"
      class="w-full max-w-lg"
    >
      <div v-if="exportDialog.loading" class="text-center p-4">
        <ProgressSpinner />
        <div class="mt-2">Exporting profile...</div>
      </div>

      <div v-else-if="exportDialog.result" class="p-4">
        <div class="flex items-center text-green-500">
          <span class="i-mdi-check-circle mr-2" />
          <span class="text-xl font-bold">Export Successful</span>
        </div>
        <div class="mt-2">
          Profile "{{ exportDialog.profileName }}" has been exported successfully.
        </div>

        <div v-if="exportDialog.result.url" class="mt-4">
          <div class="text-sm font-bold mb-1">Download URL:</div>
          <div class="p-2 bg-gray-100 rounded break-all">{{ exportDialog.result.url }}</div>
        </div>
      </div>

      <div v-else-if="exportDialog.error" class="p-4">
        <div class="flex items-center text-red-500">
          <span class="i-mdi-alert-circle mr-2" />
          <span class="text-xl font-bold">Export Failed</span>
        </div>
        <div class="mt-2">{{ exportDialog.error }}</div>
      </div>

      <template #footer>
        <Button
          v-if="exportDialog.result?.url"
          label="Copy URL"
          icon="i-mdi-content-copy"
          @click="copyToClipboard(exportDialog.result.url)"
        />
        <Button
          label="Close"
          severity="secondary"
          @click="closeExportDialog"
        />
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="deleteDialog.show"
      modal
      header="Delete Profile"
      class="w-full max-w-md"
    >
      <div class="p-4">
        <div class="flex items-center">
          <span class="i-mdi-delete text-red-500 mr-2" />
          Are you sure you want to delete the profile "{{ deleteDialog.profile?.name }}"? This action cannot be undone.
        </div>
      </div>
      <template #footer>
        <Button
          label="Cancel"
          severity="secondary"
          @click="deleteDialog.show = false"
        />
        <Button
          label="Delete"
          severity="danger"
          @click="deleteProfile"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile'
import ProfileCard from '@/components/profile/profileCard/profileCard.vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Skeleton from 'primevue/skeleton'
import Dialog from 'primevue/dialog'
import ProgressSpinner from 'primevue/progressspinner'
import type { Profile } from '@/components/profile/profileEditor/schema'

const router = useRouter()
const profileStore = useProfileStore()

const deleteDialog = ref({
  show: false,
  profile: null as Profile | null
})

const exportDialog = ref({
  show: false,
  loading: false,
  profileName: '',
  result: null as { url?: string; fileName?: string } | null,
  error: ''
})

const profiles = computed(() => profileStore.profiles)
const loading = computed(() => profileStore.loading)

const handleCreate = () => {
  router.push('/profiles/create')
}

const handleEdit = (profile: Profile) => {
  if (profile.id) {
    router.push(`/profiles/${profile.id}/edit`)
  }
}

const exportProfile = async (profile: Profile) => {
  exportDialog.value = {
    show: true,
    loading: true,
    profileName: profile.name,
    result: null,
    error: ''
  }

  try {
    const result = await profileStore.exportProfile(profile)
    exportDialog.value.result = result
  } catch (error) {
    exportDialog.value.error = error instanceof Error ? error.message : 'An unknown error occurred.'
    console.error('Export error:', error)
  } finally {
    exportDialog.value.loading = false
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    // In real app, show a toast notification
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
  }
}

const closeExportDialog = () => {
  exportDialog.value.show = false
}

const duplicateProfile = async (profile: Profile) => {
  const { id, created_by, ...profileData } = profile
  const duplicateData = {
    ...profileData,
    name: `${profile.name} (Copy)`
  }
  await profileStore.createProfile(duplicateData)
}

const confirmDelete = (profile: Profile) => {
  deleteDialog.value = {
    show: true,
    profile
  }
}

const deleteProfile = async () => {
  if (!deleteDialog.value.profile || !deleteDialog.value.profile.id) return

  await profileStore.deleteProfile(deleteDialog.value.profile.id)
  deleteDialog.value.show = false
}

onMounted(() => {
  if (profiles.value.length === 0) {
    profileStore.fetchProfiles()
  }
})
</script>
