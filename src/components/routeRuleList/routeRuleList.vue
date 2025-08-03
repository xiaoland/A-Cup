<template>
  <v-container class="route-rule-list">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon class="me-2">mdi-routes</v-icon>
          Route Rules
        </div>
        <v-btn
          color="primary"
          variant="elevated"
          @click="createRouteRule"
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
          v-else-if="!loading && routeRules.length === 0"
          headline="No route rules found"
          title="Start by creating your first route rule"
          text="Route rules define how traffic should be routed based on domain matching conditions."
        >
          <template #actions>
            <v-btn
              color="primary"
              variant="elevated"
              @click="createRouteRule"
              prepend-icon="mdi-plus"
            >
              Create First Route Rule
            </v-btn>
          </template>
        </v-empty-state>

        <!-- Route Rules List -->
        <v-list v-else>
          <v-list-item
            v-for="routeRule in routeRules"
            :key="routeRule.id"
            class="route-rule-item"
            @click="editRouteRule(routeRule)"
          >
            <template #prepend>
              <v-avatar
                :color="getActionColor(routeRule.action)"
                class="text-white"
              >
                <v-icon>{{ getActionIcon(routeRule.action) }}</v-icon>
              </v-avatar>
            </template>

            <v-list-item-title class="text-h6">
              {{ routeRule.name }}
            </v-list-item-title>

            <v-list-item-subtitle>
              <div class="d-flex flex-column">
                <span class="text-caption mb-1">
                  Action: {{ getActionDisplayName(routeRule.action) }}
                  <v-chip
                    v-if="routeRule.action === 'route' && routeRule.outbound"
                    size="x-small"
                    variant="outlined"
                    class="ms-2"
                  >
                    Outbound: {{ routeRule.outbound }}
                  </v-chip>
                </span>
                <span class="text-caption">
                  {{ getMatchingConditionsText(routeRule) }}
                </span>
              </div>
            </v-list-item-subtitle>

            <template #append>
              <div class="d-flex align-center">
                <v-chip
                  v-if="routeRule.share"
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
                      @click="editRouteRule(routeRule)"
                      prepend-icon="mdi-pencil"
                    >
                      Edit
                    </v-list-item>
                    <v-list-item
                      @click="exportRouteRule(routeRule)"
                      prepend-icon="mdi-export"
                    >
                      Export
                    </v-list-item>
                    <v-list-item
                      @click="deleteRouteRule(routeRule)"
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
          Are you sure you want to delete route rule "{{ selectedRouteRule?.name }}"?
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
import type { RouteRule, ExportType } from './types'
import { actionOptions, exportTypes } from './types'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// Reactive state
const routeRules = ref<RouteRule[]>([])
const loading = ref(false)
const deleteDialog = ref(false)
const deleteLoading = ref(false)
const exportDialog = ref(false)
const selectedRouteRule = ref<RouteRule | null>(null)
const exportType = ref<ExportType>('sing-box')
const exportedConfig = ref('')

// Load route rules from API
const loadRouteRules = async () => {
  loading.value = true
  try {
    const response = await userStore.authorizedFetch('/api/route-rules')
    
    if (response.ok) {
      routeRules.value = await response.json()
    } else {
      console.error('Failed to load route rules')
    }
  } catch (error) {
    console.error('Error loading route rules:', error)
  } finally {
    loading.value = false
  }
}

// Navigate to create new route rule
const createRouteRule = () => {
  router.push('/route-rules/create')
}

// Navigate to edit route rule
const editRouteRule = (routeRule: RouteRule) => {
  router.push(`/route-rules/edit/${routeRule.id}`)
}

// Show delete confirmation
const deleteRouteRule = (routeRule: RouteRule) => {
  selectedRouteRule.value = routeRule
  deleteDialog.value = true
}

// Confirm delete action
const confirmDelete = async () => {
  if (!selectedRouteRule.value?.id) return
  
  deleteLoading.value = true
  try {
    const response = await userStore.authorizedFetch(`/api/route-rules/${selectedRouteRule.value.id}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      // Remove from local list
      routeRules.value = routeRules.value.filter((r: RouteRule) => r.id !== selectedRouteRule.value?.id)
      deleteDialog.value = false
      selectedRouteRule.value = null
    } else {
      console.error('Failed to delete route rule')
    }
  } catch (error) {
    console.error('Error deleting route rule:', error)
  } finally {
    deleteLoading.value = false
  }
}

// Export route rule configuration
const exportRouteRule = async (routeRule: RouteRule) => {
  selectedRouteRule.value = routeRule
  exportDialog.value = true
  
  try {
    const response = await userStore.authorizedFetch(`/api/route-rules/${routeRule.id}/export?type=${exportType.value}`)
    
    if (response.ok) {
      const config = await response.json()
      exportedConfig.value = JSON.stringify(config, null, 2)
    } else {
      console.error('Failed to export route rule')
    }
  } catch (error) {
    console.error('Error exporting route rule:', error)
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
const getActionDisplayName = (action: string): string => {
  const option = actionOptions.find((opt: any) => opt.value === action)
  return option?.title || action
}

const getActionColor = (action: string): string => {
  const colors: Record<string, string> = {
    'route': 'primary',
    'reject': 'error'
  }
  return colors[action] || 'grey'
}

const getActionIcon = (action: string): string => {
  const icons: Record<string, string> = {
    'route': 'mdi-arrow-right',
    'reject': 'mdi-block-helper'
  }
  return icons[action] || 'mdi-help'
}

const getMatchingConditionsText = (routeRule: RouteRule): string => {
  const conditions: string[] = []
  
  if (routeRule.domains && routeRule.domains.length > 0) conditions.push(`Domains: ${routeRule.domains.join(', ')}`)
  if (routeRule.domain_suffixes && routeRule.domain_suffixes.length > 0) conditions.push(`Suffixes: ${routeRule.domain_suffixes.join(', ')}`)
  if (routeRule.domain_keywords && routeRule.domain_keywords.length > 0) conditions.push(`Keywords: ${routeRule.domain_keywords.join(', ')}`)
  if (routeRule.domain_regexes && routeRule.domain_regexes.length > 0) conditions.push(`Regexes: ${routeRule.domain_regexes.join(', ')}`)
  if (routeRule.rule_sets && routeRule.rule_sets.length > 0) conditions.push(`Rule Sets: ${routeRule.rule_sets.join(', ')}`)
  
  return conditions.length > 0 ? conditions.join(', ') : 'No conditions'
}

// Load data on component mount
onMounted(() => {
  loadRouteRules()
})
</script>

<style lang="scss" scoped>
@use './index.scss';
</style>
