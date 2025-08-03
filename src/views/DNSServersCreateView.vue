<script setup lang="ts">
import { useRouter } from 'vue-router'
import DNSServerEditor from '@/components/dnsServerEditor/dnsServerEditor.vue'
import type { DNSServer } from '@/components/dnsServerEditor/types'

const router = useRouter()

const handleSave = (dnsServer: DNSServer) => {
  // Navigate back to DNS servers list after successful save
  router.push('/dns-servers')
}

const handleCancel = () => {
  // Navigate back to DNS servers list
  router.push('/dns-servers')
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
