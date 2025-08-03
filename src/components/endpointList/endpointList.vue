<template>
  <v-container class="endpoint-list">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon class="me-2">mdi-vpn</v-icon>
          Endpoints
        </div>
        <v-btn
          color="primary"
          variant="elevated"
          @click="$emit('create')"
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
          v-else-if="!loading && (!endpoints || endpoints.length === 0)"
          headline="No endpoints found"
          title="Start by creating your first endpoint"
          text="Endpoints define network connection configurations like WireGuard tunnels."
        >
          <template #actions>
            <v-btn
              color="primary"
              variant="elevated"
              @click="$emit('create')"
              prepend-icon="mdi-plus"
            >
              Create First Endpoint
            </v-btn>
          </template>
        </v-empty-state>

        <!-- Endpoints List -->
        <v-list v-else>
          <v-list-item
            v-for="endpoint in endpoints"
            :key="endpoint.id"
            class="endpoint-item"
            @click="$emit('edit', endpoint)"
          >
            <template #prepend>
              <v-avatar
                :color="getEndpointTypeColor(endpoint.type)"
                class="text-white"
              >
                <v-icon>{{ getEndpointTypeIcon(endpoint.type) }}</v-icon>
              </v-avatar>
            </template>

            <v-list-item-title class="text-h6">
              {{ getEndpointDisplayName(endpoint) }}
            </v-list-item-title>

            <v-list-item-subtitle>
              <div class="d-flex flex-column">
                <span class="text-caption mb-1">
                  Type: {{ getTypeDisplayName(endpoint.type) }}
                  <v-chip
                    v-if="endpoint.type === 'wireguard' && endpoint.system"
                    size="x-small"
                    variant="outlined"
                    class="ms-2"
                  >
                    System Interface
                  </v-chip>
                </span>
                <span v-if="endpoint.type === 'wireguard' && endpoint.addresses" class="text-caption">
                  {{ endpoint.addresses[0] }}{{ endpoint.addresses.length > 1 ? ` +${endpoint.addresses.length - 1} more` : '' }}
                </span>
                <span v-if="endpoint.type === 'wireguard' && endpoint.mtu" class="text-caption">
                  MTU: {{ endpoint.mtu }}
                </span>
                <span v-if="endpoint.type === 'wireguard' && endpoint.peers" class="text-caption">
                  Peers: {{ endpoint.peers.length }}
                </span>
              </div>
            </v-list-item-subtitle>

            <template #append>
              <div class="d-flex align-center">
                <v-chip
                  v-if="endpoint.share"
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
                      @click="$emit('edit', endpoint)"
                      prepend-icon="mdi-pencil"
                    >
                      Edit
                    </v-list-item>
                    <v-list-item
                      @click="handleExport(endpoint)"
                      prepend-icon="mdi-export"
                    >
                      Export
                    </v-list-item>
                    <v-list-item
                      @click="confirmDelete(endpoint)"
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
          Are you sure you want to delete endpoint "{{ getEndpointDisplayName(endpointToDelete) }}"?
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
            @click="deleteEndpoint"
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
            :items="exportFormats"
            item-title="title"
            item-value="value"
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
import { ref } from 'vue'
import type { Endpoint, Props, EmitEvents, ExportFormat } from './types'
import { getEndpointTypeIcon, getEndpointTypeColor, exportFormats } from './types'

// Props and emits
const props = withDefaults(defineProps<Props>(), {
  endpoints: () => [],
  loading: false
})

const emit = defineEmits<EmitEvents & { create: [] }>()

// Reactive data
const deleteDialog = ref(false)
const deleteLoading = ref(false)
const exportDialog = ref(false)
const endpointToDelete = ref<Endpoint | null>(null)
const selectedEndpoint = ref<Endpoint | null>(null)
const exportType = ref<ExportFormat>('sing-box')
const exportedConfig = ref('')

// Helper functions for display
const getEndpointDisplayName = (endpoint: Endpoint | null): string => {
  if (!endpoint) return 'Unknown'
  
  if (endpoint.type === 'wireguard') {
    return `${endpoint.name}${endpoint.system ? ' (System)' : ''}`
  }
  
  return endpoint.name
}

const getTypeDisplayName = (type: string): string => {
  switch (type) {
    case 'wireguard':
      return 'WireGuard'
    default:
      return type.charAt(0).toUpperCase() + type.slice(1)
  }
}

// Action handlers
const confirmDelete = (endpoint: Endpoint) => {
  endpointToDelete.value = endpoint
  deleteDialog.value = true
}

const deleteEndpoint = async () => {
  if (!endpointToDelete.value) return
  
  deleteLoading.value = true
  try {
    emit('delete', endpointToDelete.value)
    deleteDialog.value = false
    endpointToDelete.value = null
  } catch (error) {
    console.error('Failed to delete endpoint:', error)
  } finally {
    deleteLoading.value = false
  }
}

const handleExport = async (endpoint: Endpoint) => {
  selectedEndpoint.value = endpoint
  exportDialog.value = true
  
  try {
    // This will be handled by the parent component
    emit('export', endpoint, exportType.value)
    
    // For now, just show a placeholder config
    exportedConfig.value = JSON.stringify({
      type: endpoint.type,
      name: endpoint.name,
      // Add more config based on endpoint type
    }, null, 2)
  } catch (error) {
    console.error('Failed to export endpoint:', error)
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
</script>

<style scoped lang="scss">
@use './index.scss';

.endpoint-item {
  cursor: pointer;
  
  &:hover {
    background-color: rgba(var(--v-theme-primary), 0.04);
  }
}
</style>
