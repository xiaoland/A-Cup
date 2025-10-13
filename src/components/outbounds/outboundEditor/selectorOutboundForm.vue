<template>
  <v-row>
    <v-col cols="12" md="6">
      <v-select
        v-model="form.type"
        :items="typeOptions"
        item-title="title"
        item-value="value"
        label="Type"
        variant="outlined"
        required
      />
    </v-col>
    <v-col cols="12">
      <OutboundsSelector v-model="(form as any).outbounds" />
    </v-col>
    <v-col cols="12" md="6">
      <v-select
        v-model="(form as any).default"
        :items="getDefaultOptions((form as any).outbounds)"
        item-title="title"
        item-value="value"
        label="Default (optional)"
        clearable
        variant="outlined"
      />
    </v-col>
    <v-col cols="12">
      <v-switch inset v-model="(form as any).interrupt_exist_connections" label="Interrupt existing connections" />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import type { Outbound } from './types'
import { typeOptions } from './types'
import OutboundsSelector from '@/components/outbounds/common/OutboundsSelector.vue'

defineProps<{ form: Outbound }>()

const userStore = useUserStore()

// for default options, fetch all outbounds for name lookup
const allOutbounds = ref<any[]>([])
const loadAllOutbounds = async () => {
  try {
    const res = await userStore.authorizedFetch('/api/outbounds')
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) allOutbounds.value = data
    }
  } catch (e) { console.error(e) }
}
onMounted(loadAllOutbounds)

const getDefaultOptions = (ids?: number[]) =>
  allOutbounds.value
    .filter((o: any) => Array.isArray(ids) && ids.length > 0 && ids.includes(o.id))
    .map((o: any) => ({ title: o.name || `#${o.id}`, value: o.id }))
</script>

<style scoped>
</style>