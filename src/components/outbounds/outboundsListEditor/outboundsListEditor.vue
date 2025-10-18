<template>
  <Card>
    <template #title>
      <div class="flex justify-between items-center">
        <div class="text-2xl font-bold">Outbounds</div>
        <Button label="Add Outbound" icon="pi pi-plus" @click="openAddDialog" />
      </div>
    </template>
    <template #content>
      <div class="flex flex-wrap">
        <OutboundCard
          v-for="id in modelValue"
          :key="id"
          :id="id"
          @click="openEditDialog(id)"
        />
      </div>
    </template>
  </Card>

  <Dialog v-model:visible="showEditDialog" modal header="Outbound Editor" :style="{ width: '50vw' }">
    <OutboundEditor
      v-if="selectedOutbound"
      :form="selectedOutbound"
      :show-delete="true"
      @saved="onOutboundSaved"
      @deleted="onOutboundDeleted"
      @cancel="showEditDialog = false"
    />
  </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import OutboundEditor from '../outboundEditor/outboundEditor.vue'
import OutboundCard from '../outboundCard/outboundCard.vue'
import type { Outbound } from '@/types/outbound'
import { useOutboundStore } from '@/stores/outbound'

export interface Props {
  modelValue: number[]
}

export interface Emits {
  (e: 'update:modelValue', value: number[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const outboundStore = useOutboundStore()
const showEditDialog = ref(false)
const selectedOutbound = ref<Outbound | null>(null)

onMounted(async () => {
  await outboundStore.fetchOutbounds()
})

const openAddDialog = () => {
  selectedOutbound.value = { name: '', type: 'shadowsocks' } as any // Default type
  showEditDialog.value = true
}

const openEditDialog = (id: number) => {
  const outbound = outboundStore.outbounds.find(o => o.id === id)
  if (outbound) {
    selectedOutbound.value = { ...outbound }
    showEditDialog.value = true
  }
}

const onOutboundSaved = (savedOutbound: Outbound) => {
  if (savedOutbound.id === undefined) return

  if (!props.modelValue.includes(savedOutbound.id)) {
    emit('update:modelValue', [...props.modelValue, savedOutbound.id])
  }
  showEditDialog.value = false
}

const onOutboundDeleted = (deletedId: number) => {
  emit('update:modelValue', props.modelValue.filter((id) => id !== deletedId))
  showEditDialog.value = false
}
</script>

<style scoped></style>