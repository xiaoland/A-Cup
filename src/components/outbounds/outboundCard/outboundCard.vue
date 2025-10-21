<template>
  <Card v-if="outbound || special" class="m-2">
    <template #title>
      <div class="flex justify-between items-center">
        <span>{{ name }}</span>
        <div>
          <Button icon="i-mdi-pencil" text rounded @click="$emit('edit')" />
          <Button icon="i-mdi-delete" severity="danger" text rounded @click="$emit('delete')" />
        </div>
      </div>
    </template>
    <template #subtitle>{{ type }}</template>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useOutboundStore } from '@/stores/outbound'
import type { Outbound, SpecialOutbound } from '@/types/outbound'
import Card from 'primevue/card'
import Button from 'primevue/button'

const props = defineProps<{ id?: number; special?: SpecialOutbound }>()
const emit = defineEmits<{ (e: 'edit'): void; (e: 'delete'): void }>()

const outboundStore = useOutboundStore()
const outbound = ref<Outbound | null>(null)

const findOutbound = () => {
  if (props.id !== undefined) {
    outbound.value = outboundStore.outbounds.find((o) => o.id === props.id) || null
  }
}

const name = computed(() => {
  if (props.special) {
    return props.special.tag
  }
  return outbound.value?.name
})

const type = computed(() => {
  if (props.special) {
    return props.special.type
  }
  return outbound.value?.type
})

onMounted(async () => {
  if (outboundStore.outbounds.length === 0) {
    await outboundStore.fetchOutbounds()
  }
  findOutbound()
})

watch(() => props.id, findOutbound)
watch(() => outboundStore.outbounds, findOutbound, { deep: true })
</script>