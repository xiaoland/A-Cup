<template>
  <v-card variant="outlined" class="form-section">
    <v-card-title class="text-h6 d-flex align-center justify-space-between">
      Outbounds
      <v-btn color="primary" variant="outlined" size="small" @click="openDialog" prepend-icon="mdi-plus">
        Select Outbounds
      </v-btn>
    </v-card-title>
    <v-card-text class="selection-section">
      <div v-if="selectedOutbounds.length === 0" class="text-body-2 text-medium-emphasis">
        No outbounds selected. First outbound will be the fallback.
      </div>
      <div v-else class="selection-chips">
        <v-chip
          v-for="(outbound, index) in selectedOutbounds"
          :key="outbound.id"
          closable
          :color="index === 0 ? 'primary' : undefined"
          :variant="index === 0 ? 'elevated' : 'outlined'"
          @click:close="removeOutbound(outbound.id)"
        >
          {{ outbound.name || `${outbound.type} ${outbound.region ? `(${outbound.region})` : ''}` }}
          <v-tooltip v-if="index === 0" activator="parent">Fallback outbound</v-tooltip>
        </v-chip>
      </div>
    </v-card-text>
  </v-card>

  <v-dialog v-model="dialog.show" max-width="600px" scrollable>
    <v-card>
      <v-card-title>Select Outbounds</v-card-title>
      <v-card-text>
        <v-text-field v-model="dialog.search" label="Search" variant="outlined" prepend-inner-icon="mdi-magnify" clearable />
        <v-list>
          <v-list-item
            v-for="item in filteredOutbounds"
            :key="item.id"
            :title="item.name || item.type"
            :subtitle="item.address ? `${item.address}${item.port ? `:${item.port}` : ''}` : (item.region || '')"
            :active="isSelected(item.id)"
            :color="isSelected(item.id) ? 'primary' : undefined"
            @click="toggle(item.id)"
          >
            <template #prepend>
              <v-checkbox :model-value="isSelected(item.id)" color="primary" hide-details />
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="outlined" @click="dialog.show = false">Cancel</v-btn>
        <v-btn color="primary" @click="confirm">Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import type { Outbound } from '../../profile/profileEditor/types'

const props = defineProps<{ form: any }>()

const userStore = useUserStore()
const outbounds = ref<Outbound[]>([])
const loading = ref(false)

const dialog = ref({ show: false, search: '', selected: [] as number[] })

const selectedOutbounds = computed(() =>
  outbounds.value.filter(o => props.form.outbounds.includes(o.id))
)

const filteredOutbounds = computed(() => {
  if (!dialog.value.search) return outbounds.value
  const s = dialog.value.search.toLowerCase()
  return outbounds.value.filter(o =>
    (o.name || o.type).toLowerCase().includes(s) ||
    (o.address ? `${o.address}${o.port ? `:${o.port}` : ''}` : '').toLowerCase().includes(s) ||
    (o.region || '').toLowerCase().includes(s)
  )
})

const openDialog = () => {
  dialog.value = {
    show: true,
    search: '',
    selected: [...(props.form.outbounds || [])]
  }
}

const isSelected = (id: number) => dialog.value.selected.includes(id)
const toggle = (id: number) => {
  const i = dialog.value.selected.indexOf(id)
  if (i >= 0) dialog.value.selected.splice(i, 1)
  else dialog.value.selected.push(id)
}
const confirm = () => {
  props.form.outbounds = [...dialog.value.selected]
  dialog.value.show = false
}

const removeOutbound = (id: number) => {
  props.form.outbounds = props.form.outbounds.filter((i: number) => i !== id)
}

const loadOutbounds = async () => {
  loading.value = true
  try {
    const res = await userStore.authorizedFetch('/api/outbounds')
    if (res.ok) outbounds.value = await res.json()
  } finally {
    loading.value = false
  }
}

onMounted(loadOutbounds)
</script>

<style scoped>
.selection-chips { display: flex; flex-wrap: wrap; gap: 8px; }
</style>
