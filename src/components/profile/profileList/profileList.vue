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
          <v-col cols="12" md="6">
            <v-select
              v-model="exportOptions.method"
              :items="exportMethodOptions"
              label="Export Method"
              variant="outlined"
              hint="Choose where to export the profile"
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

        <!-- Empty State -->
        <div v-else-if="!loading && profiles.length === 0" class="empty-state">
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
                  <div class="component-label">Inbounds</div>
                  <div class="component-count">{{ profile.inbounds.length }}</div>
                </div>
                <div class="component-info">
                  <div class="component-label">Outbounds</div>
                  <div class="component-count">{{ profile.outbounds.length }}</div>
                </div>
                <div class="component-info">
                  <div class="component-label">WG Endpoints</div>
                  <div class="component-count">{{ profile.wg_endpoints.length }}</div>
                </div>
                <div class="component-info">
                  <div class="component-label">Route Rules</div>
                  <div class="component-count">{{ profile.rules.length }}</div>
                </div>
                <div class="component-info">
                  <div class="component-label">Rule Sets</div>
                  <div class="component-count">{{ profile.rule_sets.length }}</div>
                </div>
                <div class="component-info">
                  <div class="component-label">DNS Rules</div>
                  <div class="component-count">{{ profile.dns_rules.length }}</div>
                </div>
                <div class="component-info">
                  <div class="component-label">DNS Servers</div>
                  <div class="component-count">{{ profile.dns.length }}</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
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
            
            <div v-if="exportDialog.result.content" class="mt-3">
              <v-btn
                color="primary"
                variant="outlined"
                @click="downloadDirect"
                prepend-icon="mdi-download"
              >
                Download File
              </v-btn>
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
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import type { 
  Profile, 
  Props, 
  ExportOptions
} from './types'
import { exportTypeOptions, exportMethodOptions } from './types'

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
const userStore = useUserStore()

// Reactive data
const localProfiles = ref<Profile[]>([])
const localLoading = ref(false)
const localExportMode = ref(props.exportMode)
const exportOptions = ref<ExportOptions>({
  type: 'sing-box',
  method: 'direct'
})

const exportDialog = ref({
  show: false,
  loading: false,
  profileName: '',
  result: null as { url?: string; content?: string } | null,
  error: ''
})

const deleteDialog = ref({
  show: false,
  profile: null as Profile | null
})

// Computed
const profiles = computed(() => props.profiles.length > 0 ? props.profiles : localProfiles.value)
const loading = computed(() => props.loading || localLoading.value)
const exportMode = computed(() => localExportMode.value)

// Methods
const loadProfiles = async () => {
  localLoading.value = true
  try {
    const response = await userStore.authorizedFetch('/api/profiles')
    if (response.ok) {
      localProfiles.value = await response.json()
    } else {
      console.error('Failed to load profiles:', response.statusText)
    }
  } catch (error) {
    console.error('Error loading profiles:', error)
  } finally {
    localLoading.value = false
  }
}

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
  exportDialog.value = {
    show: true,
    loading: true,
    profileName: profile.name,
    result: null,
    error: ''
  }
  
  try {
    const params = new URLSearchParams({
      type: exportOptions.value.type,
      method: exportOptions.value.method
    })
    
    const response = await userStore.authorizedFetch(`/api/profiles/${profile.id}/export?${params}`)
    
    if (response.ok) {
      const result = await response.json()
      exportDialog.value.result = result
      emit('export', profile, exportOptions.value)
    } else {
      const errorText = await response.text()
      exportDialog.value.error = errorText || 'Failed to export profile'
    }
  } catch (error) {
    exportDialog.value.error = 'Failed to export profile. Please try again.'
    console.error('Export error:', error)
  } finally {
    exportDialog.value.loading = false
  }
}

const downloadDirect = () => {
  if (exportDialog.value.result?.content) {
    const blob = new Blob([exportDialog.value.result.content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${exportDialog.value.profileName}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
  localExportMode.value = false
}

const duplicateProfile = async (profile: Profile) => {
  try {
    const { id, created_by, ...profileData } = profile
    const duplicateData = {
      ...profileData,
      name: `${profile.name} (Copy)`
    }
    
    const response = await userStore.authorizedFetch('/api/profiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(duplicateData)
    })
    
    if (response.ok) {
      await loadProfiles() // Refresh the list
      emit('duplicate', profile)
    } else {
      console.error('Failed to duplicate profile:', response.statusText)
    }
  } catch (error) {
    console.error('Error duplicating profile:', error)
  }
}

const confirmDelete = (profile: Profile) => {
  deleteDialog.value = {
    show: true,
    profile
  }
}

const deleteProfile = async () => {
  if (!deleteDialog.value.profile) return
  
  try {
    const response = await userStore.authorizedFetch(`/api/profiles/${deleteDialog.value.profile.id}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      await loadProfiles() // Refresh the list
      emit('delete', deleteDialog.value.profile.id)
      deleteDialog.value.show = false
    } else {
      console.error('Failed to delete profile:', response.statusText)
    }
  } catch (error) {
    console.error('Error deleting profile:', error)
  }
}

// Initialize
onMounted(() => {
  if (props.profiles.length === 0) {
    loadProfiles()
  }
})
</script>

<style lang="scss" scoped>
@use './index.scss';
</style>
