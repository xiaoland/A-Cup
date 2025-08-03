<template>
  <v-container class="dns-rule-list">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon class="me-2">mdi-dns-outline</v-icon>
          DNS Rules
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
          v-else-if="!loading && dnsRules.length === 0"
          headline="No DNS rules found"
          title="Start by creating your first DNS rule"
          text="DNS rules control how domain names are resolved in your proxy system."
        >
          <template #actions>
            <v-btn
              color="primary"
              variant="elevated"
              @click="$emit('create')"
              prepend-icon="mdi-plus"
            >
              Create First DNS Rule
            </v-btn>
          </template>
        </v-empty-state>

        <!-- DNS Rule List -->
        <v-list v-else>
          <v-list-item
            v-for="rule in dnsRules"
            :key="rule.id"
            class="rule-item"
            @click="$emit('edit', rule)"
          >
            <template #prepend>
              <v-avatar
                :color="getActionColor(rule.action)"
                class="text-white"
              >
                <v-icon>{{ getActionIcon(rule.action) }}</v-icon>
              </v-avatar>
            </template>

            <v-list-item-title class="text-h6">
              {{ rule.name }}
            </v-list-item-title>

            <v-list-item-subtitle>
              <div class="d-flex flex-column">
                <span class="text-caption mb-1">
                  Action: {{ getActionDisplayName(rule.action) }}
                  <v-chip
                    v-if="!rule.action || rule.action === 'route'"
                    size="x-small"
                    variant="outlined"
                    color="primary"
                    class="ms-2"
                  >
                    → Server {{ rule.server }}
                  </v-chip>
                </span>
                <span class="text-caption">
                  {{ getConditionsText(rule) }}
                </span>
              </div>
            </v-list-item-subtitle>

            <template #append>
              <div class="d-flex align-center">
                <v-chip
                  v-if="rule.share"
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
                      @click="$emit('edit', rule)"
                      prepend-icon="mdi-pencil"
                      :disabled="rule.owner !== currentUserId"
                    >
                      Edit
                    </v-list-item>
                    <v-list-item
                      @click="exportRule(rule)"
                      prepend-icon="mdi-export"
                    >
                      Export
                    </v-list-item>
                    <v-list-item
                      @click="confirmDelete(rule)"
                      prepend-icon="mdi-delete"
                      class="text-error"
                      :disabled="rule.owner !== currentUserId"
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
          Are you sure you want to delete DNS rule "{{ ruleToDelete?.name }}"?
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
            @click="deleteRule"
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
import type { DNSRule } from './types'

// Emits
const emit = defineEmits<{
  create: []
  edit: [rule: DNSRule]
}>()

// Stores
const userStore = useUserStore()

// Reactive data
const loading = ref(false)
const dnsRules = ref<DNSRule[]>([])
const deleteDialog = ref(false)
const ruleToDelete = ref<DNSRule | null>(null)
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
const getActionDisplayName = (action?: string): string => {
  if (!action) return 'Default'
  const displayNames: Record<string, string> = {
    'route': 'Route',
    'reject': 'Reject'
  }
  return displayNames[action] || action.toUpperCase()
}

const getActionColor = (action?: string): string => {
  if (!action) return 'grey'
  switch (action) {
    case 'route':
      return 'primary'
    case 'reject':
      return 'error'
    default:
      return 'grey'
  }
}

const getActionIcon = (action?: string): string => {
  if (!action) return 'mdi-dns-outline'
  switch (action) {
    case 'route':
      return 'mdi-arrow-right'
    case 'reject':
      return 'mdi-block-helper'
    default:
      return 'mdi-dns-outline'
  }
}

const getConditionsText = (rule: DNSRule): string => {
  const conditions: string[] = []
  
  if (rule.domains && rule.domains.length > 0) {
    conditions.push(`Domains: ${rule.domains.join(', ')}`)
  }
  if (rule.domain_suffixes && rule.domain_suffixes.length > 0) {
    conditions.push(`Suffixes: ${rule.domain_suffixes.join(', ')}`)
  }
  if (rule.domain_keywords && rule.domain_keywords.length > 0) {
    conditions.push(`Keywords: ${rule.domain_keywords.join(', ')}`)
  }
  if (rule.rule_sets && rule.rule_sets.length > 0) {
    conditions.push(`Rule Sets: ${rule.rule_sets.join(', ')}`)
  }
  
  return conditions.length > 0 ? conditions.join(' | ') : 'No conditions'
}

// Methods
const loadDNSRules = async () => {
  try {
    loading.value = true
    const response = await fetch('/api/dns_rules', {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    
    if (response.ok) {
      dnsRules.value = await response.json()
    } else {
      console.error('Failed to load DNS rules:', await response.text())
    }
  } catch (error) {
    console.error('Error loading DNS rules:', error)
  } finally {
    loading.value = false
  }
}

const confirmDelete = (rule: DNSRule) => {
  ruleToDelete.value = rule
  deleteDialog.value = true
}

const deleteRule = async () => {
  if (!ruleToDelete.value?.id) return
  
  deleting.value = true
  try {
    const response = await fetch(`/api/dns_rules/${ruleToDelete.value.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    
    if (response.ok) {
      await loadDNSRules() // Reload the list
      deleteDialog.value = false
      ruleToDelete.value = null
    } else {
      const error = await response.text()
      console.error(`Failed to delete DNS rule: ${error}`)
    }
  } catch (error) {
    console.error('Error deleting DNS rule:', error)
  } finally {
    deleting.value = false
  }
}

const exportRule = async (rule: DNSRule) => {
  if (!rule.id) return
  
  ruleToDelete.value = rule
  exportDialog.value = true
  
  try {
    const response = await fetch(`/api/dns_rules/${rule.id}/export?type=${exportType.value}`, {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    
    if (response.ok) {
      const config = await response.json()
      exportedConfig.value = JSON.stringify(config, null, 2)
    } else {
      const error = await response.text()
      console.error(`Failed to export DNS rule: ${error}`)
    }
  } catch (error) {
    console.error('Error exporting DNS rule:', error)
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
  loadDNSRules()
})

// Expose refresh method for parent components
defineExpose({
  refresh: loadDNSRules
})
</script>

<style scoped lang="scss">
@use './index.scss';

.rule-item {
  cursor: pointer;
  
  &:hover {
    background-color: rgba(var(--v-theme-primary), 0.04);
  }
}
</style>
