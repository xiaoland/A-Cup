<template>
  <v-container class="outbound-list">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon class="me-2">mdi-server-network</v-icon>
          Outbounds
        </div>
        <v-btn
          color="primary"
          variant="elevated"
          @click="createOutbound"
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
          v-else-if="!loading && outbounds.length === 0"
          headline="No outbounds found"
          title="Start by creating your first outbound"
          text="Outbounds define proxy server configurations for routing your traffic."
        >
          <template #actions>
            <v-btn
              color="primary"
              variant="elevated"
              @click="createOutbound"
              prepend-icon="mdi-plus"
            >
              Create First Outbound
            </v-btn>
          </template>
        </v-empty-state>

        <!-- Outbounds List -->
        <v-list v-else>
          <v-list-item
            v-for="outbound in outbounds"
            :key="outbound.id"
            class="outbound-item"
            @click="editOutbound(outbound)"
          >
            <template #prepend>
              <v-avatar
                :color="getTypeColor(outbound.type)"
                class="text-white"
              >
                <v-icon>{{ getTypeIcon(outbound.type) }}</v-icon>
              </v-avatar>
            </template>

            <v-list-item-title class="text-h6">
              {{ getOutboundDisplayName(outbound) }}
            </v-list-item-title>

            <v-list-item-subtitle>
              <div class="d-flex flex-column">
                <span class="text-caption mb-1">
                  Type: {{ getTypeDisplayName(outbound.type) }}
                  <v-chip
                    v-if="outbound.region"
                    size="x-small"
                    variant="outlined"
                    class="ms-2"
                  >
                    {{ getRegionDisplayName(outbound.region) }}
                  </v-chip>
                </span>
                <span v-if="outbound.server" class="text-caption">
                  {{ outbound.server }}{{ outbound.server_port ? `:${outbound.server_port}` : '' }}
                </span>
              </div>
            </v-list-item-subtitle>

            <template #append>
              <div class="d-flex align-center">
                
                
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
                      @click="editOutbound(outbound)"
                      prepend-icon="mdi-pencil"
                    >
                      Edit
                    </v-list-item>
                    <v-list-item
                      @click="exportOutbound(outbound)"
                      prepend-icon="mdi-export"
                    >
                      Export
                    </v-list-item>
                    <v-list-item
                      @click="deleteOutbound(outbound)"
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
          Are you sure you want to delete outbound "{{ selectedOutbound?.name || `${selectedOutbound?.type}.${selectedOutbound?.region}` }}"?
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOutboundStore } from '@/stores/outbound'
import { useUserStore } from '@/stores/user'
import type { Outbound } from '../outboundEditor/types'
import { typeOptions, regionOptions } from '../outboundEditor/types'
import { exportTypes, type ExportType } from './types'

const router = useRouter()
const outboundStore = useOutboundStore()
const userStore = useUserStore()

// Reactive state
const outbounds = computed(() => outboundStore.outbounds)
const loading = ref(false)
const deleteDialog = ref(false)
const deleteLoading = ref(false)
const exportDialog = ref(false)
const selectedOutbound = ref<Outbound | null>(null)
const exportType = ref<ExportType>('sing-box')
const exportedConfig = ref('')

// Load outbounds from API
const loadOutbounds = async () => {
  loading.value = true
  await outboundStore.fetchOutbounds()
  loading.value = false
}

// Navigate to create new outbound
const createOutbound = () => {
  router.push('/outbounds/create')
}

// Navigate to edit outbound
const editOutbound = (outbound: Outbound) => {
  router.push(`/outbounds/edit/${outbound.id}`)
}

// Show delete confirmation
const deleteOutbound = (outbound: Outbound) => {
  selectedOutbound.value = outbound
  deleteDialog.value = true
}

// Confirm delete action
const confirmDelete = async () => {
  if (!selectedOutbound.value?.id) return
  
  deleteLoading.value = true
  await outboundStore.deleteOutbound(selectedOutbound.value.id)
  deleteLoading.value = false
  deleteDialog.value = false
  selectedOutbound.value = null
}

// Export outbound configuration
const exportOutbound = async (outbound: Outbound) => {
  selectedOutbound.value = outbound
  exportDialog.value = true
  
  try {
    const response = await userStore.authorizedFetch(`/api/outbounds/${outbound.id}/export?type=${exportType.value}`)
    
    if (response.ok) {
      const config = await response.json()
      exportedConfig.value = JSON.stringify(config, null, 2)
    } else {
      console.error('Failed to export outbound')
    }
  } catch (error) {
    console.error('Error exporting outbound:', error)
  }
}

// Copy configuration to clipboard
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(exportedConfig.value)
    // You might want to show a success message here
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
  }
}

// Helper functions
const getTypeDisplayName = (type: string): string => {
  const option = typeOptions.find((opt: any) => opt.value === type)
  return option?.title || type
}

const getRegionDisplayName = (region: string): string => {
  const option = regionOptions.find((opt: any) => opt.value === region)
  return option?.title || region
}

const getOutboundDisplayName = (outbound: Outbound): string => {
  if (outbound.name) {
    return outbound.name
  }
  if (outbound.region) {
    return `${outbound.type}.${outbound.region}`
  }
  return outbound.type
}

const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    'direct': 'grey',
    'urltest': 'blue',
    'selector': 'green',
    'vmess': 'purple',
    'vless': 'indigo',
    'ss': 'orange',
    'hysteria2': 'red'
  }
  return colors[type] || 'primary'
}

const getTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'direct': 'mdi-arrow-right',
    'urltest': 'mdi-speedometer',
    'selector': 'mdi-format-list-bulleted',
    'vmess': 'mdi-shield-outline',
    'vless': 'mdi-shield',
    'ss': 'mdi-shield-check',
    'hysteria2': 'mdi-rocket'
  }
  return icons[type] || 'mdi-server'
}

// Load data on component mount
onMounted(() => {
  loadOutbounds()
})
</script>

<style lang="scss" scoped>
@use './index.scss';
</style>
