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

  <div v-for="(item, idx) in props.modelValue" :key="item.tag ?? `new-${idx}`" class="mt-4">
    <OutboundEditor
      :form="item"
      :start-editable="editingStates[idx]"
      :show-delete="true"
      @saved="updateOutbound(idx, $event)"
      @deleted="removeOutbound(idx)"
      @cancel="editingStates[idx] = false"
    />
    <v-btn v-if="!editingStates[idx]" @click="editingStates[idx] = true" class="mt-2">Edit</v-btn>
  </div>
  <v-dialog v-model="showAddDialog" max-width="500px">
    <v-card>
      <v-card-title>Add Outbound</v-card-title>
      <v-card-text>
        <outbound-picker @update:modelValue="addOutbound" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import OutboundEditor from '../outboundEditor/outboundEditor.vue'
import OutboundPicker from '../outboundPicker/outboundPicker.vue'
import type { Outbound } from '../outboundEditor/types'
import { useOutboundStore } from '@/stores/outbound'

export interface Props {
  modelValue: Outbound[]
}

export interface Emits {
  (e: 'update:modelValue', value: Outbound[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const outboundStore = useOutboundStore()
const showAddDialog = ref(false)
const editingStates = ref<boolean[]>([])

watch(
  () => props.modelValue,
  (newVal) => {
    editingStates.value = newVal.map(() => false)
  },
  { immediate: true }
)

onMounted(async () => {
  await outboundStore.fetchOutbounds()
})

const addOutbound = (selectedOutbound: Outbound) => {
  const newOutbounds = [...(props.modelValue || []), selectedOutbound]
  emit('update:modelValue', newOutbounds)
  showAddDialog.value = false
}

const updateOutbound = (index: number, updatedOutbound: Outbound) => {
  const newOutbounds = [...(props.modelValue || [])]
  newOutbounds[index] = updatedOutbound
  emit('update:modelValue', newOutbounds)
}

const removeOutbound = (index: number) => {
  const newOutbounds = [...(props.modelValue || [])]
  newOutbounds.splice(index, 1)
  emit('update:modelValue', newOutbounds)
}
</script>

<style scoped></style>