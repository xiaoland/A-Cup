<template>
  <v-container class="profile-list">
    <div class="action-header">
      <div class="header-title">
        <v-icon class="me-2">mdi-account-network-outline</v-icon>
        Profiles
      </div>
      <div class="header-actions">
        <v-btn
          v-if="!exportMode"
          color="secondary"
          variant="outlined"
          @click="toggleExportMode"
          prepend-icon="mdi-export"
        >
          Export
        </v-btn>
        <v-btn
          v-else
          color="secondary"
          variant="outlined"
          @click="cancelExportMode"
        >
          Cancel Export
        </v-btn>
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

    <!-- Export Mode Controls -->
    <v-card v-if="exportMode" variant="outlined" class="export-controls">
      <v-card-text>
        <div class="d-flex align-center">
          <v-icon class="me-2" color="primary">mdi-export</v-icon>
          <span class="text-h6">Export Mode</span>
        </div>
        <div class="export-help">
          Select a profile below to export it with the chosen settings.
        </div>
        
        <v-row class="export-options">
          <v-col cols="12" md="6">
            <v-select
              v-model="exportOptions.type"
              :items="exportTypeOptions"
              label="Export Type"
              variant="outlined"
              hint="Choose the format for the exported profile"
              persistent-hint
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

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
            <v-card
              v-for="profile in profiles"
              :key="profile.id"
              variant="outlined"
              class="profile-item"
              :class="{ 'export-mode': exportMode }"
              @click="handleProfileClick(profile)"
            >
              <v-card-text>
                <div class="profile-header">
                  <div>
                    <div class="profile-title">{{ profile.name }}</div>
                    <div class="text-caption text-medium-emphasis">
                      ID: {{ profile.id }}
                    </div>
                  </div>
                  <div v-if="!exportMode" class="profile-actions">
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      @click.stop="$emit('edit', profile.id)"
                    />
                    <v-menu>
                      <template #activator="{ props: menuProps }">
                        <v-btn
                          icon="mdi-dots-vertical"
                          size="small"
                          variant="text"
                          v-bind="menuProps"
                          @click.stop
                        />
                      </template>
                      <v-list>
                        <v-list-item @click="duplicateProfile(profile)">
                          <template #prepend>
                            <v-icon>mdi-content-copy</v-icon>
                          </template>
                          <v-list-item-title>Duplicate</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="confirmDelete(profile)">
                          <template #prepend>
                            <v-icon color="error">mdi-delete</v-icon>
                          </template>
                          <v-list-item-title>Delete</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>
                  <div v-else class="d-flex align-center">
                    <v-icon color="primary" class="me-2">mdi-cursor-pointer</v-icon>
                    <span class="text-caption">Click to export</span>
                  </div>
                </div>

                <!-- Tags -->
                <div v-if="profile.tags.length > 0" class="profile-tags">
                  <v-chip
                    v-for="tag in profile.tags"
                    :key="tag"
                    size="small"
                    variant="outlined"
                  >
                    {{ tag }}
                  </v-chip>
                </div>

                <!-- Component Statistics -->
                <div class="profile-components">
                  <div class="component-info">
                    <div class="component-label">Outbounds</div>
                    <div class="component-count">{{ profile.outbounds.length }}</div>
                  </div>
                  <div class="component-info">
                    <div class="component-label">Rule Sets</div>
                    <div class="component-count">{{ profile.rule_sets.length }}</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
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
import { ref, computed, onMounted } from 'vue'
import { useProfileStore } from '@/stores/profile'
import { useUserStore } from '@/stores/user'
import type { 
  Profile, 
  Props, 
  ExportOptions
} from './types'
import { exportTypeOptions } from './types'

// Props
const props = withDefaults(defineProps<Props>(), {
  profiles: () => [],
  loading: false,
  exportMode: false
})

// Emits
const emit = defineEmits<{
  create: []
  edit: [id: number]
  delete: [id: number]
  duplicate: [profile: Profile]
  export: [profile: Profile, options: ExportOptions]
}>()

// Store
const profileStore = useProfileStore()
const userStore = useUserStore()

// Reactive data
const localProfiles = ref<Profile[]>([])
const localExportMode = ref(props.exportMode)
const exportOptions = ref<ExportOptions>({
  type: 'sing-box',
})

const exportDialog = ref({
  show: false,
  loading: false,
  profileName: '',
  result: null as { url?: string; fileName?: string } | null,
  error: ''
})

const deleteDialog = ref({
  show: false,
  profile: null as Profile | null
})

// Computed
const profiles = computed(() => profileStore.profiles)
const loading = computed(() => profileStore.loading)
const exportMode = computed(() => localExportMode.value)

// Methods

const toggleExportMode = () => {
  localExportMode.value = true
}

const cancelExportMode = () => {
  localExportMode.value = false
}

const handleProfileClick = (profile: Profile) => {
  if (exportMode.value) {
    exportProfile(profile)
  } else {
    emit('edit', profile.id)
  }
}

const exportProfile = async (profile: Profile) => {
  exportDialog.value.loading = true;
  exportDialog.value.error = '';

  try {
    const response = await userStore.authorizedFetch(`/api/profiles/${profile.id}/export`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to export profile');
    }

    const result = await response.json();

    // Trigger download
    const a = document.createElement('a');
    a.href = result.url;
    a.download = result.fileName || `${profile.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Close dialog after successful download trigger
    exportDialog.value.show = false;
    localExportMode.value = false;
    emit('export', profile, exportOptions.value);

  } catch (error) {
    exportDialog.value.error = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('Export error:', error);
  } finally {
    exportDialog.value.loading = false;
  }
}

const closeExportDialog = () => {
  exportDialog.value.show = false
  localExportMode.value = false
}

const duplicateProfile = async (profile: Profile) => {
  const { id, created_by, ...profileData } = profile
  const duplicateData = {
    ...profileData,
    name: `${profile.name} (Copy)`
  }
  await profileStore.createProfile(duplicateData)
  emit('duplicate', profile)
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
  emit('delete', deleteDialog.value.profile.id)
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
