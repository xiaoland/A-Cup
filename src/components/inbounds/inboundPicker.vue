<template>
  <Select
    v-model="selected"
    :options="inbounds"
    option-label="tag"
    option-value="tag"
    placeholder="Select an inbound"
    show-clear
    @update:modelValue="onSelection"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Select from 'primevue/select'
import type { Inbound } from './inboundEditor/schema'

const props = defineProps<{
  modelValue: string
  inbounds: Inbound[]
}>()

const emit = defineEmits(['update:modelValue'])

const selected = ref(props.modelValue)

const onSelection = (value: string) => {
  emit('update:modelValue', value)
}

watch(
  () => props.modelValue,
  (newValue) => {
    selected.value = newValue
  },
  { immediate: true }
)
</script>