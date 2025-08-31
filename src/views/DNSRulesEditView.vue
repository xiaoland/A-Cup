<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DNSRuleEditor from '@/components/dnsRuleEditor/dnsRuleEditor.vue'
import type { DNSRule } from '@/components/dnsRuleEditor/types'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const dnsRule = ref<DNSRule | undefined>(undefined)
const loading = ref(false)

// Load DNS rule data for editing
const loadDNSRule = async () => {
  const ruleId = route.params.id
  if (!ruleId) return
  
  loading.value = true
  try {
    const response = await fetch(`/api/dns_rules/${ruleId}`, {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    
    if (response.ok) {
      dnsRule.value = await response.json()
    } else {
      console.error('Failed to load DNS rule')
      router.push('/dns') // Redirect to unified view if not found
    }
  } catch (error) {
    console.error('Failed to load DNS rule:', error)
    router.push('/dns') // Redirect to unified view on error
  } finally {
    loading.value = false
  }
}

const handleSave = (updatedDNSRule: DNSRule) => {
  // Navigate back to DNS view after successful save
  router.push('/dns')
}

const handleCancel = () => {
  // Navigate back to DNS view
  router.push('/dns')
}

onMounted(() => {
  loadDNSRule()
})
</script>

<template>
  <div v-if="loading" class="text-center pa-8">
    <v-progress-circular
      indeterminate
      color="primary"
      size="48"
    />
    <p class="text-body-1 mt-4">Loading DNS rule...</p>
  </div>
  
  <DNSRuleEditor 
    v-else
    mode="edit"
    :dns-rule="dnsRule"
    @save="handleSave"
    @cancel="handleCancel"
  />
</template>

<style>
</style>
