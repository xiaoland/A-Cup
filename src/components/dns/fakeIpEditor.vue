<template>
  <div class="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="field col-span-1 flex items-center">
      <div class="flex items-center">
        <Checkbox v-model="fakeip.enabled" inputId="fakeip_enabled" :binary="true" />
        <label for="fakeip_enabled" class="ml-2"> Enabled </label>
      </div>
    </div>
    <div class="field col-span-1">
      <label for="inet4_range">IPv4 Range</label>
      <InputText id="inet4_range" v-model="fakeip.inet4_range" />
    </div>
    <div class="field col-span-1">
      <label for="inet6_range">IPv6 Range</label>
      <InputText id="inet6_range" v-model="fakeip.inet6_range" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { type Dns } from '@/schemas/dns'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'

const props = defineProps<{
  modelValue: Dns['fakeip']
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Dns['fakeip']): void
}>()

const fakeip = ref(props.modelValue || {})

watch(
  fakeip,
  (value) => {
    emit('update:modelValue', value)
  },
  { deep: true }
)
</script>

<style scoped>
.field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
</style>