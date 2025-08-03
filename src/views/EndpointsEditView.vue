<script setup lang="ts">
import WireguardEndpointEditor from '@/components/wireguardEndpointEditor/wireguardEndpointEditor.vue'
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { WireguardEndpoint } from '@/components/wireguardEndpointEditor/types'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const endpoint = ref<WireguardEndpoint>()
const loading = ref(false)

const loadEndpoint = async () => {
  const id = route.params.id
  if (!id) return
  
  loading.value = true
  try {
    const response = await userStore.authorizedFetch(`/api/endpoints/wireguard/${id}`)
    
    if (response.ok) {
      endpoint.value = await response.json()
    } else {
      router.push('/endpoints')
    }
  } catch (error) {
    console.error('Failed to load endpoint:', error)
    router.push('/endpoints')
  } finally {
    loading.value = false
  }
}

const handleSave = async (updatedEndpoint: WireguardEndpoint) => {
  const id = route.params.id
  if (!id) return
  
  try {
    const response = await userStore.authorizedFetch(`/api/endpoints/wireguard/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedEndpoint)
    })
    
    if (response.ok) {
      router.push('/endpoints')
    } else {
      console.error('Failed to update endpoint')
    }
  } catch (error) {
    console.error('Error updating endpoint:', error)
  }
}

const handleCancel = () => {
  router.push('/endpoints')
}

onMounted(() => {
  loadEndpoint()
})
</script>

<template>
  <div v-if="loading" class="text-center py-8">
    <v-progress-circular indeterminate color="primary" size="64" />
    <p class="mt-4">Loading endpoint...</p>
  </div>
  
  <WireguardEndpointEditor
    v-else-if="endpoint"
    mode="edit"
    :endpoint="endpoint"
    @save="handleSave"
    @cancel="handleCancel"
  />
</template>

<style>
</style>
