<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DNSServerEditor from '@/components/dnsServerEditor/dnsServerEditor.vue'
import type { DNSServer } from '@/components/dnsServerEditor/types'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const dnsServer = ref<DNSServer | undefined>(undefined)
const loading = ref(false)

// Load DNS server data for editing
const loadDNSServer = async () => {
  const serverId = route.params.id
  if (!serverId) return
  
  loading.value = true
  try {
    const response = await fetch(`/api/dns_servers/${serverId}`, {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    
    if (response.ok) {
      dnsServer.value = await response.json()
    } else {
      console.error('Failed to load DNS server')
      router.push('/dns') // Redirect to unified view if not found
    }
  } catch (error) {
    console.error('Failed to load DNS server:', error)
    router.push('/dns') // Redirect to unified view on error
  } finally {
    loading.value = false
  }
}

const handleSave = (updatedDNSServer: DNSServer) => {
  // Navigate back to DNS view after successful save
  router.push('/dns')
}

const handleCancel = () => {
  // Navigate back to DNS view
  router.push('/dns')
}

onMounted(() => {
  loadDNSServer()
})
</script>

<template>
  <div v-if="loading" class="text-center pa-8">
    <v-progress-circular
      indeterminate
      color="primary"
      size="48"
    />
    <p class="text-body-1 mt-4">Loading DNS server...</p>
  </div>
  
  <DNSServerEditor 
    v-else
    mode="edit"
    :dns-server="dnsServer"
    @save="handleSave"
    @cancel="handleCancel"
  />
</template>

<style>
</style>
