<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DNSServerList from '@/components/dnsServerList/dnsServerList.vue'
import type { DNSServer } from '@/components/dnsServerList/types'

const router = useRouter()
const dnsServerListRef = ref<InstanceType<typeof DNSServerList> | null>(null)

const handleCreate = () => {
  router.push('/dns-servers/create')
}

const handleEdit = (server: DNSServer) => {
  router.push(`/dns-servers/${server.id}/edit`)
}
</script>

<template>
  <DNSServerList 
    ref="dnsServerListRef"
    @create="handleCreate"
    @edit="handleEdit"
  />
</template>

<style>
</style>
