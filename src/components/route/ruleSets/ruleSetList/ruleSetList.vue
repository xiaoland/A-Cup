<template>
  <v-container class="rule-set-list">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon class="me-2">mdi-file-document-outline</v-icon>
          Rule Sets
        </div>
        <v-btn
          color="primary"
          variant="elevated"
          @click="createRuleSet"
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
          v-else-if="!loading && ruleSets.length === 0"
          headline="No rule sets found"
          title="Start by creating your first rule set"
          text="Rule sets define collections of rules that can be used in route rules for traffic matching."
        >
          <template #actions>
            <v-btn
              color="primary"
              variant="elevated"
              @click="createRuleSet"
              prepend-icon="mdi-plus"
            >
              Create First Rule Set
            </v-btn>
          </template>
        </v-empty-state>

        <!-- Rule Sets List -->
        <v-list v-else>
          <v-list-item
            v-for="ruleSet in ruleSets"
            :key="ruleSet.id"
            class="mb-2"
            @click="editRuleSet(ruleSet.id)"
          >
            <template #prepend>
              <v-avatar color="blue-lighten-1" class="me-3">
                <v-icon>
                  {{ ruleSet.type === 'remote' ? 'mdi-cloud-download' : 'mdi-file-document-edit' }}
                </v-icon>
              </v-avatar>
            </template>

            <v-list-item-title class="text-h6">
              {{ ruleSet.name }}
              <v-chip
                v-if="ruleSet.share"
                size="small"
                color="green"
                variant="flat"
                class="ms-2"
              >
                <v-icon start size="small">mdi-share-variant</v-icon>
                Shared
              </v-chip>
            </v-list-item-title>

            <v-list-item-subtitle class="mt-1">
              <div class="d-flex align-center">
                <v-chip
                  size="small"
                  :color="ruleSet.type === 'remote' ? 'blue' : 'purple'"
                  variant="tonal"
                  class="me-2"
                >
                  {{ ruleSet.type === 'remote' ? 'Remote' : 'Inline' }}
                </v-chip>
                
                <span v-if="ruleSet.type === 'remote' && ruleSet.url" class="text-medium-emphasis">
                  {{ truncateUrl(ruleSet.url) }}
                </span>
                <span v-else-if="ruleSet.type === 'inline' && ruleSet.rules" class="text-medium-emphasis">
                  {{ ruleSet.rules.length }} rules
                </span>
              </div>
            </v-list-item-subtitle>

            <template #append>
              <div class="d-flex align-center">
                <!-- Export Button -->
                <v-btn
                  icon="mdi-download"
                  variant="text"
                  size="small"
                  @click.stop="showExportDialog(ruleSet)"
                >
                  <v-icon>mdi-download</v-icon>
                  <v-tooltip activator="parent">Export</v-tooltip>
                </v-btn>

                <!-- Delete Button -->
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  size="small"
                  color="error"
                  @click.stop="showDeleteDialog(ruleSet)"
                  v-if="ruleSet.owner === userStore.user?.id"
                >
                  <v-icon>mdi-delete</v-icon>
                  <v-tooltip activator="parent">Delete</v-tooltip>
                </v-btn>

                <!-- Menu Button -->
                <v-menu>
                  <template #activator="{ props }">
                    <v-btn
                      icon="mdi-dots-vertical"
                      variant="text"
                      size="small"
                      v-bind="props"
                      @click.stop
                    />
                  </template>
                  <v-list>
                    <v-list-item @click="editRuleSet(ruleSet.id)">
                      <v-list-item-title>
                        <v-icon class="me-2">mdi-pencil</v-icon>
                        Edit
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="duplicateRuleSet(ruleSet)">
                      <v-list-item-title>
                        <v-icon class="me-2">mdi-content-copy</v-icon>
                        Duplicate
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <!-- Export Dialog -->
    <v-dialog v-model="exportDialog.show" max-width="800">
      <v-card>
        <v-card-title>
          <v-icon class="me-2">mdi-download</v-icon>
          Export Rule Set: {{ exportDialog.ruleSet?.name }}
        </v-card-title>
        
        <v-card-text>
          <v-select
            v-model="exportDialog.type"
            :items="exportTypes"
            label="Export Format"
            variant="outlined"
          />
          
          <v-textarea
            v-model="exportDialog.content"
            label="Exported Configuration"
            readonly
            rows="15"
            variant="outlined"
            class="mt-4"
          />
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="exportDialog.show = false"
          >
            Close
          </v-btn>
          <v-btn
            color="primary"
            @click="copyExportedContent"
            :loading="exportDialog.copying"
          >
            Copy to Clipboard
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog.show" max-width="500">
      <v-card>
        <v-card-title>
          <v-icon class="me-2" color="error">mdi-delete</v-icon>
          Delete Rule Set
        </v-card-title>
        
        <v-card-text>
          Are you sure you want to delete the rule set "<strong>{{ deleteDialog.ruleSet?.name }}</strong>"?
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
            @click="deleteRuleSet"
            :loading="deleteDialog.deleting"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { RuleSet } from './types'
import { exportTypes } from './types'
import { useUserStore } from '@/stores/user'

// Store and router
const userStore = useUserStore()
const router = useRouter()

// State
const loading = ref(false)
const ruleSets = ref<RuleSet[]>([])

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
  try {
    const response = await userStore.authorizedFetch('/api/rule_sets')
    if (response.ok) {
      ruleSets.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to load rule sets:', error)
  } finally {
    loading.value = false
  }
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
  try {
    const response = await userStore.authorizedFetch(
      `/api/rule_sets/${deleteDialog.value.ruleSet.id}`, 
      { method: 'DELETE' }
    )
    
    if (response.ok) {
      // Remove from local list
      ruleSets.value = ruleSets.value.filter(rs => rs.id !== deleteDialog.value.ruleSet?.id)
      deleteDialog.value.show = false
    }
  } catch (error) {
    console.error('Failed to delete rule set:', error)
  } finally {
    deleteDialog.value.deleting = false
  }
}

// Duplicate functionality
const duplicateRuleSet = async (ruleSet: RuleSet) => {
  try {
    const { id, owner, ...ruleSetData } = ruleSet
    const duplicate = {
      ...ruleSetData,
      name: `${ruleSet.name} (Copy)`,
      share: false
    }
    
    const response = await userStore.authorizedFetch('/api/rule_sets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(duplicate)
    })
    
    if (response.ok) {
      // Reload the list to show the new duplicate
      loadRuleSets()
    }
  } catch (error) {
    console.error('Failed to duplicate rule set:', error)
  }
}

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

<style scoped lang="scss">
@use './index.scss';
</style>
