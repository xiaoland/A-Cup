<template>
  <v-card variant="outlined" class="form-section">
    <v-card-title class="text-h6 d-flex align-center justify-space-between">
      Inbounds
      <div class="d-flex" style="gap: 8px">
        <v-btn color="primary" size="small" @click="addInbound" prepend-icon="mdi-plus">
          Add Inbound
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
  
  <!-- Display and edit using Inbound component -->
  <div v-for="(item, idx) in displayInbounds" :key="item.id ?? `new-${idx}`" class="mt-4">
    <Inbound :inbound="item" :editable="!item.id" @save="handleSaved($event, item)" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Inbound from '@/components/inbounds/inbound/inbound.vue'
import type { Inbound as APIInbound } from '@/components/inbounds/inbound/types'

const props = defineProps<{ form: any }>()

const inbounds = ref<APIInbound[]>([])
const newInbounds = ref<APIInbound[]>([])

const chipLabel = (i: APIInbound) => i.type ? `${i.type}${i.address || i.port ? ` — ${i.address || ''}${i.port ? `:${i.port}` : ''}` : ''}` : `Inbound #${i.id}`

const getId = (i: APIInbound) => (typeof i.id === 'number' ? i.id : -1)
const selectedInbounds = computed(() =>
  inbounds.value.filter(i => typeof i.id === 'number' && props.form.inbounds?.includes(i.id))
)

const addInbound = () => {
  // push a new, unsaved inbound; component will be editable by default (no id)
  newInbounds.value.push({ share: false, type: 'mixed', address: '', port: undefined, stack: 'mixed', mtu: 9000 })
}

const displayInbounds = computed(() => [
  ...newInbounds.value,
  ...selectedInbounds.value,
])

const onSaved = (saved: APIInbound, original?: APIInbound) => {
  if (saved?.id != null) {
    // ensure appears in master list
    if (!inbounds.value.find(i => i.id === saved.id)) inbounds.value.push(saved)
    // ensure selected in form
    if (!props.form.inbounds) props.form.inbounds = []
    if (!props.form.inbounds.includes(saved.id)) props.form.inbounds.push(saved.id)
  }
  // remove the temporary new item if present
  if (original && !original.id) {
    newInbounds.value = newInbounds.value.filter(i => i !== original)
  }
}

const handleSaved = (saved: APIInbound, original: APIInbound) => onSaved(saved, original)

const removeInbound = (id?: number) => {
  if (id == null) return
  props.form.inbounds = (props.form.inbounds || []).filter((i: number) => i !== id)
}
</script>

<style scoped>
.selection-chips { display: flex; flex-wrap: wrap; gap: 8px; }
</style>
