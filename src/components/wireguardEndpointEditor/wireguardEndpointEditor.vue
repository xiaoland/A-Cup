<template>
  <v-container class="wireguard-endpoint-editor">
    <v-card>
      <v-card-title>
        <v-icon class="me-2">mdi-vpn</v-icon>
        {{ isEditing ? 'Edit WireGuard Endpoint' : 'Create WireGuard Endpoint' }}
      </v-card-title>
      
      <v-card-text>
        <v-form @submit.prevent="saveEndpoint" ref="form">
          <!-- Basic Information -->
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="text-h6 section-header">Basic Information</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.name"
                    label="Interface Name *"
                    required
                    variant="outlined"
                    hint="Custom system interface name"
                    persistent-hint
                    :rules="[v => !!v || 'Name is required']"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="formData.share"
                    label="Share with other users"
                    color="primary"
                    hint="Allow other users to see and use this endpoint"
                    persistent-hint
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="formData.system"
                    label="Use system interface"
                    color="primary"
                    hint="Use system's network interface"
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
                    hint="Maximum transmission unit (default: 1408)"
                    persistent-hint
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Network Configuration -->
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="text-h6 section-header">Network Configuration</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="newAddress"
                    label="Add IP Address"
                    placeholder="10.0.0.1/24 or fd00::1/64"
                    variant="outlined"
                    hint="Press Enter to add address"
                    @keyup.enter.stop="addAddress"
                    @keydown.enter.prevent
                    :error-messages="addressError"
                  />
                  <div class="ip-chips mt-2">
                    <v-chip
                      v-for="(address, index) in formData.addresses"
                      :key="index"
                      closable
                      @click:close="removeAddress(index)"
                      color="primary"
                      variant="outlined"
                    >
                      {{ address }}
                    </v-chip>
                  </div>
                  <div v-if="formData.addresses.length === 0" class="validation-error">
                    At least one IP address is required
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Cryptographic Keys -->
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="text-h6 section-header">Cryptographic Keys</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.private_key"
                    label="Private Key *"
                    required
                    variant="outlined"
                    class="key-field"
                    hint="Base64 encoded private key"
                    persistent-hint
                    :rules="[v => !!v || 'Private key is required', validatePrivateKey]"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.public_key"
                    label="Public Key *"
                    required
                    variant="outlined"
                    class="key-field"
                    hint="Base64 encoded public key"
                    persistent-hint
                    :rules="[v => !!v || 'Public key is required', validatePublicKey]"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.preshared_key"
                    label="Preshared Key (Optional)"
                    variant="outlined"
                    class="key-field"
                    hint="Base64 encoded preshared key for additional security"
                    persistent-hint
                    :rules="[validatePresharedKey]"
                  />
                </v-col>
                <v-col cols="12" md="6" class="d-flex align-center">
                  <v-btn
                    @click="generateKeys"
                    variant="outlined"
                    color="primary"
                    prepend-icon="mdi-key-plus"
                  >
                    Generate Key Pair
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Peers -->
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="text-h6 section-header">Peers</v-card-title>
            <v-card-text>
              <div v-if="formData.peers.length === 0" class="text-center py-4">
                <v-icon size="48" color="grey">mdi-account-network</v-icon>
                <p class="text-grey mt-2">No peers configured</p>
              </div>
              
              <div v-for="(peer, index) in formData.peers" :key="index" class="peer-card">
                <div class="peer-actions">
                  <v-btn
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="error"
                    @click="removePeer(index)"
                  />
                </div>
                
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="peer.address"
                      label="Peer Address *"
                      variant="outlined"
                      hint="IP address or domain name"
                      persistent-hint
                      :rules="[v => !!v || 'Address is required']"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="peer.port"
                      label="Port *"
                      type="number"
                      min="1"
                      max="65535"
                      variant="outlined"
                      hint="Port the peer is listening on"
                      persistent-hint
                      :rules="[v => !!v || 'Port is required', v => (v >= 1 && v <= 65535) || 'Port must be between 1 and 65535']"
                    />
                  </v-col>
                </v-row>
                
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model="peer.newAllowedIp"
                      label="Add Allowed IP"
                      placeholder="0.0.0.0/0 or ::/0"
                      variant="outlined"
                      hint="Press Enter to add allowed IP"
                      @keyup.enter.stop="addAllowedIp(peer, index)"
                      @keydown.enter.prevent
                    />
                    <div class="ip-chips mt-2">
                      <v-chip
                        v-for="(ip, ipIndex) in peer.allowed_ips"
                        :key="ipIndex"
                        closable
                        @click:close="removeAllowedIp(peer, ipIndex)"
                        color="secondary"
                        variant="outlined"
                      >
                        {{ ip }}
                      </v-chip>
                    </div>
                  </v-col>
                </v-row>
              </div>
              
              <v-btn
                @click="addPeer"
                variant="outlined"
                color="primary"
                block
                class="add-peer-btn mt-4"
                prepend-icon="mdi-plus"
              >
                Add Peer
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Actions -->
          <div class="form-actions">
            <v-btn
              variant="outlined"
              @click="$emit('cancel')"
            >
              Cancel
            </v-btn>
            <v-btn
              type="submit"
              color="primary"
              :loading="saving"
            >
              {{ isEditing ? 'Update Endpoint' : 'Create Endpoint' }}
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { WireguardEndpoint, Peer, Props } from './types'
import { isValidCIDR, isValidWireguardKey } from './types'

// Props and emits
const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
})

const emit = defineEmits<{
  save: [endpoint: WireguardEndpoint]
  cancel: []
}>()

// Reactive data
const form = ref()
const saving = ref(false)
const newAddress = ref('')
const addressError = ref('')

// Form data
const formData = ref<WireguardEndpoint>({
  name: '',
  system: false,
  addresses: [],
  private_key: '',
  public_key: '',
  preshared_key: '',
  peers: [],
  mtu: 1408,
  share: false
})

// Computed
const isEditing = computed(() => props.mode === 'edit')

// Methods
const addAddress = () => {
  if (!newAddress.value) return
  
  if (!isValidCIDR(newAddress.value)) {
    addressError.value = 'Invalid IP address format. Use CIDR notation (e.g., 10.0.0.1/24)'
    return
  }
  
  if (formData.value.addresses.includes(newAddress.value)) {
    addressError.value = 'Address already added'
    return
  }
  
  formData.value.addresses.push(newAddress.value)
  newAddress.value = ''
  addressError.value = ''
}

const removeAddress = (index: number) => {
  formData.value.addresses.splice(index, 1)
}

const addPeer = () => {
  formData.value.peers.push({
    address: '',
    port: 51820,
    allowed_ips: [],
    newAllowedIp: ''
  })
}

const removePeer = (index: number) => {
  formData.value.peers.splice(index, 1)
}

const addAllowedIp = (peer: Peer, peerIndex: number) => {
  if (!peer.newAllowedIp) return
  
  if (!isValidCIDR(peer.newAllowedIp)) {
    // Could show a toast notification or set an error message
    console.warn('Invalid IP address format. Use CIDR notation (e.g., 0.0.0.0/0)')
    return
  }
  
  if (peer.allowed_ips.includes(peer.newAllowedIp)) {
    // Could show a toast notification or set an error message
    console.warn('IP address already added')
    return
  }
  
  peer.allowed_ips.push(peer.newAllowedIp)
  peer.newAllowedIp = ''
}

const removeAllowedIp = (peer: Peer, ipIndex: number) => {
  peer.allowed_ips.splice(ipIndex, 1)
}

const validatePrivateKey = (value: string) => {
  if (!value) return true // Required validation handles empty
  return isValidWireguardKey(value) || 'Invalid private key format'
}

const validatePublicKey = (value: string) => {
  if (!value) return true // Required validation handles empty
  return isValidWireguardKey(value) || 'Invalid public key format'
}

const validatePresharedKey = (value: string) => {
  if (!value) return true // Optional field
  return isValidWireguardKey(value) || 'Invalid preshared key format'
}

const generateKeys = async () => {
  // This would typically call a crypto library to generate WireGuard keys
  // For now, show a placeholder
  console.log('Key generation not implemented - use wg genkey/pubkey commands')
}

const saveEndpoint = async () => {
  if (!form.value?.validate()) return
  
  if (formData.value.addresses.length === 0) {
    // Show error
    return
  }
  
  saving.value = true
  
  try {
    // Clean up the data before emitting
    const cleanData = {
      ...formData.value,
      peers: formData.value.peers.map(peer => ({
        id: peer.id,
        address: peer.address,
        port: peer.port,
        allowed_ips: peer.allowed_ips
      }))
    }
    
    emit('save', cleanData)
  } catch (error) {
    console.error('Error saving endpoint:', error)
  } finally {
    saving.value = false
  }
}

// Initialize form data
onMounted(() => {
  if (props.endpoint) {
    formData.value = {
      ...props.endpoint,
      peers: props.endpoint.peers.map(peer => ({
        ...peer,
        newAllowedIp: ''
      }))
    }
  }
})
</script>

<style scoped lang="scss">
@use './index.scss';
</style>
