<template>
  <div class="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="field col-span-2">
      <label for="type">Type</label>
      <Select
        id="type"
        v-model="form.type"
        :options="typeOptions"
        option-label="title"
        option-value="value"
      />
    </div>
    <div class="col-span-2">
      <OutboundsSelector v-model="(form as any).outbounds" />
    </div>
    <div class="field col-span-2">
      <label for="default">Default (optional)</label>
      <Select
        id="default"
        v-model="(form as any).default"
        :options="getDefaultOptions((form as any).outbounds)"
        option-label="title"
        option-value="value"
        placeholder="Select a default outbound"
        show-clear
      />
    </div>
    <div class="field col-span-2">
       <div class="flex items-center">
            <Checkbox v-model="(form as any).interrupt_exist_connections" inputId="interrupt_exist_connections" :binary="true" />
            <label for="interrupt_exist_connections" class="ml-2"> Interrupt existing connections </label>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
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
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>