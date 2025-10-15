<template>
  <div>
    <outboundsSelector v-model="dial.detour" label="Detour" />
    <v-text-field v-model="dial.address_resolver" label="Address Resolver" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import outboundsSelector from '@/components/outbounds/outboundsSelector/outboundsSelector.vue'

const props = defineProps<{
  modelValue: any
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const dial = ref(props.modelValue || {})

watch(
  dial,
  (value) => {
    emit('update:modelValue', value)
  },
  { deep: true }
)
</script>