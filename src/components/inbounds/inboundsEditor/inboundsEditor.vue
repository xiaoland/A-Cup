<template>
  <Card>
    <template #title>
      <div class="flex justify-between items-center">
        <span>Inbounds</span>
        <Button
          label="Add Inbound"
          icon="i-mdi-plus"
          @click="openAddDialog"
        />
      </div>
    </template>
    <template #content>
      <div v-if="!modelValue || modelValue.length === 0" class="text-center text-gray-500">
        No inbounds configured.
      </div>
      <div v-else class="flex flex-col gap-2">
        <div
          v-for="(item, idx) in modelValue"
          :key="item.tag ?? `new-${idx}`"
          class="p-2 border rounded-md flex justify-between items-center cursor-pointer hover:bg-gray-100"
          @click="openEditDialog(item, idx)"
        >
          <div>
            <div class="font-bold">{{ item.tag }}</div>
            <div class="text-sm text-gray-500">{{ item.type }}</div>
          </div>
          <Button
            icon="i-mdi-delete"
            severity="danger"
            text
            rounded
            @click.stop="removeInbound(item.tag)"
          />
        </div>
      </div>
    </template>
  </Card>

  <Dialog
    v-model:visible="isDialogVisible"
    modal
    :header="dialogHeader"
    class="w-full max-w-4xl"
  >
    <Inbound
      v-if="editableInbound"
      :form="editableInbound"
      :all-tags="allTags"
      @save="handleSave"
      @delete="handleDelete"
      @cancel="isDialogVisible = false"
    />
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Inbound from '@/components/inbounds/inbound/inbound.vue'
import { defaultInbound } from '@/components/inbounds/inbound/schema'
import type { Inbound as APIInbound } from '@/components/inbounds/inbound/schema'

const props = defineProps<{ modelValue: APIInbound[] }>()
const emit = defineEmits(['update:modelValue'])

const isDialogVisible = ref(false)
const editableInbound = ref<APIInbound | null>(null)
const editingIndex = ref<number | null>(null)

const allTags = computed(() => {
    const tags = (props.modelValue || []).map((i) => i.tag).filter(Boolean) as string[];
    if (editingIndex.value !== null && editableInbound.value) {
        const originalTag = props.modelValue[editingIndex.value].tag;
        return tags.filter(t => t !== originalTag);
    }
    return tags;
});

const dialogHeader = computed(() => editingIndex.value === null ? 'Add Inbound' : 'Edit Inbound')

const openAddDialog = () => {
  editingIndex.value = null
  editableInbound.value = defaultInbound()
  isDialogVisible.value = true
}

const openEditDialog = (inbound: APIInbound, index: number) => {
  editingIndex.value = index
  editableInbound.value = JSON.parse(JSON.stringify(inbound))
  isDialogVisible.value = true
}

const handleSave = (updatedInbound: APIInbound) => {
  const newInbounds = [...(props.modelValue || [])]
  if (editingIndex.value !== null) {
    newInbounds[editingIndex.value] = updatedInbound
  } else {
    newInbounds.push(updatedInbound)
  }
  emit('update:modelValue', newInbounds)
  isDialogVisible.value = false
}

const handleDelete = (tag: string) => {
  removeInbound(tag)
  isDialogVisible.value = false
}

const removeInbound = (tag: string) => {
  const newInbounds = (props.modelValue || []).filter((inbound) => inbound.tag !== tag)
  emit('update:modelValue', newInbounds)
}
</script>