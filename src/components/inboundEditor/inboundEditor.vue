<template>
  <v-container class="inbound-editor">
    <v-card>
      <v-card-title>
        <v-icon class="me-2">mdi-router-network</v-icon>
        {{ isEditing ? 'Edit Inbound' : 'Create Inbound' }}
      </v-card-title>
      
      <v-card-text>
        <v-form @submit.prevent="saveInbound">
          <!-- Basic Info -->
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="text-h6">Basic Information</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.type"
                    :items="typeOptions"
                    label="Type *"
                    required
                    variant="outlined"
                    hint="Mixed: proxy socks5/http traffic on port, TUN: virtual NIC for transport proxy"
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="formData.share"
                    label="Share with other users"
                    color="primary"
                    hint="Allow other users to see and use this inbound"
                    persistent-hint
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Network Configuration -->
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="text-h6">Network Configuration</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.address"
                    label="Listen Address"
                    placeholder="0.0.0.0"
                    variant="outlined"
                    hint="IP address to bind to (optional, defaults to all interfaces)"
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="formData.port"
                    label="Listen Port"
                    type="number"
                    min="1"
                    max="65535"
                    variant="outlined"
                    :hint="formData.type === 'mixed' ? 'Port to listen for proxy connections' : 'Optional for TUN mode'"
                    persistent-hint
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- TUN-specific Configuration -->
          <v-card variant="outlined" class="mb-6" v-if="formData.type === 'tun'">
            <v-card-title class="text-h6">TUN Configuration</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.stack"
                    :items="stackOptions"
                    label="Network Stack"
                    variant="outlined"
                    hint="System: best performance, gVisor: best compatibility, Mixed: balanced"
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="formData.mtu"
                    label="MTU"
                    type="number"
                    min="1280"
                    max="9000"
                    variant="outlined"
                    hint="Maximum transmission unit (default: 9000)"
                    persistent-hint
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- TUN Routing Configuration -->
          <v-card variant="outlined" class="mb-6" v-if="formData.type === 'tun'">
            <v-card-title class="text-h6">Routing Configuration</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="4">
                  <v-switch
                    v-model="formData.auto_route"
                    label="Auto Route"
                    color="primary"
                    hint="Automatically configure routing table"
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-switch
                    v-model="formData.auto_redirect"
                    label="Auto Redirect"
                    color="primary"
                    hint="Automatically redirect traffic"
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-switch
                    v-model="formData.strict_route"
                    label="Strict Route"
                    color="primary"
                    hint="Enable strict routing mode"
                    persistent-hint
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
          @click="$emit('cancel')"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          :loading="loading"
          @click="saveInbound"
        >
          Save Inbound
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Inbound, Props } from './types'
import { typeOptions, stackOptions } from './types'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
})

const emit = defineEmits<{
  save: [inbound: Inbound]
  cancel: []
}>()

// Form data
const formData = ref<Inbound>({
  share: false,
  type: 'mixed',
  address: '',
  port: undefined,
  stack: 'mixed',
  mtu: 9000,
  auto_route: true,
  auto_redirect: true,
  strict_route: true
})

// State
const loading = ref(false)

// Computed properties
const isEditing = computed(() => props.mode === 'edit')

// Initialize form data
const initializeForm = () => {
  if (props.inbound) {
    formData.value = { ...props.inbound }
  }
}

// Clean form data by converting empty strings to undefined
const cleanFormData = (data: Inbound): Inbound => {
  const cleaned = { ...data }
  
  // Clean string fields
  if (cleaned.address === '') {
    cleaned.address = undefined
  }
  
  // Clean number fields
  if (cleaned.port === 0 || cleaned.port === null) {
    cleaned.port = undefined
  }
  if (cleaned.mtu === 0 || cleaned.mtu === null) {
    cleaned.mtu = undefined
  }
  
  // Boolean fields are kept as-is (true/false)
  
  return cleaned
}

// Save inbound
const saveInbound = async () => {
  loading.value = true
  
  try {
    const url = isEditing.value ? `/api/inbounds/${formData.value.id}` : '/api/inbounds'
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
      const savedInbound = await response.json()
      emit('save', savedInbound)
    } else {
      const error = await response.text()
      console.error('Failed to save inbound:', error)
      // Handle error (show toast, etc.)
    }
  } catch (error) {
    console.error('Failed to save inbound:', error)
    // Handle error
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  initializeForm()
})
</script>

<style scoped lang="scss">
@use './index.scss';
</style>
