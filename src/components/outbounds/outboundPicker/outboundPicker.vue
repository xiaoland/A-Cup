<template>
  <div>
    <Select
      v-model="selected"
      :options="outboundStore.outbounds"
      option-label="name"
      placeholder="Select an Outbound"
      @update:modelValue="onSelection"
      class="w-full"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useOutboundStore } from '@/stores/outbound'
import type { Outbound } from '@/types/outbound'
import Select from 'primevue/select'

const emit = defineEmits(['update:modelValue'])
const outboundStore = useOutboundStore()
const selected = ref<Outbound | null>(null)

onMounted(() => {
  outboundStore.fetchOutbounds()
})

const onSelection = (value: Outbound) => {
  emit('update:modelValue', value)
}
</script>