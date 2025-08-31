<script setup lang="ts">
import { useRouter } from 'vue-router'
import DNSRuleEditor from '@/components/dnsRuleEditor/dnsRuleEditor.vue'
import type { DNSRule } from '@/components/dnsRuleEditor/types'

const router = useRouter()

const handleSave = (dnsRule: DNSRule) => {
  // Navigate back to DNS view after successful save
  router.push('/dns')
}

const handleCancel = () => {
  // Navigate back to DNS view
  router.push('/dns')
}
</script>

<template>
  <DNSRuleEditor 
    mode="create"
    @save="handleSave"
    @cancel="handleCancel"
  />
</template>

<style>
</style>
