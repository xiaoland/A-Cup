<template>
  <Card v-if="outbound" class="m-2">
    <template #title>
      <div class="flex justify-between items-center">
        <span>{{ outbound.name }}</span>
        <div>
          <Button icon="i-mdi-pencil" text rounded @click="$emit('edit')" />
          <Button icon="i-mdi-delete" severity="danger" text rounded @click="$emit('delete')" />
        </div>
      </div>
    </template>
    <template #subtitle>{{ outbound.type }}</template>
  </Card>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useOutboundStore } from '@/stores/outbound'
import type { Outbound } from '@/types/outbound'
import Card from 'primevue/card'
import Button from 'primevue/button'

const props = defineProps<{ id: number }>()
const emit = defineEmits<{ (e: 'edit'): void; (e: 'delete'): void }>()

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
</script>