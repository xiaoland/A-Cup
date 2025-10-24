<template>
  <div class="profile-editor">
    <div class="flex justify-end gap-2 mb-4">
      <Button label="Cancel" severity="secondary" @click="$emit('cancel')" />
      <Button label="Import" severity="info" @click="onImport" />
      <Button label="Save" @click="onSave" :loading="saving" />
    </div>

    <div class="grid grid-cols-1 gap-4">
      <div class="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="field">
          <label :for="`name-${uniqueId}`">Name</label>
          <InputText :id="`name-${uniqueId}`" v-model="profile.name" />
        </div>
        <div class="field">
          <label :for="`tags-${uniqueId}`">Tags</label>
          <InputChips :id="`tags-${uniqueId}`" v-model="profile.tags" />
        </div>
      </div>

      <!-- Inbounds Editor -->
      <Card>
        <template #title>
          <div class="flex justify-between items-center">
            <span>Inbounds</span>
            <Button label="Add Inbound" icon="i-mdi-plus" @click="openAddInboundDialog" />
          </div>
        </template>
        <template #content>
          <div v-if="!profile.inbounds || profile.inbounds.length === 0" class="text-center text-gray-500">
            No inbounds configured.
          </div>
          <div v-else class="flex flex-col gap-2">
            <div
              v-for="(item, idx) in profile.inbounds"
              :key="item.tag ?? `new-${idx}`"
              class="p-2 border rounded-md flex justify-between items-center cursor-pointer hover:bg-gray-100"
              @click="openEditInboundDialog(item, idx)"
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
              v-for="id in profile.outbounds"
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
              v-for="(item, idx) in (profile.special_outbounds as SpecialOutbound[])"
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

      <RouteEditor v-model="profile.route" />
      <DnsEditor v-model="profile.dns" />
    </div>

    <input ref="fileInput" type="file" accept="application/json" @change="onFileChange" hidden />

    <!-- Inbound Dialog -->
    <Dialog
      v-model:visible="isDialogVisible"
      modal
      :header="dialogHeader"
      class="w-full max-w-4xl"
    >
      <InboundEditor
        v-if="editableInbound"
        :form="editableInbound"
        :all-tags="allInboundTags"
        @save="handleInboundSave"
        @delete="handleInboundDelete"
        @cancel="isDialogVisible = false"
      />
    </Dialog>

    <!-- Outbound Dialogs -->
    <Dialog v-model:visible="showAddOutboundDialog" modal header="Add Outbound" :style="{ width: '50vw' }">
      <OutboundsPicker :multiple="true" :mask="profile.outbounds" v-model="selectedOutboundsToAdd" @create="openCreateOutboundDialog" />
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
      <OutboundEditor
        v-if="selectedSpecialOutbound"
        :form="selectedSpecialOutbound"
        :show-delete="true"
        :available-outbound-tags="allAvailableOutboundTags"
        @saved="onSpecialOutboundSaved"
        @deleted="onSpecialOutboundDeleted"
        @cancel="showEditSpecialOutboundDialog = false"
      />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useOutboundStore } from '@/stores/outbound'
import InputText from 'primevue/inputtext'
import InputChips from 'primevue/inputchips'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import Drawer from 'primevue/drawer'
import InboundEditor from '@/components/inbounds/inboundEditor/inboundEditor.vue'
import { defaultInbound } from '@/components/inbounds/inboundEditor/schema'
import type { Inbound as APIInbound } from '@/components/inbounds/inboundEditor/schema'
import OutboundEditor from '@/components/outbounds/outboundEditor/outboundEditor.vue'
import OutboundCard from '@/components/outbounds/outboundCard/outboundCard.vue'
import OutboundsPicker from '@/components/outbounds/outboundsPicker/outboundsPicker.vue'
import type { Outbound, SpecialOutbound } from '@/types/outbound'
import RouteEditor from '@/components/route/routeEditor/routeEditor.vue'
import DnsEditor from '@/components/dns/dnsEditor/dnsEditor.vue'
import type { Profile } from './schema'
import { SingboxProfileSchema } from '@/schemas/singbox'
import { transformSingboxToProfile } from './transform'

const props = defineProps<{
  modelValue: Profile
}>()

const emit = defineEmits(['save', 'cancel', 'update:modelValue'])

const userStore = useUserStore()
const outboundStore = useOutboundStore()
const saving = ref(false)
const uniqueId = computed(() => Math.random().toString(36).substring(7))
const fileInput = ref<HTMLInputElement | null>(null)

// Inbounds logic
const isDialogVisible = ref(false)
const editableInbound = ref<APIInbound | null>(null)
const editingInboundIndex = ref<number | null>(null)

const allInboundTags = computed(() => {
    const tags = (profile.value.inbounds || []).map((i: APIInbound) => i.tag).filter(Boolean) as string[];
    if (editingInboundIndex.value !== null && editableInbound.value) {
        const originalTag = profile.value.inbounds[editingInboundIndex.value].tag;
        return tags.filter(t => t !== originalTag);
    }
    return tags;
});

const dialogHeader = computed(() => editingInboundIndex.value === null ? 'Add Inbound' : 'Edit Inbound')

const openAddInboundDialog = () => {
  editingInboundIndex.value = null
  editableInbound.value = defaultInbound()
  isDialogVisible.value = true
}

const openEditInboundDialog = (inbound: APIInbound, index: number) => {
  editingInboundIndex.value = index
  editableInbound.value = JSON.parse(JSON.stringify(inbound))
  isDialogVisible.value = true
}

const profile = ref({
  special_outbounds: [],
  ...props.modelValue,
})

const handleInboundSave = (updatedInbound: APIInbound) => {
  const newInbounds = [...(profile.value.inbounds || [])]
  if (editingInboundIndex.value !== null) {
    newInbounds[editingInboundIndex.value] = updatedInbound
  } else {
    newInbounds.push(updatedInbound)
  }
  profile.value.inbounds = newInbounds
  emit('update:modelValue', profile.value)
  isDialogVisible.value = false
}

const handleInboundDelete = (tag: string) => {
  removeInbound(tag)
  isDialogVisible.value = false
}

const removeInbound = (tag: string) => {
  const newInbounds = (profile.value.inbounds || []).filter((inbound: APIInbound) => inbound.tag !== tag)
  profile.value.inbounds = newInbounds
  emit('update:modelValue', profile.value)
}

// Outbounds logic
const showAddOutboundDialog = ref(false)
const showEditOutboundDialog = ref(false)
const selectedOutbound = ref<Outbound | null>(null)
const selectedOutboundsToAdd = ref<string[]>([])
const showEditSpecialOutboundDialog = ref(false)
const selectedSpecialOutbound = ref<SpecialOutbound | null>(null)
const editingSpecialOutboundIndex = ref<number | null>(null)

onMounted(async () => {
  await outboundStore.fetchOutbounds()
})

const addOutbounds = () => {
  const toAdd = Array.isArray(selectedOutboundsToAdd.value) ? selectedOutboundsToAdd.value : [selectedOutboundsToAdd.value]
  const toAddIds = toAdd.map(tag => outboundStore.outbounds.find(o => o.name === tag)?.id).filter(Boolean) as number[]
  const newOutboundIds = [...new Set([...profile.value.outbounds, ...toAddIds])]
  profile.value.outbounds = newOutboundIds
  emit('update:modelValue', profile.value)
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
  const newOutbounds = profile.value.outbounds.filter((outboundId) => outboundId !== id)
  profile.value.outbounds = newOutbounds
  emit('update:modelValue', profile.value)
}

const onOutboundSaved = (savedOutbound: any) => {
  if (savedOutbound.id === undefined) return
  if (!profile.value.outbounds.includes(savedOutbound.id)) {
    const newOutbounds = [...profile.value.outbounds, savedOutbound.id]
    profile.value.outbounds = newOutbounds
    emit('update:modelValue', profile.value)
  }
  showEditOutboundDialog.value = false
}

const onOutboundDeleted = (deletedId: number) => {
  const newOutbounds = profile.value.outbounds.filter((id) => id !== deletedId)
  profile.value.outbounds = newOutbounds
  emit('update:modelValue', profile.value)
  showEditOutboundDialog.value = false
}

const allAvailableOutboundTags = computed(() => {
  const specialTags = (profile.value.special_outbounds || []).map((o: any) => o.tag)
  const normalTags = profile.value.outbounds.map(id => outboundStore.outbounds.find(o => o.id === id)?.name).filter(Boolean) as string[]
  return [...specialTags, ...normalTags]
})

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
  const newSpecialOutbounds = [...(profile.value.special_outbounds || [])]
  newSpecialOutbounds.splice(index, 1)
  profile.value.special_outbounds = newSpecialOutbounds
  emit('update:modelValue', profile.value)
}

const onSpecialOutboundSaved = (savedOutbound: any) => {
  const newSpecialOutbounds = [...(profile.value.special_outbounds || [])]
  if (editingSpecialOutboundIndex.value !== null) {
    newSpecialOutbounds[editingSpecialOutboundIndex.value] = savedOutbound
  } else {
    newSpecialOutbounds.push(savedOutbound)
  }
  profile.value.special_outbounds = newSpecialOutbounds as any
  emit('update:modelValue', profile.value)
  showEditSpecialOutboundDialog.value = false
}

const onSpecialOutboundDeleted = () => {
  if (editingSpecialOutboundIndex.value !== null) {
    removeSpecialOutbound(editingSpecialOutboundIndex.value)
  }
  showEditSpecialOutboundDialog.value = false
}

const onImport = () => {
  fileInput.value?.click()
}

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const content = e.target?.result
      if (typeof content !== 'string') {
        throw new Error('File content is not a string')
      }
      const data = JSON.parse(content)
      const parsed = SingboxProfileSchema.parse(data)
      const profile = await transformSingboxToProfile(parsed, props.modelValue)
      emit('update:modelValue', profile)
    } catch (error) {
      if (error instanceof Error) {
        alert(`Error: ${error.message}`)
      } else {
        alert('An unknown error occurred')
      }
    }
  }
  reader.readAsText(file)
}

const onSave = async () => {
  saving.value = true
  try {
    const { id, created_by, ...rest } = profile.value
    const { rule_set, ...route_without_rule_set } = rest.route
    const body = {
        ...rest,
        rule_sets: rest.route.rule_set,
        route: route_without_rule_set
    }
    const url = id ? `/api/profiles/${id}` : '/api/profiles'
    const method = id ? 'PUT' : 'POST'
    const res = await userStore.authorizedFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`Save failed: ${res.status}`)
    const saved = await res.json()
    emit('save', saved)
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>