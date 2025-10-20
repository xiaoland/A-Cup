<template>
  <div class="outbounds-editor">
    <!-- Outbounds Editor -->
    <Card>
      <template #title>
        <div class="flex justify-between items-center">
          <span>Outbounds</span>
          <Button label="Add Outbound" icon="i-mdi-plus" @click="showAddOutboundDialog = true" />
        </div>
      </template>
      <template #content>
        <div class="flex flex-col gap-2">
          <OutboundCard
            v-for="id in outbounds"
            :key="id"
            :id="id"
            @edit="openEditOutboundDialog(id)"
            @delete="removeOutbound(id)"
          />
        </div>
      </template>
    </Card>

    <!-- Special Outbounds Editor -->
    <Card>
      <template #title>
        <div class="flex justify-between items-center">
          <span>Special Outbounds</span>
          <Button label="Add Special Outbound" icon="i-mdi-plus" @click="openCreateSpecialOutboundDialog" />
        </div>
      </template>
      <template #content>
        <div class="flex flex-col gap-2">
          <div
            v-for="(item, idx) in specialOutbounds"
            :key="item.tag ?? `new-${idx}`"
            class="p-2 border rounded-md flex justify-between items-center cursor-pointer hover:bg-gray-100"
            @click="openEditSpecialOutboundDialog(item, idx)"
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
              @click.stop="removeSpecialOutbound(idx)"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Outbound Dialogs -->
    <Dialog v-model:visible="showAddOutboundDialog" modal header="Add Outbound" :style="{ width: '50vw' }">
      <OutboundsSelector :multiple="true" :mask="outbounds" v-model="selectedOutboundsToAdd" @create="openCreateOutboundDialog" />
      <template #footer>
        <Button label="Cancel" severity="secondary" @click="showAddOutboundDialog = false" />
        <Button label="Confirm" @click="addOutbounds" />
      </template>
    </Dialog>

    <Dialog v-model:visible="showEditOutboundDialog" modal header="Edit Outbound" class="w-full max-w-4xl">
      <OutboundEditor
        v-if="selectedOutbound"
        :form="selectedOutbound"
        :show-delete="true"
        @saved="onOutboundSaved"
        @deleted="onOutboundDeleted"
        @cancel="showEditOutboundDialog = false"
      />
    </Dialog>

    <Dialog v-model:visible="showEditSpecialOutboundDialog" modal header="Edit Special Outbound" class="w-full max-w-4xl">
      <SpecialOutboundEditor
        v-if="selectedSpecialOutbound"
        :form="selectedSpecialOutbound"
        :show-delete="true"
        @saved="onSpecialOutboundSaved"
        @deleted="onSpecialOutboundDeleted"
        @cancel="showEditSpecialOutboundDialog = false"
      />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useOutboundStore } from '@/stores/outbound'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import OutboundEditor from '@/components/outbounds/outboundEditor/outboundEditor.vue'
import SpecialOutboundEditor from '@/components/outbounds/specialOutboundEditor/specialOutboundEditor.vue'
import OutboundCard from '@/components/outbounds/outboundCard/outboundCard.vue'
import OutboundsSelector from '@/components/outbounds/outboundsSelector/outboundsSelector.vue'
import type { Outbound, SpecialOutbound } from '@/types/outbound'

const props = withDefaults(defineProps<{
  outbounds: number[]
  specialOutbounds?: SpecialOutbound[]
}>(), {
  specialOutbounds: () => [],
})

const emit = defineEmits(['update:outbounds', 'update:specialOutbounds'])

const outboundStore = useOutboundStore()

// Outbounds logic
const showAddOutboundDialog = ref(false)
const showEditOutboundDialog = ref(false)
const selectedOutbound = ref<Outbound | null>(null)
const selectedOutboundsToAdd = ref<number[]>([])
const showEditSpecialOutboundDialog = ref(false)
const selectedSpecialOutbound = ref<SpecialOutbound | null>(null)
const editingSpecialOutboundIndex = ref<number | null>(null)

onMounted(async () => {
  await outboundStore.fetchOutbounds()
})

const addOutbounds = () => {
  const toAdd = Array.isArray(selectedOutboundsToAdd.value) ? selectedOutboundsToAdd.value : [selectedOutboundsToAdd.value]
  const newOutboundIds = [...new Set([...props.outbounds, ...toAdd])]
  emit('update:outbounds', newOutboundIds)
  showAddOutboundDialog.value = false
  selectedOutboundsToAdd.value = []
}

const openCreateOutboundDialog = () => {
  selectedOutbound.value = { name: '', type: 'shadowsocks' } as any // Default type
  showEditOutboundDialog.value = true
}

const openEditOutboundDialog = (id: number) => {
  const outbound = outboundStore.outbounds.find(o => o.id === id)
  if (outbound) {
    selectedOutbound.value = { ...outbound }
    showEditOutboundDialog.value = true
  }
}

const removeOutbound = (id: number) => {
  const newOutbounds = props.outbounds.filter((outboundId) => outboundId !== id)
  emit('update:outbounds', newOutbounds)
}

const onOutboundSaved = (savedOutbound: any) => {
  if (savedOutbound.id === undefined) return
  if (!props.outbounds.includes(savedOutbound.id)) {
    const newOutbounds = [...props.outbounds, savedOutbound.id]
    emit('update:outbounds', newOutbounds)
  }
  showEditOutboundDialog.value = false
}

const onOutboundDeleted = (deletedId: number) => {
  const newOutbounds = props.outbounds.filter((id) => id !== deletedId)
  emit('update:outbounds', newOutbounds)
  showEditOutboundDialog.value = false
}

const openCreateSpecialOutboundDialog = () => {
  selectedSpecialOutbound.value = { tag: '', type: 'selector' } as any // Default type
  editingSpecialOutboundIndex.value = null
  showEditSpecialOutboundDialog.value = true
}

const openEditSpecialOutboundDialog = (outbound: SpecialOutbound, index: number) => {
  selectedSpecialOutbound.value = { ...outbound }
  editingSpecialOutboundIndex.value = index
  showEditSpecialOutboundDialog.value = true
}

const removeSpecialOutbound = (index: number) => {
  const newSpecialOutbounds = [...(props.specialOutbounds || [])]
  newSpecialOutbounds.splice(index, 1)
  emit('update:specialOutbounds', newSpecialOutbounds)
}

const onSpecialOutboundSaved = (savedOutbound: any) => {
  const newSpecialOutbounds = [...(props.specialOutbounds || [])]
  if (editingSpecialOutboundIndex.value !== null) {
    newSpecialOutbounds[editingSpecialOutboundIndex.value] = savedOutbound
  } else {
    newSpecialOutbounds.push(savedOutbound)
  }
  emit('update:specialOutbounds', newSpecialOutbounds)
  showEditSpecialOutboundDialog.value = false
}

const onSpecialOutboundDeleted = () => {
  if (editingSpecialOutboundIndex.value !== null) {
    removeSpecialOutbound(editingSpecialOutboundIndex.value)
  }
  showEditSpecialOutboundDialog.value = false
}
</script>
