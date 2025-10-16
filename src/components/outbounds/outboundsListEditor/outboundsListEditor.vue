<template>
  <v-card variant="outlined" class="form-section">
    <v-card-title class="text-h6 d-flex align-center justify-space-between">
      Outbounds
      <div class="d-flex" style="gap: 8px">
        <v-btn color="primary" size="small" @click="showAddDialog = true" prepend-icon="mdi-plus">
          Add Outbound
        </v-btn>
      </div>
    </v-card-title>
  </v-card>

  <div v-for="(item, idx) in outbounds" :key="item.id ?? `new-${idx}`" class="mt-4">
    <OutboundEditor
      :form="item"
      :start-editable="true"
      :show-delete="true"
      @saved="updateOutbound(idx, $event)"
      @deleted="removeOutbound(idx)"
    />
  </div>
  <v-dialog v-model="showAddDialog" max-width="500px">
    <v-card>
      <v-card-title>Add Outbound</v-card-title>
      <v-card-text>
        <outbounds-selector :multiple="true" value-as="id" @update:modelValue="addOutbound" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import OutboundEditor from '../outboundEditor/outboundEditor.vue'
import OutboundsSelector from '../outboundsSelector/outboundsSelector.vue'
import type { Outbound } from '../outboundEditor/types'
import { useOutboundStore } from '@/stores/outbound'

export interface Props {
  modelValue: string[]
}

export interface Emits {
  (e: 'update:modelValue', value: string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const outboundStore = useOutboundStore()
const showAddDialog = ref(false)
const outbounds = ref<Outbound[]>([])

const fetchOutbounds = async () => {
  await outboundStore.fetchOutbounds()
  updateOutbounds()
}

onMounted(fetchOutbounds)

const updateOutbounds = () => {
  outbounds.value = (props.modelValue || [])
    .map((id) => outboundStore.outbounds.find((o) => o.id === id))
    .filter((o) => o) as Outbound[]
}

watch(() => props.modelValue, updateOutbounds, { deep: true })
watch(() => outboundStore.outbounds, updateOutbounds, { deep: true })

const addOutbound = (selectedIds: string[]) => {
  const newOutboundIds = [...(props.modelValue || []), ...selectedIds]
  emit('update:modelValue', newOutboundIds)
  showAddDialog.value = false
}

const updateOutbound = (index: number, updatedOutbound: Outbound) => {
  const newOutboundIds = [...(props.modelValue || [])]
  if (updatedOutbound.id) {
    newOutboundIds[index] = updatedOutbound.id
    emit('update:modelValue', newOutboundIds)
  }
}

const removeOutbound = (index: number) => {
  const newOutboundIds = [...(props.modelValue || [])]
  newOutboundIds.splice(index, 1)
  emit('update:modelValue', newOutboundIds)
}
</script>

<style scoped></style>