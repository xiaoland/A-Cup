<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import OutboundEditor from '@/components/outbounds/outboundEditor/outboundEditor.vue'
import type { Outbound } from '@/components/outbounds/outboundEditor/types'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const outbound = ref<Outbound | undefined>(undefined)
const loading = ref(true)

const userStore = useUserStore()

const loadOutbound = async () => {
  const id = route.params.id
  if (!id) return

  try {
    const response = await userStore.authorizedFetch(`/api/outbounds/${id}`)
    
    if (response.ok) {
      outbound.value = await response.json()
    } else {
      console.error('Failed to load outbound')
    }
  } catch (error) {
    console.error('Error loading outbound:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOutbound()
})
</script>

<template>
  <div v-if="loading" class="d-flex justify-center align-center" style="height: 400px;">
    <v-progress-circular indeterminate color="primary" size="64" />
  </div>
  
  <OutboundEditor
    v-else-if="outbound"
    :outbound="outbound"
    mode="edit"
  />
  
  <v-alert
    v-else
    type="error"
    variant="tonal"
    class="ma-4"
  >
    Outbound not found
  </v-alert>
</template>

<style>
</style>
