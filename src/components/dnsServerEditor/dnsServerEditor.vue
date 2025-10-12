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
                    Route DNS requests through a specific outbound (optional)
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
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import type { DNSServer, Props, SelectOption, TLSOptions, HTTPSOptions } from './types'
import { typeOptions, DEFAULT_PORTS } from './types'

// Props and emits
const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
})

const emit = defineEmits<{
  save: [dnsServer: DNSServer]
  cancel: []
  'update:dnsServer': [dnsServer: DNSServer]
}>()

// Stores
const userStore = useUserStore()

// Reactive data
const saving = ref(false)
const loadingOutbounds = ref(false)
const outboundOptions = ref<SelectOption[]>([])

// Form data
const formData = ref<DNSServer>({
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
const isHTTPSType = computed(() => formData.value.type === 'https' || formData.value.type === 'h3')
const isTLSType = computed(() => ['https', 'h3', 'tls', 'quic'].includes(formData.value.type))

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

// v-model sync for dnsServer
watch(formData, (val) => {
  emit('update:dnsServer', { ...val })
}, { deep: true })

// Mutual exclusion watchers for detour fields
// removed mutual exclusion with wg_endpoint_detour as endpoint detour is not exposed in UI

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

// removed WireGuard endpoints loader as endpoint detour field is removed

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

    // Do not call API; emit to parent
    emit('save', dataToSave)
  } catch (error) {
    console.error('Error saving DNS server:', error)
    alert('Failed to save DNS server')
  } finally {
    saving.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadOutbounds()
})
</script>

<style lang="scss">
@use './index.scss';
</style>
