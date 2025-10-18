<template>
  <Card v-if="outbound" @click="onClick" class="m-2 cursor-pointer">
    <template #title>{{ outbound.name }}</template>
    <template #subtitle>{{ outbound.type }}</template>
  </Card>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useOutboundStore } from '@/stores/outbound'
import type { Outbound } from '@/types/outbound'
import Card from 'primevue/card'

const props = defineProps<{ id: number }>()
const emit = defineEmits<{ (e: 'click'): void }>()

const outboundStore = useOutboundStore()
const outbound = ref<Outbound | null>(null)

const findOutbound = () => {
  outbound.value = outboundStore.outbounds.find(o => o.id === props.id) || null
}

onMounted(async () => {
  if (outboundStore.outbounds.length === 0) {
    await outboundStore.fetchOutbounds()
  }
  findOutbound()
})

watch(() => props.id, findOutbound)
watch(() => outboundStore.outbounds, findOutbound, { deep: true })

const onClick = () => {
  emit('click')
}
</script>