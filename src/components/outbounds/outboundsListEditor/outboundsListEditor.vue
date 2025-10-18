<template>
  <v-card variant="outlined" class="form-section">
    <v-card-title class="text-h6 d-flex align-center justify-space-between">
      Outbounds
      <div class="d-flex" style="gap: 8px">
        <v-btn color="primary" size="small" @click="openAddDialog" prepend-icon="mdi-plus">
          Add Outbound
        </v-btn>
      </div>
    </v-card-title>
    <v-list>
      <v-list-item v-for="item in outbounds" :key="item.id">
        <v-list-item-title>{{ item.name }}</v-list-item-title>
        <v-list-item-subtitle>{{ item.type }}</v-list-item-subtitle>
        <template #append>
          <v-btn icon="mdi-pencil" variant="text" @click="openEditDialog(item)"></v-btn>
        </template>
      </v-list-item>
    </v-list>
  </v-card>

  <v-dialog v-model="showEditDialog" max-width="800px">
    <OutboundEditor
      v-if="selectedOutbound"
      :form="selectedOutbound"
      :show-delete="true"
      @saved="onOutboundSaved"
      @deleted="onOutboundDeleted"
      @cancel="showEditDialog = false"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import OutboundEditor from '../outboundEditor/outboundEditor.vue'
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

const outbounds = computed(() => {
  return (props.modelValue || [])
    .map((id) => outboundStore.outbounds.find((o) => o.id === id))
    .filter((o): o is Outbound => !!o)
})

onMounted(async () => {
  await outboundStore.fetchOutbounds()
})

const openAddDialog = () => {
  selectedOutbound.value = { name: '', type: 'shadowsocks' } as any // Default type
  showEditDialog.value = true
}

const openEditDialog = (outbound: Outbound) => {
  selectedOutbound.value = { ...outbound }
  showEditDialog.value = true
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