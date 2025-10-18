<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-2">
      <Button label="Select Outbounds" @click="dialog = true" />
      <span class="text-sm text-gray-500">Selected: {{ (modelValue || []).length }}</span>
    </div>
    <div class="flex flex-wrap gap-2">
      <Chip v-for="id in (modelValue || [])" :key="id" :label="nameOf(id) || `#${id}`" />
    </div>

    <Dialog v-model:visible="dialog" modal header="Select Outbounds" class="w-full max-w-4xl">
      <div class="p-4">
        <div class="p-inputgroup">
            <span class="p-inputgroup-addon">
                <i class="i-mdi-magnify" />
            </span>
            <InputText v-model="q" placeholder="Search" />
        </div>
        <DataTable
          :value="filtered"
          v-model:selection="selection"
          :loading="loading"
          data-key="id"
          :paginator="true"
          :rows="10"
          class="p-datatable-sm mt-4"
        >
          <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
          <Column field="name" header="Name" sortable>
             <template #body="slotProps">
              {{ slotProps.data.name || `#${slotProps.data.id}` }}
            </template>
          </Column>
          <Column field="type" header="Type" sortable></Column>
          <Column field="region" header="Region" sortable></Column>
          <Column field="provider" header="Provider" sortable></Column>
        </DataTable>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" @click="dialog = false" />
        <Button label="Apply" @click="apply" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import Button from 'primevue/button'
import Chip from 'primevue/chip'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

interface OutboundItem {
  id: number
  name?: string
  type?: string
  region?: string
  provider?: string
}

const props = defineProps<{ modelValue?: number[] }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: number[]): void }>()

const user = useUserStore()
const dialog = ref(false)
const loading = ref(false)
const items = ref<OutboundItem[]>([])
const q = ref('')
const selection = ref<OutboundItem[]>([])

watch(
  () => props.modelValue,
  (v) => {
    selection.value = items.value.filter(item => (v || []).includes(item.id))
  },
  { deep: true }
)

const filtered = computed(() => {
  const needle = q.value.trim().toLowerCase()
  const list = items.value.filter((it) => it.type !== 'selector' && it.type !== 'urltest')
  if (!needle) return list
  return list.filter((it) =>
    (it.name || '').toLowerCase().includes(needle) ||
    (it.type || '').toLowerCase().includes(needle) ||
    (it.region || '').toLowerCase().includes(needle) ||
    (it.provider || '').toLowerCase().includes(needle)
  )
})

const nameOf = (id: number) => items.value.find((x) => x.id === id)?.name

const apply = () => {
  emit('update:modelValue', selection.value.map(item => item.id))
  dialog.value = false
}

const load = async () => {
  loading.value = true
  try {
    const res = await user.authorizedFetch('/api/outbounds')
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) {
        items.value = data
        selection.value = items.value.filter(item => (props.modelValue || []).includes(item.id))
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>