<template>
  <Select
    v-model="selected"
    :options="servers"
    placeholder="Select a DNS server"
    show-clear
    @update:modelValue="onSelection"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Select from 'primevue/select'

const props = defineProps<{
  modelValue?: string
  servers: string[]
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
