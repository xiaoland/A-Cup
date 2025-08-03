<script setup lang="ts">
import { useRouter } from 'vue-router'
import DNSRuleEditor from '@/components/dnsRuleEditor/dnsRuleEditor.vue'
import type { DNSRule } from '@/components/dnsRuleEditor/types'

const router = useRouter()

const handleSave = (dnsRule: DNSRule) => {
  // Navigate back to DNS rules list after successful save
  router.push('/dns-rules')
}

const handleCancel = () => {
  // Navigate back to DNS rules list
  router.push('/dns-rules')
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
