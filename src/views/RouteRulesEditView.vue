<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import RouteRuleEditor from '@/components/routeRuleEditor/routeRuleEditor.vue'
import type { RouteRule } from '@/components/routeRuleEditor/types'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()

const routeRule = ref<RouteRule | undefined>(undefined)
const loading = ref(false)

const loadRouteRule = async () => {
  const id = route.params.id
  if (!id) return

  loading.value = true
  try {
    const response = await userStore.authorizedFetch(`/api/route-rules/${id}`)
    if (response.ok) {
      routeRule.value = await response.json()
    } else {
      console.error('Failed to load route rule')
    }
  } catch (error) {
    console.error('Error loading route rule:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRouteRule()
})
</script>

<template>
  <div v-if="loading" class="d-flex justify-center pa-6">
    <v-progress-circular indeterminate />
  </div>
  <RouteRuleEditor 
    v-else-if="routeRule" 
    :route-rule="routeRule" 
    mode="edit" 
  />
  <div v-else class="d-flex justify-center pa-6">
    <v-alert type="error">Route rule not found</v-alert>
  </div>
</template>

<style>
</style>
