<template>
  <div class="rule-set-list">
    <Card>
      <template #title>
        <div class="flex justify-between items-center">
          <div class="text-2xl font-bold flex items-center">
            <span class="i-mdi-file-document-outline mr-2" />
            Rule Sets
          </div>
          <Button
            label="Create New"
            icon="i-mdi-plus"
            @click="createRuleSet"
          />
        </div>
      </template>
      <template #content>
        <DataTable
          :value="ruleSets"
          :loading="loading"
          data-key="id"
          class="p-datatable-sm"
        >
          <template #empty>
            <div class="text-center p-4">
              <span class="i-mdi-file-document-outline text-6xl text-gray-400" />
              <h3 class="text-xl font-bold mt-4">No rule sets found</h3>
              <p class="text-gray-500">Start by creating your first rule set</p>
              <Button
                label="Create First Rule Set"
                icon="i-mdi-plus"
                class="mt-4"
                @click="createRuleSet"
              />
            </div>
          </template>

          <Column field="name" header="Name" sortable></Column>
          <Column field="type" header="Type" sortable>
             <template #body="slotProps">
              <Tag :value="slotProps.data.type" :severity="slotProps.data.type === 'remote' ? 'info' : 'success'" />
            </template>
          </Column>
          <Column header="Content">
            <template #body="slotProps">
              <span v-if="slotProps.data.type === 'remote' && slotProps.data.url" class="truncate">
                {{ truncateUrl(slotProps.data.url) }}
              </span>
              <span v-else-if="slotProps.data.type === 'inline' && slotProps.data.rules" class="text-gray-500">
                {{ slotProps.data.rules.length }} rules
              </span>
            </template>
          </Column>
          <Column header="Shared" field="share" sortable>
            <template #body="slotProps">
              <Tag v-if="slotProps.data.share" value="Shared" severity="success" icon="i-mdi-share-variant" />
            </template>
          </Column>
          <Column header="Actions" style="width: 10rem; text-align: right">
            <template #body="slotProps">
              <Button icon="i-mdi-pencil" text rounded @click="editRuleSet(slotProps.data.id)" />
              <Button icon="i-mdi-export" text rounded @click="showExportDialog(slotProps.data)" />
               <Menu ref="menu" :model="getMenuItems(slotProps.data)" :popup="true" />
                <Button
                    icon="i-mdi-dots-vertical"
                    text
                    rounded
                    @click="menu.toggle($event)"
                />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Export Dialog -->
    <Dialog v-model:visible="exportDialog.show" modal header="Export Rule Set" class="w-full max-w-lg">
      <div class="p-4 flex flex-col gap-4">
        <Select
          v-model="exportDialog.type"
          :options="exportTypes"
          placeholder="Select a format"
        />
        <Textarea
          v-model="exportDialog.content"
          readonly
          rows="15"
          class="w-full font-mono"
        />
      </div>
      <template #footer>
        <Button
          label="Close"
          severity="secondary"
          @click="exportDialog.show = false"
        />
        <Button
          label="Copy to Clipboard"
          icon="i-mdi-content-copy"
          @click="copyExportedContent"
          :loading="exportDialog.copying"
        />
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:visible="deleteDialog.show" modal header="Delete Rule Set" class="w-full max-w-md">
       <div class="p-4">
            Are you sure you want to delete the rule set "<strong>{{ deleteDialog.ruleSet?.name }}</strong>"? This action cannot be undone.
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
          @click="deleteRuleSet"
          :loading="deleteDialog.deleting"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRuleSetStore } from '@/stores/ruleSet'
import { useUserStore } from '@/stores/user'
import Button from 'primevue/button'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import Menu from 'primevue/menu'
import type { RuleSet } from './types'
import { exportTypes } from './types'

// Store and router
const userStore = useUserStore()
const ruleSetStore = useRuleSetStore()
const router = useRouter()
const menu = ref();

// State
const loading = ref(false)
const ruleSets = computed(() => ruleSetStore.ruleSets)

// Export dialog state
const exportDialog = ref({
  show: false,
  ruleSet: null as RuleSet | null,
  type: 'sing-box' as const,
  content: '',
  copying: false
})

// Delete dialog state
const deleteDialog = ref({
  show: false,
  ruleSet: null as RuleSet | null,
  deleting: false
})

// Load rule sets
const loadRuleSets = async () => {
  loading.value = true
  await ruleSetStore.fetchRuleSets()
  loading.value = false
}

// Navigation methods
const createRuleSet = () => {
  router.push('/rule-sets/create')
}

const editRuleSet = (id: number) => {
  router.push(`/rule-sets/edit/${id}`)
}

// Export functionality
const showExportDialog = async (ruleSet: RuleSet) => {
  exportDialog.value.ruleSet = ruleSet
  exportDialog.value.show = true
  
  try {
    const response = await userStore.authorizedFetch(
      `/api/rule_sets/${ruleSet.id}/export?type=${exportDialog.value.type}`
    )
    if (response.ok) {
      const exported = await response.json()
      exportDialog.value.content = JSON.stringify(exported, null, 2)
    }
  } catch (error) {
    console.error('Failed to export rule set:', error)
    exportDialog.value.content = 'Failed to export rule set'
  }
}

const copyExportedContent = async () => {
  exportDialog.value.copying = true
  try {
    await navigator.clipboard.writeText(exportDialog.value.content)
    // Show success message (you might want to add a toast/snackbar here)
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
  } finally {
    exportDialog.value.copying = false
  }
}

// Delete functionality
const showDeleteDialog = (ruleSet: RuleSet) => {
  deleteDialog.value.ruleSet = ruleSet
  deleteDialog.value.show = true
}

const deleteRuleSet = async () => {
  if (!deleteDialog.value.ruleSet) return
  
  deleteDialog.value.deleting = true
  await ruleSetStore.deleteRuleSet(deleteDialog.value.ruleSet.id)
  deleteDialog.value.deleting = false
  deleteDialog.value.show = false
}

// Duplicate functionality
const duplicateRuleSet = async (ruleSet: RuleSet): Promise<void> => {
  const { id, owner, ...ruleSetData } = ruleSet
  const duplicate = {
    ...ruleSetData,
    name: `${ruleSet.name} (Copy)`,
    share: false
  }
  await ruleSetStore.createRuleSet(duplicate)
}

const getMenuItems = (ruleSet: RuleSet) => {
    const items = [
        {
            label: 'Duplicate',
            icon: 'i-mdi-content-copy',
            command: () => {
                duplicateRuleSet(ruleSet)
            }
        }
    ];

    if (ruleSet.owner === userStore.user?.id) {
        items.push({
            label: 'Delete',
            icon: 'i-mdi-delete',
            command: () => showDeleteDialog(ruleSet),
        });
    }

    return items;
};


// Utility functions
const truncateUrl = (url: string, maxLength: number = 50) => {
  if (url.length <= maxLength) return url
  return url.substring(0, maxLength) + '...'
}

// Lifecycle
onMounted(() => {
  loadRuleSets()
})
</script>