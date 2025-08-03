<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import InboundEditor from '@/components/inboundEditor/inboundEditor.vue'
import type { Inbound } from '@/components/inboundEditor/types'

const router = useRouter()

const handleSave = (inbound: Inbound) => {
  // Navigate back to inbounds list after successful save
  router.push('/inbounds')
}

const handleCancel = () => {
  // Navigate back to inbounds list
  router.push('/inbounds')
}
</script>

<template>
  <InboundEditor 
    mode="create"
    @save="handleSave"
    @cancel="handleCancel"
  />
</template>

<style>
</style>
