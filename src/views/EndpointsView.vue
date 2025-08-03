<script setup lang="ts">
import EndpointList from '@/components/endpointList/endpointList.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { Endpoint } from '@/components/endpointList/types'

const router = useRouter()
const userStore = useUserStore()
const endpoints = ref<Endpoint[]>([])
const loading = ref(false)

const loadEndpoints = async () => {
  loading.value = true
  try {
    const response = await userStore.authorizedFetch('/api/endpoints')
    
    if (response.ok) {
      endpoints.value = await response.json()
    } else {
      console.error('Failed to load endpoints')
    }
  } catch (error) {
    console.error('Failed to load endpoints:', error)
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  router.push('/endpoints/create')
}

const handleEdit = (endpoint: Endpoint) => {
  router.push(`/endpoints/edit/${endpoint.id}`)
}

const handleDelete = async (endpoint: Endpoint) => {
  try {
    const response = await userStore.authorizedFetch(`/api/endpoints/${endpoint.type}/${endpoint.id}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      await loadEndpoints()
    } else {
      console.error('Failed to delete endpoint')
    }
  } catch (error) {
    console.error('Failed to delete endpoint:', error)
  }
}

const handleExport = async (endpoint: Endpoint, format: string) => {
  try {
    const response = await userStore.authorizedFetch(`/api/endpoints/${endpoint.type}/${endpoint.id}/export/${format}`)
    
    if (response.ok) {
      const config = await response.json()
      
      // Create and download the file
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${endpoint.name}_${format}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else {
      console.error('Failed to export endpoint')
    }
  } catch (error) {
    console.error('Failed to export endpoint:', error)
  }
}

onMounted(() => {
  loadEndpoints()
})
</script>

<template>
  <EndpointList
    :endpoints="endpoints"
    :loading="loading"
    @create="handleCreate"
    @edit="handleEdit"
    @delete="handleDelete"
    @export="handleExport"
    @refresh="loadEndpoints"
  />
</template>

<style>
</style>
