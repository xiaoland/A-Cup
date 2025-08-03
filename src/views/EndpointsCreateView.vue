<script setup lang="ts">
import WireguardEndpointEditor from '@/components/wireguardEndpointEditor/wireguardEndpointEditor.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { WireguardEndpoint } from '@/components/wireguardEndpointEditor/types'

const router = useRouter()
const userStore = useUserStore()

const handleSave = async (endpoint: WireguardEndpoint) => {
  try {
    const response = await userStore.authorizedFetch('/api/endpoints/wireguard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(endpoint)
    })
    
    if (response.ok) {
      router.push('/endpoints')
    } else {
      console.error('Failed to create endpoint')
    }
  } catch (error) {
    console.error('Error creating endpoint:', error)
  }
}

const handleCancel = () => {
  router.push('/endpoints')
}
</script>

<template>
  <WireguardEndpointEditor
    mode="create"
    @save="handleSave"
    @cancel="handleCancel"
  />
</template>

<style>
</style>
