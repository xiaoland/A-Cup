<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import InboundEditor from '@/components/inboundEditor/inboundEditor.vue'
import type { Inbound } from '@/components/inboundEditor/types'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const inbound = ref<Inbound | undefined>(undefined)
const loading = ref(false)

// Load inbound data for editing
const loadInbound = async () => {
  const inboundId = route.params.id
  if (!inboundId) return
  
  loading.value = true
  try {
    const response = await userStore.authorizedFetch(`/api/inbounds/${inboundId}`)
    
    if (response.ok) {
      inbound.value = await response.json()
    } else {
      console.error('Failed to load inbound')
      router.push('/inbounds') // Redirect to list if not found
    }
  } catch (error) {
    console.error('Failed to load inbound:', error)
    router.push('/inbounds') // Redirect to list on error
  } finally {
    loading.value = false
  }
}

const handleSave = (updatedInbound: Inbound) => {
  // Navigate back to inbounds list after successful save
  router.push('/inbounds')
}

const handleCancel = () => {
  // Navigate back to inbounds list
  router.push('/inbounds')
}

onMounted(() => {
  loadInbound()
})
</script>

<template>
  <div v-if="loading" class="d-flex justify-center pa-8">
    <v-progress-circular indeterminate color="primary" />
  </div>
  
  <InboundEditor 
    v-else-if="inbound"
    mode="edit"
    :inbound="inbound"
    @save="handleSave"
    @cancel="handleCancel"
  />
  
  <div v-else class="d-flex justify-center pa-8">
    <v-alert type="error">
      Inbound not found
    </v-alert>
  </div>
</template>

<style>
</style>
