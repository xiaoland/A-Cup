<template>
  <div class="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="field col-span-1">
      <label for="default">Default</label>
      <InputText id="default" v-model="form.default" />
    </div>
    <div class="field col-span-2">
      <label for="outbounds">Outbounds</label>
      <Chips id="outbounds" v-model="form.outbounds" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Chips from 'primevue/chips'
import type { SelectorOutbound } from '@/types/outbound'

const props = defineProps<{ form: SelectorOutbound }>()
const form = ref(props.form)
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>