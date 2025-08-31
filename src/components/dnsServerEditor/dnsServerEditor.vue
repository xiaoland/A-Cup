<template>
  <v-container class="dns-server-editor">
    <v-card>
      <v-card-title>
        <v-icon class="me-2">mdi-dns</v-icon>
        {{ isEditing ? 'Edit DNS Server' : 'Create DNS Server' }}
      </v-card-title>
      
      <v-card-text>
        <v-form @submit.prevent="saveDNSServer">
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
                    hint="A descriptive name for this DNS server"
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="formData.share"
                    label="Share with other users"
                    color="primary"
                    hint="Allow other users to see and use this DNS server"
                    persistent-hint
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Server Configuration -->
          <v-card variant="outlined" class="form-section">
            <v-card-title class="text-h6">Server Configuration</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="formData.type"
                    :items="typeOptions"
                    label="Type *"
                    required
                    variant="outlined"
                    hint="DNS server protocol type"
                    persistent-hint
                    @update:model-value="onTypeChange"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="formData.address"
                    label="Server Address *"
                    placeholder="8.8.8.8"
                    required
                    variant="outlined"
                    hint="DNS server IP address or hostname"
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="formData.port"
                    label="Port"
                    type="number"
                    variant="outlined"
                    hint="Server port (auto-assigned by type if empty)"
                    persistent-hint
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Detour Configuration -->
          <v-card variant="outlined" class="form-section">
            <v-card-title class="text-h6">Detour Configuration</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12">
                  <p class="text-caption text-medium-emphasis mb-4">
                    Route DNS requests through a specific outbound or WireGuard endpoint (optional)
                  </p>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.outbound_detour"
                    :items="outboundOptions"
                    label="Outbound Detour"
                    variant="outlined"
                    clearable
                    hint="Route DNS requests through this outbound"
                    persistent-hint
                    :loading="loadingOutbounds"
                    :disabled="!!formData.wg_endpoint_detour"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.wg_endpoint_detour"
                    :items="wgEndpointOptions"
                    label="WireGuard Endpoint Detour"
                    variant="outlined"
                    clearable
                    hint="Route DNS requests through this WireGuard endpoint"
                    persistent-hint
                    :loading="loadingWgEndpoints"
                    :disabled="!!formData.outbound_detour"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Advanced Options -->
          <v-expansion-panels class="advanced-options">
            <v-expansion-panel>
              <v-expansion-panel-title>Advanced Options</v-expansion-panel-title>
              <v-expansion-panel-text>
                <!-- TLS Options -->
                <v-card variant="outlined" class="mb-4" v-if="isTLSType">
                  <v-card-title class="text-h6">TLS Settings</v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col cols="12" md="4">
                        <v-switch
                          v-model="tlsEnabled"
                          label="Enable TLS"
                          color="primary"
                          @update:model-value="onTLSToggle"
                        />
                      </v-col>
                      <v-col cols="12" md="4" v-if="tlsEnabled">
                        <v-text-field
                          v-model="formData.tls!.server_name"
                          label="Server Name"
                          variant="outlined"
                          hint="TLS server name for verification"
                          persistent-hint
                        />
                      </v-col>
                      <v-col cols="12" md="4" v-if="tlsEnabled">
                        <v-switch
                          v-model="formData.tls!.insecure"
                          label="Skip Certificate Verification"
                          color="warning"
                          hint="Not recommended for production"
                          persistent-hint
                        />
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>

                <!-- HTTPS Options -->
                <v-card variant="outlined" v-if="isHTTPSType">
                  <v-card-title class="text-h6">HTTPS Settings</v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="formData.https!.path"
                          label="Path"
                          placeholder="/dns-query"
                          variant="outlined"
                          hint="HTTP path for DNS queries"
                          persistent-hint
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-textarea
                          v-model="headersText"
                          label="HTTP Headers"
                          placeholder="header1: value1&#10;header2: value2"
                          variant="outlined"
                          hint="Additional HTTP headers (one per line, format: name: value)"
                          persistent-hint
                          rows="3"
                          @update:model-value="onHeadersChange"
                        />
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <!-- Related DNS Rules (only in edit mode) -->
          <v-card v-if="isEditing && props.dnsServer?.id" variant="outlined" class="form-section">
            <v-card-title class="text-h6 d-flex align-center justify-space-between">
              <span>
                <v-icon class="me-2">mdi-dns-outline</v-icon>
                Related DNS Rules
              </span>
              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                prepend-icon="mdi-plus"
                @click="showCreateRuleDialog = true"
              >
                Create Rule
              </v-btn>
            </v-card-title>
            <v-card-text>
              <!-- Loading State -->
              <v-skeleton-loader
                v-if="loadingRelatedRules"
                type="list-item-three-line@3"
                class="mb-4"
              />

              <!-- Empty State -->
              <v-empty-state
                v-else-if="!loadingRelatedRules && relatedRules.length === 0"
                headline="No DNS rules found"
                title="No rules are using this DNS server"
                text="Create rules to control how domain names are resolved using this server."
              >
                <template #actions>
                  <v-btn
                    color="primary"
                    variant="elevated"
                    @click="showCreateRuleDialog = true"
                    prepend-icon="mdi-plus"
                  >
                    Create First Rule
                  </v-btn>
                </template>
              </v-empty-state>

              <!-- DNS Rules List -->
              <v-list v-else>
                <v-list-item
                  v-for="rule in relatedRules"
                  :key="rule.id"
                  class="related-rule-item"
                  @click="editRule(rule)"
                >
                  <template #prepend>
                    <v-icon color="primary">mdi-dns-outline</v-icon>
                  </template>

                  <v-list-item-title>{{ rule.name }}</v-list-item-title>
                  
                  <v-list-item-subtitle>
                    <v-chip
                      v-if="rule.action"
                      size="x-small"
                      class="me-2"
                    >
                      {{ rule.action }}
                    </v-chip>
                    <span v-if="rule.domains && rule.domains.length > 0">
                      Domains: {{ rule.domains.slice(0, 2).join(', ') }}
                      <span v-if="rule.domains.length > 2">...</span>
                    </span>
                    <span v-else-if="rule.domain_suffixes && rule.domain_suffixes.length > 0">
                      Suffixes: {{ rule.domain_suffixes.slice(0, 2).join(', ') }}
                      <span v-if="rule.domain_suffixes.length > 2">...</span>
                    </span>
                    <span v-else-if="rule.domain_keywords && rule.domain_keywords.length > 0">
                      Keywords: {{ rule.domain_keywords.slice(0, 2).join(', ') }}
                      <span v-if="rule.domain_keywords.length > 2">...</span>
                    </span>
                  </v-list-item-subtitle>

                  <template #append>
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      @click.stop="editRule(rule)"
                    />
                  </template>
                </v-list-item>
              </v-list>
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
            >
              {{ isEditing ? 'Update' : 'Create' }}
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Create/Edit DNS Rule Dialog -->
    <v-dialog v-model="showRuleDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <v-icon class="me-2">mdi-dns-outline</v-icon>
          {{ editingRule ? 'Edit DNS Rule' : 'Create DNS Rule' }}
        </v-card-title>
        <v-card-text class="pa-0">
          <DNSRuleEditor
            :mode="editingRule ? 'edit' : 'create'"
            :dns-rule="editingRule || undefined"
            @save="handleRuleSaved"
            @cancel="closeRuleDialog"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import DNSRuleEditor from '@/components/dnsRuleEditor/dnsRuleEditor.vue'
import type { DNSServer, Props, SelectOption, TLSOptions, HTTPSOptions } from './types'
import type { DNSRule } from '@/components/dnsRuleEditor/types'
import { typeOptions, DEFAULT_PORTS } from './types'

// Props and emits
const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
})

const emit = defineEmits<{
  save: [dnsServer: DNSServer]
  cancel: []
}>()

// Stores
const userStore = useUserStore()

// Reactive data
const saving = ref(false)
const loadingOutbounds = ref(false)
const outboundOptions = ref<SelectOption[]>([])
const loadingWgEndpoints = ref(false)
const wgEndpointOptions = ref<SelectOption[]>([])
const loadingRelatedRules = ref(false)
const relatedRules = ref<DNSRule[]>([])
const showRuleDialog = ref(false)
const showCreateRuleDialog = ref(false)
const editingRule = ref<DNSRule | null>(null)

// Form data
const formData = ref<DNSServer>({
  share: false,
  name: '',
  type: 'udp',
  address: '',
  port: 53,
  tls: {},
  https: {},
  outbound_detour: null,
  wg_endpoint_detour: null
})

// TLS and HTTPS helpers
const tlsEnabled = ref(false)
const headersText = ref('')

// Computed
const isEditing = computed(() => props.mode === 'edit')
const isHTTPSType = computed(() => formData.value.type === 'https' || formData.value.type === 'http3')
const isTLSType = computed(() => ['https', 'http3', 'tls', 'quic'].includes(formData.value.type))

// Watchers
watch(() => props.dnsServer, (newDNSServer) => {
  if (newDNSServer) {
    formData.value = {
      ...newDNSServer,
      tls: newDNSServer.tls || {},
      https: newDNSServer.https || {}
    }
    
    // Set TLS enabled state
    tlsEnabled.value = !!(newDNSServer.tls?.enabled || newDNSServer.tls?.server_name || newDNSServer.tls?.insecure)
    
    // Set headers text
    if (newDNSServer.https?.headers) {
      headersText.value = Object.entries(newDNSServer.https.headers)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')
    }
  }
}, { immediate: true })

// Mutual exclusion watchers for detour fields
watch(() => formData.value.outbound_detour, (newValue) => {
  if (newValue && formData.value.wg_endpoint_detour) {
    formData.value.wg_endpoint_detour = null
  }
})

watch(() => formData.value.wg_endpoint_detour, (newValue) => {
  if (newValue && formData.value.outbound_detour) {
    formData.value.outbound_detour = null
  }
})

// Methods
const onTypeChange = () => {
  // Set default port if port is null or matches the previous type's default
  if (!formData.value.port || (formData.value.port && Object.values(DEFAULT_PORTS).includes(formData.value.port))) {
    formData.value.port = DEFAULT_PORTS[formData.value.type] || null
  }
}

const onTLSToggle = () => {
  if (tlsEnabled.value) {
    formData.value.tls = {
      enabled: true,
      server_name: '',
      insecure: false
    }
  } else {
    formData.value.tls = {}
  }
}

const onHeadersChange = () => {
  const headers: Record<string, string> = {}
  const lines = headersText.value.split('\n')
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && trimmed.includes(':')) {
      const [key, ...valueParts] = trimmed.split(':')
      const value = valueParts.join(':').trim()
      if (key.trim() && value) {
        headers[key.trim()] = value
      }
    }
  }
  
  if (Object.keys(headers).length > 0) {
    formData.value.https = formData.value.https || {}
    formData.value.https.headers = headers
  } else if (formData.value.https) {
    delete formData.value.https.headers
  }
}

const loadOutbounds = async () => {
  try {
    loadingOutbounds.value = true
    const response = await fetch('/api/outbounds', {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    
    if (response.ok) {
      const outbounds = await response.json()
      outboundOptions.value = outbounds.map((outbound: any) => ({
        title: `${outbound.type} - ${outbound.address || 'N/A'}:${outbound.port || 'N/A'}`,
        value: outbound.id
      }))
    }
  } catch (error) {
    console.error('Failed to load outbounds:', error)
  } finally {
    loadingOutbounds.value = false
  }
}

const loadWgEndpoints = async () => {
  try {
    loadingWgEndpoints.value = true
    const response = await fetch('/api/endpoints', {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    
    if (response.ok) {
      const endpoints = await response.json()
      // Filter for WireGuard endpoints (though currently all are WireGuard)
      const wgEndpoints = endpoints.filter((ep: any) => ep.type === 'wireguard')
      wgEndpointOptions.value = wgEndpoints.map((endpoint: any) => {
        // Try to get first peer's address for display, or just use the name
        let displayText = endpoint.name
        if (endpoint.peers && Array.isArray(endpoint.peers) && endpoint.peers.length > 0) {
          const firstPeer = endpoint.peers[0]
          if (firstPeer.address && firstPeer.port) {
            displayText = `${endpoint.name} - ${firstPeer.address}:${firstPeer.port}`
          }
        }
        return {
          title: displayText,
          value: endpoint.id
        }
      })
    }
  } catch (error) {
    console.error('Failed to load WireGuard endpoints:', error)
  } finally {
    loadingWgEndpoints.value = false
  }
}

const saveDNSServer = async () => {
  try {
    saving.value = true
    
    // Prepare form data
    const dataToSave: DNSServer = {
      ...formData.value
    }
    
    // Clean up TLS options if not enabled
    if (!tlsEnabled.value || Object.keys(formData.value.tls || {}).length === 0) {
      delete dataToSave.tls
    }
    
    // Clean up HTTPS options if not HTTPS type or empty
    if (!isHTTPSType.value || (!formData.value.https?.path && !formData.value.https?.headers)) {
      delete dataToSave.https
    }

    const url = isEditing.value ? `/api/dns_servers/${props.dnsServer?.id}` : '/api/dns_servers'
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
      alert(`Failed to save DNS server: ${error}`)
    }
  } catch (error) {
    console.error('Error saving DNS server:', error)
    alert('Failed to save DNS server')
  } finally {
    saving.value = false
  }
}

// Related DNS Rules functionality
const loadRelatedRules = async () => {
  if (!props.dnsServer?.id) return
  
  try {
    loadingRelatedRules.value = true
    const response = await fetch(`/api/dns_rules?server=${props.dnsServer.id}`, {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    
    if (response.ok) {
      relatedRules.value = await response.json()
    } else {
      console.error('Failed to load related DNS rules')
    }
  } catch (error) {
    console.error('Error loading related DNS rules:', error)
  } finally {
    loadingRelatedRules.value = false
  }
}

const editRule = (rule: DNSRule) => {
  editingRule.value = rule
  showRuleDialog.value = true
}

const handleRuleSaved = (rule: DNSRule) => {
  // Update or add the rule in the related rules list
  const existingIndex = relatedRules.value.findIndex(r => r.id === rule.id)
  if (existingIndex >= 0) {
    relatedRules.value[existingIndex] = rule
  } else {
    relatedRules.value.push(rule)
  }
  
  closeRuleDialog()
}

const closeRuleDialog = () => {
  showRuleDialog.value = false
  showCreateRuleDialog.value = false
  editingRule.value = null
}

// Watch for dialog state changes
watch(showCreateRuleDialog, (newVal) => {
  if (newVal) {
    editingRule.value = { 
      share: false, 
      name: '', 
      server: props.dnsServer?.id || 0,
      domains: [],
      domain_suffixes: [],
      domain_keywords: [],
      rule_sets: []
    }
    showRuleDialog.value = true
  }
})

// Lifecycle
onMounted(() => {
  loadOutbounds()
  loadWgEndpoints()
  if (isEditing.value && props.dnsServer?.id) {
    loadRelatedRules()
  }
})
</script>

<style lang="scss">
@use './index.scss';
</style>
