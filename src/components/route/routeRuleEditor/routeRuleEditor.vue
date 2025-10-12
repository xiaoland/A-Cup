<template>
  <v-container class="route-rule-editor">
    <v-card>
      <v-card-title>
        <v-icon class="me-2">mdi-routes</v-icon>
        {{ isEditing ? 'Edit Route Rule' : 'Create Route Rule' }}
      </v-card-title>
      
      <v-card-text>
        <v-form @submit.prevent="saveRouteRule">
          <!-- Basic Info -->
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="text-h6">Basic Information</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.name"
                    label="Name *"
                    placeholder="My Route Rule"
                    required
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="formData.share"
                    label="Share with other users"
                    color="primary"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Action Configuration -->
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="text-h6">Action</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.action"
                    :items="actionOptions"
                    label="Action *"
                    required
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" md="6" v-if="formData.action === 'route'">
                  <v-select
                    v-model="formData.outbound"
                    :items="outboundItems"
                    label="Outbound *"
                    required
                    variant="outlined"
                    :loading="loadingOutbounds"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Matching Conditions -->
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="text-h6">Matching Conditions</v-card-title>
            <v-card-subtitle>
              At least one condition must be specified
            </v-card-subtitle>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-combobox
                    v-model="formData.domains"
                    label="Domains (exact match)"
                    placeholder="example.com"
                    variant="outlined"
                    multiple
                    chips
                    closable-chips
                    clearable
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-combobox
                    v-model="formData.domain_suffixes"
                    label="Domain Suffixes"
                    placeholder=".example.com"
                    variant="outlined"
                    multiple
                    chips
                    closable-chips
                    clearable
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-combobox
                    v-model="formData.domain_keywords"
                    label="Domain Keywords"
                    placeholder="example"
                    variant="outlined"
                    multiple
                    chips
                    closable-chips
                    clearable
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-combobox
                    v-model="formData.domain_regexes"
                    label="Domain Regexes"
                    placeholder=".*\.example\.com$"
                    variant="outlined"
                    multiple
                    chips
                    closable-chips
                    clearable
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-combobox
                    v-model="formData.rule_sets"
                    label="Rule Set IDs"
                    placeholder="1"
                    variant="outlined"
                    multiple
                    chips
                    closable-chips
                    clearable
                    type="number"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

        </v-form>
      </v-card-text>

      <!-- Form Actions -->
      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn
          variant="outlined"
          @click="handleCancel"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          :loading="loading"
          @click="saveRouteRule"
          :disabled="!isFormValid"
        >
          Save Route Rule
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { RouteRule, Props, OutboundSelectItem } from './types'
import { actionOptions } from './types'
import { useUserStore } from '@/stores/user'
import type { Outbound } from '@/components/outbounds/outboundEditor/types'

const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
})

const emit = defineEmits<{
  save: [routeRule: RouteRule]
  cancel: []
}>()

// Store and router
const userStore = useUserStore()
const router = useRouter()

// Form data
const formData = ref<RouteRule>({
  share: false,
  name: '',
  action: 'route',
  outbound: undefined,
  domains: [],
  domain_suffixes: [],
  domain_keywords: [],
  domain_regexes: [],
  rule_sets: []
})

// State
const loading = ref(false)
const loadingOutbounds = ref(false)
const availableOutbounds = ref<Outbound[]>([])

// Computed properties
const isEditing = computed(() => props.mode === 'edit')

const outboundItems = computed(() => {
  return availableOutbounds.value.map(outbound => ({
    title: outbound.name || (outbound.region 
      ? `${outbound.type}.${outbound.region} (${outbound.server || 'N/A'}${outbound.server_port ? `:${outbound.server_port}` : ''})`
      : `${outbound.type} (${outbound.server || 'N/A'}${outbound.server_port ? `:${outbound.server_port}` : ''})`),
    value: outbound.id
  }))
})

const isFormValid = computed(() => {
  // Name is required
  if (!formData.value.name.trim()) return false
  
  // Action is required
  if (!formData.value.action) return false
  
  // If action is route, outbound is required
  if (formData.value.action === 'route' && !formData.value.outbound) return false
  
  // At least one matching condition must be provided
  const conditions = [
    formData.value.domains,
    formData.value.domain_suffixes,
    formData.value.domain_keywords,
    formData.value.domain_regexes,
    formData.value.rule_sets
  ]
  
  return conditions.some(condition => condition && condition.length > 0)
})

// Initialize form data
const initializeForm = () => {
  if (props.routeRule) {
    formData.value = { ...props.routeRule }
  }
}

// Load available outbounds for selector
const loadAvailableOutbounds = async () => {
  loadingOutbounds.value = true
  try {
    const response = await userStore.authorizedFetch('/api/outbounds')
    if (response.ok) {
      availableOutbounds.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to load outbounds:', error)
  } finally {
    loadingOutbounds.value = false
  }
}

// Clean form data by converting empty arrays to undefined
const cleanFormData = (data: RouteRule): RouteRule => {
  const cleaned = { ...data }
  
  // Clean array fields - convert empty arrays to undefined
  const arrayFields: (keyof RouteRule)[] = [
    'domains', 'domain_suffixes', 'domain_keywords', 'domain_regexes', 'rule_sets'
  ]
  
  arrayFields.forEach(field => {
    const value = cleaned[field] as any[]
    if (!value || value.length === 0) {
      (cleaned as any)[field] = undefined
    }
  })
  
  // Clean outbound if action is reject
  if (cleaned.action === 'reject') {
    cleaned.outbound = undefined
  }
  
  return cleaned
}

// Save route rule
const saveRouteRule = async () => {
  if (!isFormValid.value) {
    return
  }
  
  loading.value = true
  
  try {
    const url = isEditing.value ? `/api/route-rules/${formData.value.id}` : '/api/route-rules'
    const method = isEditing.value ? 'PUT' : 'POST'
    
    const cleanedData = cleanFormData(formData.value)
    
    const response = await userStore.authorizedFetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cleanedData)
    })
    
    if (response.ok) {
      const savedRouteRule = await response.json()
      emit('save', savedRouteRule)
      // Navigate back to list on success
      router.push('/route-rules')
    } else {
      const error = await response.text()
      console.error('Failed to save route rule:', error)
      // Handle error (show toast, etc.)
    }
  } catch (error) {
    console.error('Failed to save route rule:', error)
    // Handle error
  } finally {
    loading.value = false
  }
}

// Handle cancel action
const handleCancel = () => {
  emit('cancel')
  router.push('/route-rules')
}

// Lifecycle
onMounted(() => {
  initializeForm()
  loadAvailableOutbounds()
})
</script>

<style scoped lang="scss">
@use './index.scss';
</style>
