<template>
  <v-container class="inbound-list">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon class="me-2">mdi-router-network</v-icon>
          Inbounds
        </div>
        <v-btn
          color="primary"
          variant="elevated"
          @click="createInbound"
          prepend-icon="mdi-plus"
        >
          Create New
        </v-btn>
      </v-card-title>

      <v-card-text>
        <!-- Loading State -->
        <v-skeleton-loader
          v-if="loading"
          type="list-item-three-line@6"
          class="mb-4"
        />

        <!-- Empty State -->
        <v-empty-state
          v-else-if="!loading && inbounds.length === 0"
          headline="No inbounds found"
          title="Start by creating your first inbound"
          text="Inbounds define how traffic enters your proxy system."
        >
          <template #actions>
            <v-btn
              color="primary"
              variant="elevated"
              @click="createInbound"
              prepend-icon="mdi-plus"
            >
              Create First Inbound
            </v-btn>
          </template>
        </v-empty-state>

        <!-- Inbounds List -->
        <v-list v-else>
          <v-list-item
            v-for="inbound in inbounds"
            :key="inbound.id"
            class="inbound-item"
            @click="editInbound(inbound)"
          >
            <template #prepend>
              <v-avatar
                :color="getTypeColor(inbound.type)"
                class="text-white"
              >
                <v-icon>{{ getTypeIcon(inbound.type) }}</v-icon>
              </v-avatar>
            </template>

            <v-list-item-title class="text-h6">
              {{ getInboundDisplayName(inbound) }}
            </v-list-item-title>

            <v-list-item-subtitle>
              <div class="d-flex flex-column">
                <span class="text-caption mb-1">
                  Type: {{ getTypeDisplayName(inbound.type) }}
                  <v-chip
                    v-if="inbound.stack && inbound.type === 'tun'"
                    size="x-small"
                    variant="outlined"
                    class="ms-2"
                  >
                    {{ getStackDisplayName(inbound.stack) }}
                  </v-chip>
                </span>
                <span v-if="inbound.address || inbound.port" class="text-caption">
                  {{ inbound.address || '0.0.0.0' }}{{ inbound.port ? `:${inbound.port}` : '' }}
                </span>
                <span v-if="inbound.type === 'tun' && inbound.mtu" class="text-caption">
                  MTU: {{ inbound.mtu }}
                </span>
              </div>
            </v-list-item-subtitle>

            <template #append>
              <div class="d-flex align-center">
                <v-chip
                  v-if="inbound.share"
                  size="small"
                  color="success"
                  variant="outlined"
                  class="me-2"
                >
                  <v-icon start size="small">mdi-share-variant</v-icon>
                  Shared
                </v-chip>
                
                <v-menu>
                  <template #activator="{ props }">
                    <v-btn
                      icon="mdi-dots-vertical"
                      size="small"
                      variant="text"
                      v-bind="props"
                      @click.stop
                    />
                  </template>
                  <v-list density="compact">
                    <v-list-item
                      @click="editInbound(inbound)"
                      prepend-icon="mdi-pencil"
                    >
                      Edit
                    </v-list-item>
                    <v-list-item
                      @click="exportInbound(inbound)"
                      prepend-icon="mdi-export"
                    >
                      Export
                    </v-list-item>
                    <v-list-item
                      @click="deleteInbound(inbound)"
                      prepend-icon="mdi-delete"
                      class="text-error"
                    >
                      Delete
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog
      v-model="deleteDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title class="text-h6">
          Confirm Delete
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete inbound "{{ getInboundDisplayName(selectedInbound) }}"?
          This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="confirmDelete"
            :loading="deleteLoading"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Export Dialog -->
    <v-dialog
      v-model="exportDialog"
      max-width="600"
    >
      <v-card>
        <v-card-title class="text-h6">
          Export Configuration
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="exportType"
            :items="exportTypes"
            label="Export Format"
            variant="outlined"
            class="mb-4"
          />
          <v-textarea
            v-if="exportedConfig"
            :model-value="exportedConfig"
            label="Configuration"
            variant="outlined"
            readonly
            rows="15"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="exportDialog = false"
          >
            Close
          </v-btn>
          <v-btn
            v-if="exportedConfig"
            color="primary"
            variant="elevated"
            @click="copyToClipboard"
          >
            Copy to Clipboard
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Inbound, ExportType } from './types'
import { typeOptions, stackOptions, exportTypes } from './types'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// Reactive state
const inbounds = ref<Inbound[]>([])
const loading = ref(false)
const deleteDialog = ref(false)
const deleteLoading = ref(false)
const exportDialog = ref(false)
const selectedInbound = ref<Inbound | null>(null)
const exportType = ref<ExportType>('sing-box')
const exportedConfig = ref('')

// Load inbounds from API
const loadInbounds = async () => {
  loading.value = true
  try {
    const response = await userStore.authorizedFetch('/api/inbounds')
    
    if (response.ok) {
      inbounds.value = await response.json()
    } else {
      console.error('Failed to load inbounds')
    }
  } catch (error) {
    console.error('Failed to load inbounds:', error)
  } finally {
    loading.value = false
  }
}

// Helper functions for display
const getInboundDisplayName = (inbound: Inbound | null): string => {
  if (!inbound) return 'Unknown'
  
  if (inbound.type === 'mixed') {
    return `Mixed Proxy${inbound.port ? ` (${inbound.port})` : ''}`
  } else if (inbound.type === 'tun') {
    return `TUN Interface${inbound.stack ? ` (${inbound.stack})` : ''}`
  }
  
  return inbound.type
}

const getTypeDisplayName = (type: string): string => {
  const option = typeOptions.find(t => t.value === type)
  return option ? option.title : type
}

const getStackDisplayName = (stack: string): string => {
  const option = stackOptions.find(s => s.value === stack)
  return option ? option.title.split(' ')[0] : stack // Get just the first word
}

const getTypeColor = (type: string): string => {
  switch (type) {
    case 'mixed':
      return 'blue'
    case 'tun':
      return 'green'
    default:
      return 'grey'
  }
}

const getTypeIcon = (type: string): string => {
  switch (type) {
    case 'mixed':
      return 'mdi-network'
    case 'tun':
      return 'mdi-ethernet'
    default:
      return 'mdi-router-network'
  }
}

// Action handlers
const createInbound = () => {
  router.push('/inbounds/create')
}

const editInbound = (inbound: Inbound) => {
  router.push(`/inbounds/${inbound.id}/edit`)
}

const deleteInbound = (inbound: Inbound) => {
  selectedInbound.value = inbound
  deleteDialog.value = true
}

const confirmDelete = async () => {
  if (!selectedInbound.value?.id) return
  
  deleteLoading.value = true
  try {
    const response = await userStore.authorizedFetch(`/api/inbounds/${selectedInbound.value.id}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      await loadInbounds() // Reload the list
      deleteDialog.value = false
      selectedInbound.value = null
    } else {
      console.error('Failed to delete inbound')
    }
  } catch (error) {
    console.error('Failed to delete inbound:', error)
  } finally {
    deleteLoading.value = false
  }
}

const exportInbound = async (inbound: Inbound) => {
  if (!inbound.id) return
  
  selectedInbound.value = inbound
  exportDialog.value = true
  
  try {
    const response = await userStore.authorizedFetch(
      `/api/inbounds/${inbound.id}/export?type=${exportType.value}`
    )
    
    if (response.ok) {
      const config = await response.json()
      exportedConfig.value = JSON.stringify(config, null, 2)
    } else {
      console.error('Failed to export inbound')
    }
  } catch (error) {
    console.error('Failed to export inbound:', error)
  }
}

const copyToClipboard = async () => {
  if (exportedConfig.value) {
    try {
      await navigator.clipboard.writeText(exportedConfig.value)
      // Could show a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }
}

// Lifecycle
onMounted(() => {
  loadInbounds()
})
</script>

<style scoped lang="scss">
@use './index.scss';

.inbound-item {
  cursor: pointer;
  
  &:hover {
    background-color: rgba(var(--v-theme-primary), 0.04);
  }
}
</style>
