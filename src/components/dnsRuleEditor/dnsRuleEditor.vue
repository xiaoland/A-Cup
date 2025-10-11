<template>
  <v-container class="dns-rule-editor">
    <v-card>
      <v-card-title>
        <v-icon class="me-2">mdi-dns-outline</v-icon>
        {{ isEditing ? 'Edit DNS Rule' : 'Create DNS Rule' }}
      </v-card-title>
      
      <v-card-text>
        <v-form @submit.prevent="saveDNSRule">
          <!-- Basic Info -->
          <v-card variant="outlined" class="form-section">
            <v-card-title class="text-h6">Basic Information</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.name"
                    label="Name *"
                    required
                    variant="outlined"
                    hint="A descriptive name for this DNS rule"
                    persistent-hint
                  />
                </v-col>
                <!-- Share option removed -->
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Action Configuration -->
          <v-card variant="outlined" class="form-section">
            <v-card-title class="text-h6">Action Configuration</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.action"
                    :items="actionOptions"
                    label="Action"
                    variant="outlined"
                    clearable
                    hint="What to do when this rule matches (leave empty for default behavior)"
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="6" v-if="!formData.action || formData.action === 'route'">
                  <v-select
                    v-model="formData.server"
                    :items="dnsServerOptions"
                    label="DNS Server *"
                    required
                    variant="outlined"
                    hint="DNS server to route requests to"
                    persistent-hint
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Conditions -->
          <v-card variant="outlined" class="form-section conditions-section">
            <v-card-title class="text-h6">Match Conditions</v-card-title>
            <v-card-text>
              <v-alert
                v-if="!hasAnyCondition"
                type="warning"
                variant="tonal"
                class="validation-alert"
              >
                At least one condition must be specified for the rule to work.
              </v-alert>

              <!-- Domain Conditions -->
              <div class="condition-group">
                <div class="condition-title">Domain Matching</div>
                
                <!-- Exact Domains -->
                <div class="array-field">
                  <v-label class="array-label">Exact Domains</v-label>
                  <div v-for="(domain, index) in (formData.domains || [])" :key="`domain-${index}`" class="array-item">
                    <v-text-field
                      v-model="formData.domains![index]"
                      placeholder="example.com"
                      variant="outlined"
                      density="compact"
                      hide-details
                    >
                      <template #append>
                        <v-btn
                          @click="removeDomain(index)"
                          icon="mdi-delete"
                          size="small"
                          variant="text"
                          color="error"
                        />
                      </template>
                    </v-text-field>
                  </div>
                  <v-btn
                    @click="addDomain"
                    variant="outlined"
                    size="small"
                    prepend-icon="mdi-plus"
                    class="add-button"
                  >
                    Add Domain
                  </v-btn>
                </div>

                <!-- Domain Suffixes -->
                <div class="array-field">
                  <v-label class="array-label">Domain Suffixes</v-label>
                  <div v-for="(suffix, index) in (formData.domain_suffixes || [])" :key="`suffix-${index}`" class="array-item">
                    <v-text-field
                      v-model="formData.domain_suffixes![index]"
                      placeholder=".example.com"
                      variant="outlined"
                      density="compact"
                      hide-details
                    >
                      <template #append>
                        <v-btn
                          @click="removeDomainSuffix(index)"
                          icon="mdi-delete"
                          size="small"
                          variant="text"
                          color="error"
                        />
                      </template>
                    </v-text-field>
                  </div>
                  <v-btn
                    @click="addDomainSuffix"
                    variant="outlined"
                    size="small"
                    prepend-icon="mdi-plus"
                    class="add-button"
                  >
                    Add Domain Suffix
                  </v-btn>
                </div>

                <!-- Domain Keywords -->
                <div class="array-field">
                  <v-label class="array-label">Domain Keywords</v-label>
                  <div v-for="(keyword, index) in (formData.domain_keywords || [])" :key="`keyword-${index}`" class="array-item">
                    <v-text-field
                      v-model="formData.domain_keywords![index]"
                      placeholder="example"
                      variant="outlined"
                      density="compact"
                      hide-details
                    >
                      <template #append>
                        <v-btn
                          @click="removeDomainKeyword(index)"
                          icon="mdi-delete"
                          size="small"
                          variant="text"
                          color="error"
                        />
                      </template>
                    </v-text-field>
                  </div>
                  <v-btn
                    @click="addDomainKeyword"
                    variant="outlined"
                    size="small"
                    prepend-icon="mdi-plus"
                    class="add-button"
                  >
                    Add Domain Keyword
                  </v-btn>
                </div>
              </div>

              <!-- Rule Set Condition -->
              <div class="condition-group">
                <div class="condition-title">Rule Sets</div>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      v-model="formData.rule_sets"
                      :items="ruleSetOptions"
                      label="Rule Sets"
                      variant="outlined"
                      multiple
                      clearable
                      chips
                      hint="Select one or more rule sets for matching"
                      persistent-hint
                      :loading="loadingRuleSets"
                    />
                  </v-col>
                </v-row>
              </div>
            </v-card-text>
          </v-card>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <v-btn
              @click="$emit('cancel')"
              variant="outlined"
            >
              Cancel
            </v-btn>
            <v-btn
              type="submit"
              color="primary"
              :loading="saving"
              :disabled="!isFormValid"
            >
              {{ isEditing ? 'Update' : 'Create' }}
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import type { DNSRule, Props, SelectOption } from './types'
import { actionOptions } from './types'

// Props and emits
const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
})

const emit = defineEmits<{
  save: [dnsRule: DNSRule]
  cancel: []
}>()

// Stores
const userStore = useUserStore()

// Reactive data
const saving = ref(false)
const loadingRuleSets = ref(false)
const dnsServerOptions = ref<SelectOption[]>([])
const ruleSetOptions = ref<SelectOption[]>([])

// Form data
const formData = ref<DNSRule>({
  name: '',
  action: undefined,
  server: 0,
  domains: [],
  domain_suffixes: [],
  domain_keywords: [],
  rule_sets: []
})

// Computed
const isEditing = computed(() => props.mode === 'edit')

const hasAnyCondition = computed(() => {
  return !!(
    (formData.value.domains && formData.value.domains.length > 0) ||
    (formData.value.domain_suffixes && formData.value.domain_suffixes.length > 0) ||
    (formData.value.domain_keywords && formData.value.domain_keywords.length > 0) ||
    (formData.value.rule_sets && formData.value.rule_sets.length > 0)
  )
})

const isFormValid = computed(() => {
  return (
    formData.value.name.trim() &&
    hasAnyCondition.value &&
    (formData.value.action === 'reject' || formData.value.server !== undefined)
  )
})

// Watchers
watch(() => props.dnsRule, (newDNSRule) => {
  if (newDNSRule) {
    formData.value = { ...newDNSRule }
  }
}, { immediate: true })

// Methods
// Build server options from passed-in dnsServers prop if provided
watch(() => props.dnsServers, (servers) => {
  if (servers && Array.isArray(servers)) {
    dnsServerOptions.value = servers.map((s: any, idx: number) => ({
      title: `${s.name || s.tag || s.type} ${s.type ? `(${String(s.type).toUpperCase()})` : ''}`.trim(),
      value: s.id ?? idx
    }))
  }
}, { immediate: true, deep: true })

const loadRuleSets = async () => {
  try {
    loadingRuleSets.value = true
    const response = await fetch('/api/rule_sets', {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    
    if (response.ok) {
      const ruleSets = await response.json()
      ruleSetOptions.value = ruleSets.map((ruleSet: any) => ({
        title: ruleSet.name,
        value: ruleSet.id
      }))
    }
  } catch (error) {
    console.error('Failed to load rule sets:', error)
  } finally {
    loadingRuleSets.value = false
  }
}

const saveDNSRule = async () => {
  if (!isFormValid.value) return
  
  try {
    saving.value = true
    
    // Prepare form data
    const dataToSave: DNSRule = {
      ...formData.value,
      // Filter out empty strings from arrays
      domains: formData.value.domains?.filter(d => d.trim()) || undefined,
      domain_suffixes: formData.value.domain_suffixes?.filter(d => d.trim()) || undefined,
      domain_keywords: formData.value.domain_keywords?.filter(d => d.trim()) || undefined
    }

    // If dnsServers are provided via props, we treat this as an inline editor and emit the data directly
    if (props.dnsServers && props.dnsServers.length > 0) {
      emit('save', dataToSave)
    } else {
      const url = isEditing.value ? `/api/dns_rules/${props.dnsRule?.id}` : '/api/dns_rules'
      const method = isEditing.value ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userStore.token}`
        },
        body: JSON.stringify(dataToSave)
      })
      
      if (response.ok) {
        const result = await response.json()
        emit('save', result)
      } else {
        const error = await response.text()
        alert(`Failed to save DNS rule: ${error}`)
      }
    }
  } catch (error) {
    console.error('Error saving DNS rule:', error)
    alert('Failed to save DNS rule')
  } finally {
    saving.value = false
  }
}

// Array manipulation methods
const addDomain = () => {
  if (!formData.value.domains) formData.value.domains = []
  formData.value.domains.push('')
}

const removeDomain = (index: number) => {
  if (formData.value.domains) {
    formData.value.domains.splice(index, 1)
  }
}

const addDomainSuffix = () => {
  if (!formData.value.domain_suffixes) formData.value.domain_suffixes = []
  formData.value.domain_suffixes.push('')
}

const removeDomainSuffix = (index: number) => {
  if (formData.value.domain_suffixes) {
    formData.value.domain_suffixes.splice(index, 1)
  }
}

const addDomainKeyword = () => {
  if (!formData.value.domain_keywords) formData.value.domain_keywords = []
  formData.value.domain_keywords.push('')
}

const removeDomainKeyword = (index: number) => {
  if (formData.value.domain_keywords) {
    formData.value.domain_keywords.splice(index, 1)
  }
}

// Lifecycle
onMounted(() => {
  loadRuleSets()
})
</script>

<style lang="scss">
@use './index.scss';
</style>
