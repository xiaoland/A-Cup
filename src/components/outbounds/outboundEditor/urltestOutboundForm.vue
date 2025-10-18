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
        <div class="flex items-center">
            <Checkbox v-model="(form as any).interrupt_exist_connections" inputId="interrupt_exist_connections" :binary="true" />
            <label for="interrupt_exist_connections" class="ml-2"> Interrupt existing connections </label>
        </div>
    </div>
    <div class="field col-span-1">
      <label for="url">Test URL (optional)</label>
      <InputText id="url" v-model="(form as any).url" />
    </div>
    <div class="field col-span-1">
      <label for="interval">Interval (e.g. 3m)</label>
      <InputText id="interval" v-model="(form as any).interval" />
    </div>
    <div class="field col-span-1">
      <label for="tolerance">Tolerance (ms)</label>
      <InputNumber id="tolerance" v-model.number="(form as any).tolerance" />
    </div>
    <div class="field col-span-1">
      <label for="idle_timeout">Idle Timeout (e.g. 30m)</label>
      <InputText id="idle_timeout" v-model="(form as any).idle_timeout" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import type { Outbound } from './types'
import { typeOptions } from './types'
import OutboundsSelector from '@/components/outbounds/common/OutboundsSelector.vue'

defineProps<{ form: Outbound }>()
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>