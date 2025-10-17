<template>
  <v-container class="profile-list">
    <div class="action-header">
      <div class="header-title">
        <v-icon class="me-2">mdi-account-network-outline</v-icon>
        Profiles
      </div>
      <div class="header-actions">
        <v-btn
          color="primary"
          variant="elevated"
          @click="$emit('create')"
          prepend-icon="mdi-plus"
        >
          Create New
        </v-btn>
      </div>
    </div>

    <v-card>
      <v-card-text>
        <!-- Loading State -->
        <v-skeleton-loader
          v-if="loading"
          type="list-item-three-line@6"
          class="mb-4"
        />

        <div v-else>
          <!-- Empty State -->
          <div v-if="profiles.length === 0" class="empty-state">
            <v-icon class="empty-icon">mdi-account-network-outline</v-icon>
            <h3>No profiles found</h3>
            <p class="text-medium-emphasis">Start by creating your first proxy profile</p>
            <v-btn
              color="primary"
              variant="elevated"
              @click="$emit('create')"
              prepend-icon="mdi-plus"
              class="mt-4"
            >
              Create First Profile
            </v-btn>
          </div>

          <!-- Profile List -->
          <div v-else>
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
      </v-card-text>
    </v-card>

    <!-- Export Result Dialog -->
    <v-dialog
      v-model="exportDialog.show"
      max-width="600px"
    >
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="me-2" color="primary">mdi-export</v-icon>
          Export Profile
        </v-card-title>

        <v-card-text>
          <div v-if="exportDialog.loading" class="text-center py-4">
            <v-progress-circular indeterminate color="primary" />
            <div class="mt-2">Exporting profile...</div>
          </div>

          <div v-else-if="exportDialog.result" class="export-result">
            <div class="d-flex align-center">
              <v-icon color="success" class="me-2">mdi-check-circle</v-icon>
              <span class="text-h6">Export Successful</span>
            </div>
            <div class="mt-2">
              Profile "{{ exportDialog.profileName }}" has been exported successfully.
            </div>

            <div v-if="exportDialog.result.url" class="result-url">
              <div class="text-caption mb-1">Download URL:</div>
              <div>{{ exportDialog.result.url }}</div>
            </div>
          </div>

          <div v-else-if="exportDialog.error" class="export-error">
            <div class="d-flex align-center">
              <v-icon color="error" class="me-2">mdi-alert-circle</v-icon>
              <span class="text-h6">Export Failed</span>
            </div>
            <div class="mt-2">{{ exportDialog.error }}</div>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            v-if="exportDialog.result?.url"
            color="primary"
            variant="outlined"
            @click="copyToClipboard(exportDialog.result.url)"
          >
            Copy URL
          </v-btn>
          <v-btn
            variant="outlined"
            @click="closeExportDialog"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog
      v-model="deleteDialog.show"
      max-width="400px"
    >
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon color="error" class="me-2">mdi-delete</v-icon>
          Delete Profile
        </v-card-title>
        
        <v-card-text>
          Are you sure you want to delete the profile "{{ deleteDialog.profile?.name }}"?
          This action cannot be undone.
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="deleteDialog.show = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="deleteProfile"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useProfileStore } from '@/stores/profile'
import ProfileCard from '../profileCard/profileCard.vue'
import type { Profile, Props } from './types'

// Props
const props = withDefaults(defineProps<Props>(), {
  profiles: () => [],
  loading: false,
})

// Emits
const emit = defineEmits<{
  create: []
  edit: [id: number]
}>()

// Store
const profileStore = useProfileStore()

// Reactive data
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

// Computed
const profiles = computed(() => profileStore.profiles)
const loading = computed(() => profileStore.loading)

// Methods
const handleEdit = (id: number) => {
  emit('edit', id)
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
  if (!deleteDialog.value.profile) return
  
  await profileStore.deleteProfile(deleteDialog.value.profile.id)
  deleteDialog.value.show = false
}

// Initialize
onMounted(() => {
  if (props.profiles.length === 0) {
    profileStore.fetchProfiles()
  }
})
</script>

<style lang="scss" scoped>
@use './index.scss';
</style>
