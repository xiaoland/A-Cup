<template>
  <v-container class="dns-server-list">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon class="me-2">mdi-dns</v-icon>
          DNS Servers
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
          v-else-if="!loading && dnsServers.length === 0"
          headline="No DNS servers found"
          title="Start by creating your first DNS server"
          text="DNS servers define how domain names are resolved in your proxy system."
        >
          <template #actions>
            <v-btn
              color="primary"
              variant="elevated"
              @click="$emit('create')"
              prepend-icon="mdi-plus"
            >
              Create First DNS Server
            </v-btn>
          </template>
        </v-empty-state>

        <!-- DNS Server List -->
        <v-list v-else>
          <v-list-item
            v-for="server in dnsServers"
            :key="server.id"
            class="server-item"
            @click="$emit('edit', server)"
          >
            <template #prepend>
              <v-avatar
                :color="getTypeColor(server.type)"
                class="text-white"
              >
                <v-icon>{{ getTypeIcon(server.type) }}</v-icon>
              </v-avatar>
            </template>

            <v-list-item-title class="text-h6">
              {{ server.name }}
            </v-list-item-title>

            <v-list-item-subtitle>
              <div class="d-flex flex-column">
                <span class="text-caption mb-1">
                  Type: {{ getTypeDisplayName(server.type) }}
                  <v-chip
                    v-if="server.tls && Object.keys(server.tls).length > 0"
                    size="x-small"
                    variant="outlined"
                    color="green"
                    class="ms-2"
                  >
                    TLS
                  </v-chip>
                </span>
                <span class="text-caption">
                  {{ server.address }}{{ server.port ? ':' + server.port : '' }}
                </span>
                <span v-if="server.outbound_detour" class="text-caption">
                  Via Outbound {{ server.outbound_detour }}
                </span>
                <span v-if="server.wg_endpoint_detour" class="text-caption">
                  Via WireGuard Endpoint {{ server.wg_endpoint_detour }}
                </span>
              </div>
            </v-list-item-subtitle>

            <template #append>
              <div class="d-flex align-center">
                <v-chip
                  v-if="server.share"
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
                      @click="$emit('edit', server)"
                      prepend-icon="mdi-pencil"
                      :disabled="server.owner !== currentUserId"
                    >
                      Edit
                    </v-list-item>
                    <v-list-item
                      @click="exportServer(server)"
                      prepend-icon="mdi-export"
                    >
                      Export
                    </v-list-item>
                    <v-list-item
                      @click="confirmDelete(server)"
                      prepend-icon="mdi-delete"
                      class="text-error"
                      :disabled="server.owner !== currentUserId"
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
          Are you sure you want to delete DNS server "{{ serverToDelete?.name }}"?
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
            @click="deleteServer"
            :loading="deleting"
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
import { useUserStore } from '@/stores/user'
import type { DNSServer } from './types'

// Emits
const emit = defineEmits<{
  create: []
  edit: [server: DNSServer]
}>()

// Stores
const userStore = useUserStore()

// Reactive data
const loading = ref(false)
const dnsServers = ref<DNSServer[]>([])
const deleteDialog = ref(false)
const serverToDelete = ref<DNSServer | null>(null)
const deleting = ref(false)
const exportDialog = ref(false)
const exportedConfig = ref('')
const exportType = ref('sing-box')

// Export types
const exportTypes = [
  { title: 'Sing-Box', value: 'sing-box' }
]

// Computed
const currentUserId = computed(() => userStore.user?.id)

// Helper functions for display
const getTypeDisplayName = (type: string): string => {
  const displayNames: Record<string, string> = {
    'udp': 'UDP',
    'https': 'HTTPS',
    'http3': 'HTTP/3',
    'quic': 'QUIC',
    'tls': 'TLS'
  }
  return displayNames[type] || type.toUpperCase()
}

const getTypeColor = (type: string): string => {
  switch (type) {
    case 'udp':
      return 'blue'
    case 'https':
      return 'green'
    case 'http3':
      return 'purple'
    case 'quic':
      return 'orange'
    case 'tls':
      return 'teal'
    default:
      return 'grey'
  }
}

const getTypeIcon = (type: string): string => {
  switch (type) {
    case 'udp':
      return 'mdi-protocol'
    case 'https':
      return 'mdi-lock'
    case 'http3':
      return 'mdi-web'
    case 'quic':
      return 'mdi-speedometer'
    case 'tls':
      return 'mdi-shield-lock'
    default:
      return 'mdi-dns'
  }
}

// Methods
const loadDNSServers = async () => {
  try {
    loading.value = true
    const response = await fetch('/api/dns_servers', {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    
    if (response.ok) {
      dnsServers.value = await response.json()
    } else {
      console.error('Failed to load DNS servers:', await response.text())
    }
  } catch (error) {
    console.error('Error loading DNS servers:', error)
  } finally {
    loading.value = false
  }
}

const confirmDelete = (server: DNSServer) => {
  serverToDelete.value = server
  deleteDialog.value = true
}

const deleteServer = async () => {
  if (!serverToDelete.value?.id) return
  
  deleting.value = true
  try {
    const response = await fetch(`/api/dns_servers/${serverToDelete.value.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    
    if (response.ok) {
      await loadDNSServers() // Reload the list
      deleteDialog.value = false
      serverToDelete.value = null
    } else {
      const error = await response.text()
      console.error(`Failed to delete DNS server: ${error}`)
    }
  } catch (error) {
    console.error('Error deleting DNS server:', error)
  } finally {
    deleting.value = false
  }
}

const exportServer = async (server: DNSServer) => {
  if (!server.id) return
  
  serverToDelete.value = server
  exportDialog.value = true
  
  try {
    const response = await fetch(`/api/dns_servers/${server.id}/export?type=${exportType.value}`, {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    
    if (response.ok) {
      const config = await response.json()
      exportedConfig.value = JSON.stringify(config, null, 2)
    } else {
      const error = await response.text()
      console.error(`Failed to export DNS server: ${error}`)
    }
  } catch (error) {
    console.error('Error exporting DNS server:', error)
  }
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(exportedConfig.value)
    // You might want to show a toast notification here
    console.log('Configuration copied to clipboard')
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
  }
}

// Lifecycle
onMounted(() => {
  loadDNSServers()
})

// Expose refresh method for parent components
defineExpose({
  refresh: loadDNSServers
})
</script>

<style scoped lang="scss">
@use './index.scss';

.server-item {
  cursor: pointer;
  
  &:hover {
    background-color: rgba(var(--v-theme-primary), 0.04);
  }
}
</style>
