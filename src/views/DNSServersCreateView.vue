<script setup lang="ts">
import { useRouter } from 'vue-router'
import DNSServerEditor from '@/components/dnsServerEditor/dnsServerEditor.vue'
import type { DNSServer } from '@/components/dnsServerEditor/types'

const router = useRouter()

const handleSave = (dnsServer: DNSServer) => {
  // Navigate back to DNS view after successful save
  router.push('/dns')
}

const handleCancel = () => {
  // Navigate back to DNS view
  router.push('/dns')
}
</script>

<template>
  <DNSServerEditor 
    mode="create"
    @save="handleSave"
    @cancel="handleCancel"
  />
</template>

<style>
</style>
