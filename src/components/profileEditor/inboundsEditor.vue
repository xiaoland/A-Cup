<template>
  <v-card variant="outlined" class="form-section">
    <v-card-title class="text-h6 d-flex align-center justify-space-between">
      Inbounds
      <div class="d-flex" style="gap: 8px">
        <v-btn color="primary" variant="outlined" size="small" @click="openSelectDialog" prepend-icon="mdi-format-list-bulleted">
          Select Inbounds
        </v-btn>
        <v-btn color="primary" size="small" @click="openCreateDialog" prepend-icon="mdi-plus">
          Create Inbound
        </v-btn>
      </div>
    </v-card-title>
    <v-card-text class="selection-section">
      <div v-if="selectedInbounds.length === 0" class="text-body-2 text-medium-emphasis">
        No inbounds selected.
      </div>
      <div v-else class="selection-chips">
        <v-chip
          v-for="(item, index) in selectedInbounds"
          :key="getId(item)"
          closable
          variant="outlined"
          @click:close="removeInbound(item.id)"
        >
          {{ chipLabel(item) }}
        </v-chip>
      </div>
    </v-card-text>
  </v-card>

  <!-- Select dialog -->
  <v-dialog v-model="selectDialog.show" max-width="600px" scrollable>
    <v-card>
      <v-card-title>Select Inbounds</v-card-title>
      <v-card-text>
        <v-text-field v-model="selectDialog.search" label="Search" variant="outlined" prepend-inner-icon="mdi-magnify" clearable />
        <v-list>
          <v-list-item
            v-for="item in filteredInbounds"
            :key="getId(item)"
            :title="chipLabel(item)"
            :subtitle="subtitle(item)"
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
        <v-btn variant="outlined" @click="selectDialog.show = false">Cancel</v-btn>
        <v-btn color="primary" @click="confirmSelect">Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Create dialog reusing InboundEditor -->
  <v-dialog v-model="createDialog" max-width="900px" scrollable>
    <InboundEditor @save="onCreateSaved" @cancel="createDialog = false" />
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import InboundEditor from '@/components/inboundEditor/inboundEditor.vue'
import type { Inbound as APIInbound } from '@/components/inboundEditor/types'

const props = defineProps<{ form: any }>()

const userStore = useUserStore()
const inbounds = ref<APIInbound[]>([])
const loading = ref(false)

const selectDialog = ref({ show: false, search: '', selected: [] as number[] })
const createDialog = ref(false)

const chipLabel = (i: APIInbound) => i.type ? `${i.type}${i.address || i.port ? ` — ${i.address || ''}${i.port ? `:${i.port}` : ''}` : ''}` : `Inbound #${i.id}`
const subtitle = (i: APIInbound) => i.stack ? `stack: ${i.stack}${i.mtu ? `, mtu: ${i.mtu}` : ''}` : ''

const getId = (i: APIInbound) => (typeof i.id === 'number' ? i.id : -1)
const selectedInbounds = computed(() =>
  inbounds.value.filter(i => typeof i.id === 'number' && props.form.inbounds?.includes(i.id))
)

const filteredInbounds = computed(() => {
  if (!selectDialog.value.search) return inbounds.value
  const s = selectDialog.value.search.toLowerCase()
  return inbounds.value.filter(i =>
    chipLabel(i).toLowerCase().includes(s) ||
    subtitle(i).toLowerCase().includes(s)
  )
})

const openSelectDialog = () => {
  selectDialog.value = {
    show: true,
    search: '',
    selected: [...(props.form.inbounds || [])]
  }
}

const isSelected = (id?: number) => (id != null) && selectDialog.value.selected.includes(id)
const toggle = (id?: number) => {
  if (id == null) return
  const i = selectDialog.value.selected.indexOf(id)
  if (i >= 0) selectDialog.value.selected.splice(i, 1)
  else selectDialog.value.selected.push(id)
}
const confirmSelect = () => {
  props.form.inbounds = [...selectDialog.value.selected]
  selectDialog.value.show = false
}

const openCreateDialog = () => {
  createDialog.value = true
}
const onCreateSaved = (created: APIInbound) => {
  createDialog.value = false
  // refresh list and add to selection
  if (created?.id != null) {
    if (!props.form.inbounds) props.form.inbounds = []
    if (!props.form.inbounds.includes(created.id)) props.form.inbounds.push(created.id)
  }
  loadInbounds()
}

const removeInbound = (id?: number) => {
  if (id == null) return
  props.form.inbounds = (props.form.inbounds || []).filter((i: number) => i !== id)
}

const loadInbounds = async () => {
  loading.value = true
  try {
    const res = await userStore.authorizedFetch('/api/inbounds')
    if (res.ok) inbounds.value = await res.json()
  } finally {
    loading.value = false
  }
}

onMounted(loadInbounds)
</script>

<style scoped>
.selection-chips { display: flex; flex-wrap: wrap; gap: 8px; }
</style>
