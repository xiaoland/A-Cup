<template>
  <v-container class="dns-rule">
    <v-card>
      <v-card-title>
        <v-icon class="me-2">mdi-dns-outline</v-icon>
        DNS Rule
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="onPrimary">
          <v-card variant="outlined" class="form-section">
            <v-card-title class="text-h6">Basic Information</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field v-model="form.name" :readonly="!editable" label="Name *" required variant="outlined" />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card variant="outlined" class="form-section">
            <v-card-title class="text-h6">Action Configuration</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-select v-model="form.action" :items="actionOptions" :readonly="!editable" label="Action" variant="outlined" clearable />
                </v-col>
                <v-col cols="12" md="6" v-if="!form.action || form.action === 'route'">
                  <v-select v-model="form.server" :items="dnsServerOptions" :readonly="!editable" label="DNS Server *" required variant="outlined" />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card variant="outlined" class="form-section conditions-section">
            <v-card-title class="text-h6">Match Conditions</v-card-title>
            <v-card-text>
              <v-alert v-if="!hasAnyCondition" type="warning" variant="tonal" class="validation-alert">At least one condition must be specified.</v-alert>

              <div class="condition-group">
                <div class="condition-title">Domain Matching</div>

                <div class="array-field">
                  <v-label class="array-label">Exact Domains</v-label>
                  <div v-for="(domain, index) in (form.domains || [])" :key="`domain-${index}`" class="array-item">
                    <v-text-field v-model="form.domains![index]" :readonly="!editable" placeholder="example.com" variant="outlined" density="compact" hide-details>
                      <template #append>
                        <v-btn @click="removeDomain(index)" :disabled="!editable" icon="mdi-delete" size="small" variant="text" color="error" />
                      </template>
                    </v-text-field>
                  </div>
                  <v-btn @click="addDomain" :disabled="!editable" variant="outlined" size="small" prepend-icon="mdi-plus" class="add-button">Add Domain</v-btn>
                </div>

                <div class="array-field">
                  <v-label class="array-label">Domain Suffixes</v-label>
                  <div v-for="(suffix, index) in (form.domain_suffixes || [])" :key="`suffix-${index}`" class="array-item">
                    <v-text-field v-model="form.domain_suffixes![index]" :readonly="!editable" placeholder=".example.com" variant="outlined" density="compact" hide-details>
                      <template #append>
                        <v-btn @click="removeDomainSuffix(index)" :disabled="!editable" icon="mdi-delete" size="small" variant="text" color="error" />
                      </template>
                    </v-text-field>
                  </div>
                  <v-btn @click="addDomainSuffix" :disabled="!editable" variant="outlined" size="small" prepend-icon="mdi-plus" class="add-button">Add Domain Suffix</v-btn>
                </div>

                <div class="array-field">
                  <v-label class="array-label">Domain Keywords</v-label>
                  <div v-for="(keyword, index) in (form.domain_keywords || [])" :key="`keyword-${index}`" class="array-item">
                    <v-text-field v-model="form.domain_keywords![index]" :readonly="!editable" placeholder="example" variant="outlined" density="compact" hide-details>
                      <template #append>
                        <v-btn @click="removeDomainKeyword(index)" :disabled="!editable" icon="mdi-delete" size="small" variant="text" color="error" />
                      </template>
                    </v-text-field>
                  </div>
                  <v-btn @click="addDomainKeyword" :disabled="!editable" variant="outlined" size="small" prepend-icon="mdi-plus" class="add-button">Add Domain Keyword</v-btn>
                </div>
              </div>

              <div class="condition-group">
                <div class="condition-title">Rule Sets</div>
                <v-row>
                  <v-col cols="12">
                    <v-select v-model="form.rule_sets" :items="ruleSetOptions" :readonly="!editable" label="Rule Sets" variant="outlined" multiple clearable chips :loading="loadingRuleSets" />
                  </v-col>
                </v-row>
              </div>
            </v-card-text>
          </v-card>

          <div class="action-buttons">
            <v-btn @click="$emit('cancel')" variant="outlined" :disabled="!editable">Cancel</v-btn>
            <v-btn type="submit" color="primary" :loading="saving" :disabled="editable && !isFormValid">{{ editable ? 'Save' : 'Edit' }}</v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import type { SelectOption } from './types'
import { actionOptions } from './types'
import type { DNSRule } from './index'

const props = withDefaults(defineProps<{ dnsRule?: DNSRule; dnsServers: any[]; editable?: boolean }>(), {
  editable: false,
  dnsRule: () => ({ name: '', action: undefined, server: 0, domains: [], domain_suffixes: [], domain_keywords: [], rule_sets: [] }) as DNSRule,
})
const emit = defineEmits<{ save: [dnsRule: DNSRule]; cancel: []; 'request-edit': [] }>()

const userStore = useUserStore()
const saving = ref(false)
const loadingRuleSets = ref(false)
const dnsServerOptions = ref<SelectOption[]>([])
const ruleSetOptions = ref<SelectOption[]>([])

import { toRef } from 'vue'
const form = toRef(props, 'dnsRule')

const hasAnyCondition = computed(() => !!((form.value?.domains && form.value.domains.length > 0) || (form.value?.domain_suffixes && form.value.domain_suffixes.length > 0) || (form.value?.domain_keywords && form.value.domain_keywords.length > 0) || (form.value?.rule_sets && form.value.rule_sets.length > 0)))
const isFormValid = computed(() => !!form.value && !!form.value.name.trim() && hasAnyCondition.value && (form.value.action === 'reject' || form.value.server !== undefined))

watch(() => props.dnsServers, (servers) => {
  if (servers && Array.isArray(servers)) {
    dnsServerOptions.value = servers.map((s: any, idx: number) => ({ title: `${s.name || s.tag || s.type} ${s.type ? `(${String(s.type).toUpperCase()})` : ''}`.trim(), value: s.id ?? idx }))
  }
}, { immediate: true, deep: true })

const loadRuleSets = async () => {
  try {
    loadingRuleSets.value = true
    const response = await fetch('/api/rule_sets', { headers: { 'Authorization': `Bearer ${userStore.token}` } })
    if (response.ok) {
      const ruleSets = await response.json()
      ruleSetOptions.value = ruleSets.map((r: any) => ({ title: r.name, value: r.id }))
    }
  } finally {
    loadingRuleSets.value = false
  }
}

const onPrimary = async () => {
  if (!props.editable) { emit('request-edit'); return }
  await saveDNSRule()
}

const saveDNSRule = async () => {
  if (!isFormValid.value) return
  try {
    saving.value = true
    const dataToSave: DNSRule = { ...form.value, domains: form.value.domains?.filter(d => d.trim()) || undefined, domain_suffixes: form.value.domain_suffixes?.filter(d => d.trim()) || undefined, domain_keywords: form.value.domain_keywords?.filter(d => d.trim()) || undefined }
    emit('save', dataToSave)
  } finally {
    saving.value = false
  }
}

const addDomain = () => { if (!form.value.domains) form.value.domains = []; form.value.domains.push('') }
const removeDomain = (index: number) => { form.value.domains?.splice(index, 1) }
const addDomainSuffix = () => { if (!form.value.domain_suffixes) form.value.domain_suffixes = []; form.value.domain_suffixes.push('') }
const removeDomainSuffix = (index: number) => { form.value.domain_suffixes?.splice(index, 1) }
const addDomainKeyword = () => { if (!form.value.domain_keywords) form.value.domain_keywords = []; form.value.domain_keywords.push('') }
const removeDomainKeyword = (index: number) => { form.value.domain_keywords?.splice(index, 1) }

onMounted(() => { loadRuleSets() })
</script>

<style lang="scss">
@use './index.scss';
</style>
