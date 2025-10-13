<template>
  <v-container class="rule-set-editor">
    <v-card>
      <v-card-title>
        <v-icon class="me-2">mdi-file-document-outline</v-icon>
        {{ isEditing ? 'Edit Rule Set' : 'Create Rule Set' }}
      </v-card-title>
      
      <v-card-text>
        <v-form @submit.prevent="saveRuleSet">
          <!-- Basic Info -->
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="text-h6">Basic Information</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.name"
                    label="Name *"
                    required
                    variant="outlined"
                    hint="Friendly name for this rule set"
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.type"
                    :items="typeOptions"
                    label="Type *"
                    required
                    variant="outlined"
                    hint="Remote: external file over HTTP(S), Inline: rules defined here"
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12">
                  <v-switch
                    v-model="formData.share"
                    label="Share with other users"
                    color="primary"
                    hint="Allow other users to see and use this rule set"
                    persistent-hint
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Remote Configuration -->
          <v-card variant="outlined" class="mb-6" v-if="formData.type === 'remote'">
            <v-card-title class="text-h6">Remote Configuration</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.url"
                    label="URL *"
                    required
                    variant="outlined"
                    placeholder="https://example.com/rules.json"
                    hint="HTTP(S) URL to the remote rule set file"
                    persistent-hint
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Inline Rules Configuration -->
          <v-card variant="outlined" class="mb-6" v-if="formData.type === 'inline'">
            <v-card-title class="text-h6">Inline Rules</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12">
                  <v-textarea
                    v-model="rulesJson"
                    label="Rules (JSON Array)"
                    placeholder='[{"domain": "example.com"}, {"domain_suffix": ".google.com"}]'
                    rows="10"
                    variant="outlined"
                    @blur="validateRulesJson"
                    :error-messages="rulesError"
                    hint="Array of rule objects. Each rule can have properties like domain, domain_suffix, domain_keyword, etc."
                    persistent-hint
                  />
                </v-col>
              </v-row>
              
              <!-- Rules help -->
              <v-expansion-panels class="mt-4">
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <v-icon class="me-2">mdi-help-circle-outline</v-icon>
                    Rule Examples
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-card variant="outlined">
                      <v-card-text>
                        <p class="mb-2"><strong>Domain matching:</strong></p>
                        <pre class="text-caption">{"domain": "example.com"}</pre>
                        
                        <p class="mb-2 mt-4"><strong>Domain suffix matching:</strong></p>
                        <pre class="text-caption">{"domain_suffix": ".google.com"}</pre>
                        
                        <p class="mb-2 mt-4"><strong>Domain keyword matching:</strong></p>
                        <pre class="text-caption">{"domain_keyword": "ads"}</pre>
                        
                        <p class="mb-2 mt-4"><strong>Domain regex matching:</strong></p>
                        <pre class="text-caption">{"domain_regex": "^ad[sx]\\\\."}</pre>
                        
                        <p class="mb-2 mt-4"><strong>IP CIDR matching:</strong></p>
                        <pre class="text-caption">{"ip_cidr": ["192.168.1.0/24", "10.0.0.0/8"]}</pre>
                        
                        <p class="mb-2 mt-4"><strong>Port matching:</strong></p>
                        <pre class="text-caption">{"port": [80, 443]}</pre>
                        
                        <p class="mb-2 mt-4"><strong>Multiple conditions (AND):</strong></p>
                        <pre class="text-caption">{"domain_suffix": ".example.com", "port": [443]}</pre>
                      </v-card-text>
                    </v-card>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
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
          @click="saveRuleSet"
        >
          Save Rule Set
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { RuleSet, Props } from './types'
import { typeOptions } from './types'
import { useUserStore } from '@/stores/user'

const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
})

const emit = defineEmits<{
  save: [ruleSet: RuleSet]
  cancel: []
}>()

// Store and router
const userStore = useUserStore()
const router = useRouter()

// Form data
const formData = ref<RuleSet>({
  share: false,
  type: 'remote',
  name: '',
  rules: undefined,
  url: ''
})

// JSON string representation for rules
const rulesJson = ref('')
const rulesError = ref('')

// State
const loading = ref(false)

// Computed properties
const isEditing = computed(() => props.mode === 'edit')

// Initialize form data
const initializeForm = () => {
  if (props.ruleSet) {
    formData.value = { ...props.ruleSet }
    rulesJson.value = formData.value.rules ? JSON.stringify(formData.value.rules, null, 2) : ''
  }
}

// JSON validation for rules
const validateRulesJson = () => {
  if (!rulesJson.value.trim()) {
    rulesError.value = ''
    formData.value.rules = undefined
    return
  }
  
  try {
    const parsed = JSON.parse(rulesJson.value)
    if (!Array.isArray(parsed)) {
      rulesError.value = 'Rules must be a JSON array'
      return
    }
    formData.value.rules = parsed
    rulesError.value = ''
  } catch (error) {
    rulesError.value = 'Invalid JSON format'
  }
}

// Clean form data by converting empty strings to undefined
const cleanFormData = (data: RuleSet): RuleSet => {
  const cleaned = { ...data }
  
  // Clean string fields
  if (cleaned.url === '') {
    cleaned.url = undefined
  }
  
  // Type-specific cleaning
  if (cleaned.type === 'remote') {
    cleaned.rules = undefined
  } else if (cleaned.type === 'inline') {
    cleaned.url = undefined
  }
  
  return cleaned
}

// Save rule set
const saveRuleSet = async () => {
  // Validate required fields
  if (!formData.value.name.trim()) {
    return
  }
  
  if (formData.value.type === 'remote' && !formData.value.url?.trim()) {
    return
  }
  
  if (formData.value.type === 'inline' && rulesError.value) {
    return
  }
  
  loading.value = true
  
  try {
    const url = isEditing.value ? `/api/rule_sets/${formData.value.id}` : '/api/rule_sets'
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
      const savedRuleSet = await response.json()
      emit('save', savedRuleSet)
      // Navigate back to list on success
      router.push('/rule-sets')
    } else {
      const error = await response.text()
      console.error('Failed to save rule set:', error)
      // Handle error (show toast, etc.)
    }
  } catch (error) {
    console.error('Failed to save rule set:', error)
    // Handle error
  } finally {
    loading.value = false
  }
}

// Handle cancel action
const handleCancel = () => {
  emit('cancel')
  router.push('/rule-sets')
}

// Watch for JSON changes
watch(rulesJson, () => {
  validateRulesJson()
})

// Lifecycle
onMounted(() => {
  initializeForm()
})
</script>

<style scoped lang="scss">
@use './index.scss';
</style>
