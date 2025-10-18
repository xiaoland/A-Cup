<template>
  <div class="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="field col-span-1">
      <label for="uuid">UUID</label>
      <InputText id="uuid" v-model="form.credential.uuid" />
    </div>
    <div class="field col-span-1">
      <label for="flow">Flow (optional)</label>
      <Select
        id="flow"
        v-model="form.credential.flow"
        :options="vlessFlows"
        show-clear
        placeholder="Select a flow"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import type { Outbound } from './types'

defineProps<{ form: Outbound }>()

const vlessFlows = ['xtls-rprx-vision']
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>