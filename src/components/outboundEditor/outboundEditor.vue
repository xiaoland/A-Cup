<template>
  <v-container class="outbound-editor">
    <v-card>
      <v-card-title>
        <v-icon class="me-2">mdi-server-network</v-icon>
        {{ isEditing ? 'Edit Outbound' : 'Create Outbound' }}
      </v-card-title>
      
      <v-card-text>
        <v-form @submit.prevent="saveOutbound">
          <!-- Basic Info -->
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="text-h6">Basic Information</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.name"
                    label="Name"
                    placeholder="Friendly name for this outbound"
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.type"
                    :items="typeOptions"
                    label="Type *"
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

          <!-- Server Configuration -->
          <v-card variant="outlined" class="mb-6" v-if="needsServerConfig">
            <v-card-title class="text-h6">Server Configuration</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.region"
                    :items="regionOptions"
                    label="Region"
                    variant="outlined"
                    clearable
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.address"
                    label="Server Address"
                    placeholder="example.com"
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="formData.port"
                    label="Server Port"
                    type="number"
                    min="1"
                    max="65535"
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.network"
                    :items="networkOptions"
                    label="Network"
                    variant="outlined"
                    clearable
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Authentication -->
          <v-card variant="outlined" class="mb-6" v-if="needsAuth">
            <v-card-title class="text-h6">Authentication</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" v-if="formData.type === 'vmess' || formData.type === 'vless'">
                  <v-text-field
                    v-model="formData.uuid"
                    label="UUID"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" v-if="formData.type === 'ss' || formData.type === 'hysteria2'">
                  <v-text-field
                    v-model="formData.password"
                    label="Password"
                    type="password"
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" md="6" v-if="formData.type === 'vmess'">
                  <v-text-field
                    v-model.number="formData.alter_id"
                    label="Alter ID"
                    type="number"
                    min="0"
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" md="6" v-if="formData.type === 'vless'">
                  <v-text-field
                    v-model="formData.flow"
                    label="Flow"
                    placeholder="xtls-rprx-vision"
                    variant="outlined"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Encryption -->
          <v-card variant="outlined" class="mb-6" v-if="needsEncryption">
            <v-card-title class="text-h6">Encryption</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6" v-if="formData.type === 'ss'">
                  <v-select
                    v-model="formData.method"
                    :items="methodOptions"
                    label="Encryption Method"
                    variant="outlined"
                    hint="Encryption algorithm for Shadowsocks"
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="6" v-if="formData.type === 'vmess' || formData.type === 'vless'">
                  <v-select
                    v-model="formData.security"
                    :items="securityOptions"
                    label="Security"
                    variant="outlined"
                    hint="Security/encryption type for VMess/VLESS"
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="6" v-if="formData.network === 'udp'">
                  <v-text-field
                    v-model="formData.packet_encoding"
                    label="Packet Encoding"
                    variant="outlined"
                    hint="UDP packet encoding method"
                    persistent-hint
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Advanced Configuration -->
          <v-card variant="outlined" class="mb-6" v-if="needsAdvanced">
            <v-card-title class="text-h6">Advanced Configuration</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-textarea
                    v-model="transportJson"
                    label="Transport (JSON)"
                    placeholder='{"type": "ws", "path": "/"}'
                    rows="4"
                    variant="outlined"
                    @blur="validateJson('transport')"
                    :error-messages="transportError"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-textarea
                    v-model="tlsJson"
                    label="TLS (JSON)"
                    placeholder='{"enabled": true, "server_name": "example.com"}'
                    rows="4"
                    variant="outlined"
                    @blur="validateJson('tls')"
                    :error-messages="tlsError"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Selector/URLTest Outbounds -->
          <v-card variant="outlined" class="mb-6" v-if="formData.type === 'selector' || formData.type === 'urltest'">
            <v-card-title class="text-h6">Outbound References</v-card-title>
            <v-card-text>
              <v-select
                v-model="formData.outbounds"
                :items="outboundItems"
                label="Select Outbounds"
                multiple
                chips
                variant="outlined"
                :loading="loadingOutbounds"
              >
                <template v-slot:chip="{ props, item }">
                  <v-chip v-bind="props" :text="item.title" />
                </template>
              </v-select>
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
          @click="saveOutbound"
        >
          Save Outbound
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Outbound, Props, OutboundSelectItem } from './types'
import { typeOptions, regionOptions, networkOptions, methodOptions, securityOptions } from './types'
import { useUserStore } from '@/stores/user'

const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
})

const emit = defineEmits<{
  save: [outbound: Outbound]
  cancel: []
}>()

// Store and router
const userStore = useUserStore()
const router = useRouter()

// Form data
const formData = ref<Outbound>({
  share: false,
  name: '',
  type: '',
  outbounds: [],
  region: '',
  address: '',
  port: undefined,
  network: '',
  encryption: '',  // Legacy field
  method: '',      // SingBox method field
  security: '',    // SingBox security field
  packet_encoding: '',
  uuid: '',
  password: '',
  alter_id: undefined,
  flow: '',
  transport: null,
  tls: null
})

// JSON string representations for complex fields
const transportJson = ref('')
const tlsJson = ref('')
const transportError = ref('')
const tlsError = ref('')

// State
const loading = ref(false)
const loadingOutbounds = ref(false)
const availableOutbounds = ref<Outbound[]>([])

// Computed properties
const isEditing = computed(() => props.mode === 'edit')

const outboundItems = computed(() => {
  return availableOutbounds.value.map(outbound => ({
    title: outbound.name || `${outbound.type}.${outbound.region} (${outbound.address})`,
    value: outbound.id
  }))
})

const needsServerConfig = computed(() => {
  return ['vmess', 'vless', 'ss', 'hysteria2'].includes(formData.value.type)
})

const needsAuth = computed(() => {
  return ['vmess', 'vless', 'ss', 'hysteria2'].includes(formData.value.type)
})

const needsEncryption = computed(() => {
  return ['vmess', 'vless', 'ss', 'hysteria2'].includes(formData.value.type)
})

const needsAdvanced = computed(() => {
  return ['vmess', 'vless', 'ss', 'hysteria2'].includes(formData.value.type)
})

// Initialize form data
const initializeForm = () => {
  if (props.outbound) {
    formData.value = { ...props.outbound }
    transportJson.value = formData.value.transport ? JSON.stringify(formData.value.transport, null, 2) : ''
    tlsJson.value = formData.value.tls ? JSON.stringify(formData.value.tls, null, 2) : ''
  }
}

// Load available outbounds for selector/urltest
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

// JSON validation
const validateJson = (field: 'transport' | 'tls') => {
  const jsonStr = field === 'transport' ? transportJson.value : tlsJson.value
  const errorRef = field === 'transport' ? transportError : tlsError
  
  if (!jsonStr.trim()) {
    errorRef.value = ''
    formData.value[field] = null
    return
  }
  
  try {
    const parsed = JSON.parse(jsonStr)
    formData.value[field] = parsed
    errorRef.value = ''
  } catch (error) {
    errorRef.value = 'Invalid JSON format'
  }
}

// Clean form data by converting empty strings to undefined
const cleanFormData = (data: Outbound): Outbound => {
  const cleaned = { ...data }
  
  // Clean string fields
  const stringFields: (keyof Outbound)[] = [
    'name', 'region', 'address', 'network', 'encryption', 'method', 'security',
    'packet_encoding', 'uuid', 'password', 'flow'
  ]
  
  stringFields.forEach(field => {
    if (cleaned[field] === '') {
      (cleaned as any)[field] = undefined
    }
  })
  
  // Clean number fields
  if (cleaned.port === 0 || cleaned.port === null) {
    cleaned.port = undefined
  }
  if (cleaned.alter_id === 0 || cleaned.alter_id === null) {
    cleaned.alter_id = undefined
  }
  
  return cleaned
}

// Save outbound
const saveOutbound = async () => {
  if (transportError.value || tlsError.value) {
    return
  }
  
  loading.value = true
  
  try {
    const url = isEditing.value ? `/api/outbounds/${formData.value.id}` : '/api/outbounds'
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
      const savedOutbound = await response.json()
      emit('save', savedOutbound)
      // Navigate back to list on success
      router.push('/outbounds')
    } else {
      const error = await response.text()
      console.error('Failed to save outbound:', error)
      // Handle error (show toast, etc.)
    }
  } catch (error) {
    console.error('Failed to save outbound:', error)
    // Handle error
  } finally {
    loading.value = false
  }
}

// Handle cancel action
const handleCancel = () => {
  emit('cancel')
  router.push('/outbounds')
}

// Watch for JSON changes
watch([transportJson, tlsJson], () => {
  validateJson('transport')
  validateJson('tls')
})

// Lifecycle
onMounted(() => {
  initializeForm()
  loadAvailableOutbounds()
})
</script>

<style scoped lang="scss">
@use './index.scss';
</style>