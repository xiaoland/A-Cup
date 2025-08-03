<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DNSRuleList from '@/components/dnsRuleList/dnsRuleList.vue'
import type { DNSRule } from '@/components/dnsRuleList/types'

const router = useRouter()
const dnsRuleListRef = ref<InstanceType<typeof DNSRuleList> | null>(null)

const handleCreate = () => {
  router.push('/dns-rules/create')
}

const handleEdit = (rule: DNSRule) => {
  router.push(`/dns-rules/${rule.id}/edit`)
}
</script>

<template>
  <DNSRuleList 
    ref="dnsRuleListRef"
    @create="handleCreate"
    @edit="handleEdit"
  />
</template>

<style>
</style>
