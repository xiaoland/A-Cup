<template>
  <div class="outbound-list">
    <Card>
      <template #title>
        <div class="flex justify-between items-center">
          <div class="text-2xl font-bold flex items-center">
            <span class="i-mdi-server-network mr-2" />
            Outbounds
          </div>
          <Button
            label="Create New"
            icon="i-mdi-plus"
            @click="createOutbound"
          />
        </div>
      </template>
      <template #content>
        <DataTable
          :value="outbounds"
          :loading="loading"
          data-key="id"
          class="p-datatable-sm"
        >
          <template #empty>
            <div class="text-center p-4">
              <span class="i-mdi-server-network text-6xl text-gray-400" />
              <h3 class="text-xl font-bold mt-4">No outbounds found</h3>
              <p class="text-gray-500">Start by creating your first outbound</p>
              <Button
                label="Create First Outbound"
                icon="i-mdi-plus"
                class="mt-4"
                @click="createOutbound"
              />
            </div>
          </template>

          <Column field="name" header="Name" sortable>
            <template #body="slotProps">
              {{ getOutboundDisplayName(slotProps.data) }}
            </template>
          </Column>
          <Column field="type" header="Type" sortable>
            <template #body="slotProps">
              <Tag :value="getTypeDisplayName(slotProps.data.type)" :severity="getTypeSeverity(slotProps.data.type)" />
            </template>
          </Column>
          <Column field="server" header="Server" sortable>
             <template #body="slotProps">
              <span v-if="slotProps.data.server">{{ slotProps.data.server }}{{ slotProps.data.server_port ? `:${slotProps.data.server_port}` : '' }}</span>
            </template>
          </Column>
          <Column field="region" header="Region" sortable>
            <template #body="slotProps">
              <span v-if="slotProps.data.region">{{ getRegionDisplayName(slotProps.data.region) }}</span>
            </template>
          </Column>
          <Column header="Actions" style="width: 10rem; text-align: right">
            <template #body="slotProps">
              <Button icon="i-mdi-pencil" text rounded @click="editOutbound(slotProps.data)" />
              <Button icon="i-mdi-export" text rounded @click="exportOutbound(slotProps.data)" />
              <Button icon="i-mdi-delete" severity="danger" text rounded @click="deleteOutbound(slotProps.data)" />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="deleteDialog"
      modal
      header="Confirm Delete"
      class="w-full max-w-md"
    >
        <div class="p-4">
            Are you sure you want to delete outbound "{{ selectedOutbound?.name || `${selectedOutbound?.type}.${selectedOutbound?.region}` }}"? This action cannot be undone.
        </div>
      <template #footer>
        <Button
          label="Cancel"
          severity="secondary"
          @click="deleteDialog = false"
        />
        <Button
          label="Delete"
          severity="danger"
          @click="confirmDelete"
          :loading="deleteLoading"
        />
      </template>
    </Dialog>

    <!-- Export Dialog -->
    <Dialog
      v-model:visible="exportDialog"
      modal
      header="Export Configuration"
      class="w-full max-w-lg"
    >
      <div class="p-4 flex flex-col gap-4">
        <Select
          v-model="exportType"
          :options="exportTypes"
          placeholder="Select a format"
        />
        <Textarea
          v-if="exportedConfig"
          :model-value="exportedConfig"
          readonly
          rows="15"
          class="w-full"
        />
      </div>
      <template #footer>
        <Button
          label="Close"
          severity="secondary"
          @click="exportDialog = false"
        />
        <Button
          v-if="exportedConfig"
          label="Copy to Clipboard"
          icon="i-mdi-content-copy"
          @click="copyToClipboard"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOutboundStore } from '@/stores/outbound'
import { useUserStore } from '@/stores/user'
import Button from 'primevue/button'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
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

const getTypeSeverity = (type: string) => {
  const severities: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'secondary' | undefined> = {
    'direct': 'secondary',
    'urltest': 'info',
    'selector': 'success',
    'vmess': 'warning',
    'vless': 'warning',
    'ss': 'warning',
    'hysteria2': 'danger'
  };
  return severities[type] || 'primary';
};

// Load data on component mount
onMounted(() => {
  loadOutbounds()
})
</script>