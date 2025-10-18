<template>
  <div class="flex items-center gap-2">
    <div class="flex-grow">
      <Select
        v-model="selected"
        :options="availableOutbounds"
        :multiple="multiple"
        option-label="name"
        option-value="id"
        placeholder="Select Outbound(s)"
        class="w-full"
      />
    </div>
    <Button icon="i-mdi-plus" @click="$emit('create')" text />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useOutboundStore } from '@/stores/outbound'
import Select from 'primevue/select'
import Button from 'primevue/button'

const props = defineProps({
  modelValue: {
    type: [Number, Array] as import('vue').PropType<number | number[]>,
    default: null,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  mask: {
    type: Array as () => number[],
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'create'])

const outboundStore = useOutboundStore()
const selected = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const availableOutbounds = computed(() => {
  return outboundStore.outbounds.filter(o => !props.mask.includes(o.id!))
})

onMounted(async () => {
  await outboundStore.fetchOutbounds()
})
</script>

<style scoped></style>