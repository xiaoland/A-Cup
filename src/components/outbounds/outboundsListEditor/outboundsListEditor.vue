<template>
  <Card>
    <template #title>
      <div class="flex justify-between items-center">
        <div class="text-2xl font-bold">Outbounds</div>
        <Button label="Add Outbound" icon="i-mdi-plus" @click="showAddDialog = true" />
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

  <Dialog v-model:visible="showAddDialog" modal header="Add Outbound" :style="{ width: '50vw' }">
    <OutboundsSelector :multiple="true" :mask="modelValue" v-model="selectedToAdd" @create="openCreateDialog" />
    <template #footer>
      <Button label="Cancel" severity="secondary" @click="showAddDialog = false" />
      <Button label="Confirm" @click="addOutbounds" />
    </template>
  </Dialog>

  <Drawer v-model:visible="showEditDialog" position="right" class="w-full md:w-3/5">
    <OutboundEditor
      v-if="selectedOutbound"
      :form="selectedOutbound"
      :show-delete="true"
      @saved="onOutboundSaved"
      @deleted="onOutboundDeleted"
      @cancel="showEditDialog = false"
    />
  </Drawer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Drawer from 'primevue/drawer'
import OutboundEditor from '../outboundEditor/outboundEditor.vue'
import OutboundCard from '../outboundCard/outboundCard.vue'
import OutboundsSelector from '../outboundsSelector/outboundsSelector.vue'
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
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const selectedOutbound = ref<Outbound | null>(null)
const selectedToAdd = ref<number[]>([])

onMounted(async () => {
  await outboundStore.fetchOutbounds()
})

const addOutbounds = () => {
  const toAdd = Array.isArray(selectedToAdd.value) ? selectedToAdd.value : [selectedToAdd.value]
  const newOutboundIds = [...new Set([...props.modelValue, ...toAdd])]
  emit('update:modelValue', newOutboundIds)
  showAddDialog.value = false
  selectedToAdd.value = []
}

const openCreateDialog = () => {
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