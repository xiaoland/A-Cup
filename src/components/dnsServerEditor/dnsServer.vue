<template>
  <v-container class="dns-server">
    <v-card>
      <v-card-title>
        <v-icon class="me-2">mdi-dns</v-icon>
        DNS Server
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
            <v-card-title class="text-h6">Server Configuration</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="4">
                  <v-select v-model="form.type" :items="typeOptions" :readonly="!editable" label="Type *" required variant="outlined" @update:model-value="onTypeChange" />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field v-model="form.address" :readonly="!editable" label="Server Address *" required variant="outlined" />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field v-model.number="form.port" :readonly="!editable" label="Port" type="number" variant="outlined" />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card variant="outlined" class="form-section">
            <v-card-title class="text-h6">Detour Configuration</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-select v-model="form.outbound_detour" :items="outboundOptions" :readonly="!editable" label="Outbound Detour" variant="outlined" clearable :loading="loadingOutbounds" />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-expansion-panels class="advanced-options">
            <v-expansion-panel>
              <v-expansion-panel-title>Advanced Options</v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-card variant="outlined" class="mb-4" v-if="isTLSType">
                  <v-card-title class="text-h6">TLS Settings</v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col cols="12" md="4">
                        <v-switch v-model="tlsEnabled" :disabled="!editable" label="Enable TLS" color="primary" @update:model-value="onTLSToggle" />
                      </v-col>
                      <v-col cols="12" md="4" v-if="tlsEnabled">
                        <v-text-field v-model="form.tls!.server_name" :readonly="!editable" label="Server Name" variant="outlined" />
                      </v-col>
                      <v-col cols="12" md="4" v-if="tlsEnabled">
                        <v-switch v-model="form.tls!.insecure" :disabled="!editable" label="Skip Certificate Verification" color="warning" />
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>

                <v-card variant="outlined" v-if="isHTTPSType">
                  <v-card-title class="text-h6">HTTPS Settings</v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field v-model="form.https!.path" :readonly="!editable" label="Path" placeholder="/dns-query" variant="outlined" />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-textarea v-model="headersText" :readonly="!editable" label="HTTP Headers" placeholder="header1: value1&#10;header2: value2" variant="outlined" rows="3" @update:model-value="onHeadersChange" />
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <div class="action-buttons">
            <v-btn @click="$emit('cancel')" variant="outlined" :disabled="!editable">Cancel</v-btn>
            <v-btn type="submit" color="primary" :loading="saving">{{ editable ? 'Save' : 'Edit' }}</v-btn>
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
import { typeOptions, DEFAULT_PORTS } from './types'
import type { DNSServer } from './index'

const props = withDefaults(defineProps<{ dnsServer?: DNSServer; editable?: boolean }>(), {
  editable: false,
  dnsServer: () => ({ name: '', type: 'udp', address: '', port: 53, tls: {}, https: {}, outbound_detour: null, wg_endpoint_detour: null }) as DNSServer,
})
const emit = defineEmits<{ save: [dnsServer: DNSServer]; cancel: []; 'request-edit': [] }>()

const userStore = useUserStore()
const saving = ref(false)
const loadingOutbounds = ref(false)
const outboundOptions = ref<SelectOption[]>([])

import { toRef } from 'vue'
const form = toRef(props, 'dnsServer')

const tlsEnabled = ref(false)
const headersText = ref('')

const isHTTPSType = computed(() => form.value.type === 'https' || form.value.type === 'h3')
const isTLSType = computed(() => ['https', 'h3', 'tls', 'quic'].includes(form.value.type))

watch(form, (val) => {
  tlsEnabled.value = !!(val.tls?.enabled || val.tls?.server_name || val.tls?.insecure)
  if (val.https?.headers) {
    headersText.value = Object.entries(val.https.headers).map(([k, v]) => `${k}: ${v}`).join('\n')
  }
}, { immediate: true, deep: true })

const onTypeChange = () => {
  if (!form.value.port || (form.value.port && Object.values(DEFAULT_PORTS).includes(form.value.port))) {
    form.value.port = DEFAULT_PORTS[form.value.type] || null
  }
}

const onTLSToggle = () => {
  if (tlsEnabled.value) {
    form.value.tls = { enabled: true, server_name: '', insecure: false }
  } else {
    form.value.tls = {}
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
      if (key.trim() && value) headers[key.trim()] = value
    }
  }
  if (Object.keys(headers).length > 0) {
    form.value.https = form.value.https || {}
    form.value.https!.headers = headers
  } else if (form.value.https) {
    delete form.value.https!.headers
  }
}

const loadOutbounds = async () => {
  try {
    loadingOutbounds.value = true
    const response = await fetch('/api/outbounds', { headers: { 'Authorization': `Bearer ${userStore.token}` } })
    if (response.ok) {
      const outbounds = await response.json()
      outboundOptions.value = outbounds.map((o: any) => ({ title: `${o.type} - ${o.address || 'N/A'}:${o.port || 'N/A'}`, value: o.id }))
    }
  } finally {
    loadingOutbounds.value = false
  }
}

const onPrimary = () => {
  if (!props.editable) {
    emit('request-edit')
    return
  }
  saveDNSServer()
}

const saveDNSServer = () => {
  saving.value = true
  try {
    const dataToSave: DNSServer = { ...form.value }
    if (!tlsEnabled.value || Object.keys(form.value.tls || {}).length === 0) delete (dataToSave as any).tls
    if (!isHTTPSType.value || (!form.value.https?.path && !form.value.https?.headers)) delete (dataToSave as any).https
    emit('save', dataToSave)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadOutbounds()
})
</script>

<style lang="scss">
@use './index.scss';
</style>
