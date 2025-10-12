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
    <Inbound :form="item" @save="handleSaved($event, item)" @delete="removeInbound(item.id)" />
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, computed } from 'vue'
import Inbound from '@/components/inbounds/inbound/inbound.vue'
import type { Inbound as APIInbound } from '@/components/inbounds/inbound/schema'

const props = defineProps<{ form: any }>()

const inbounds = ref<APIInbound[]>([])
const newInbounds = ref<APIInbound[]>([])

const chipLabel = (i: APIInbound) => {
  if (!i.type) return `Inbound #${i.id}`
  if (i.type === 'mixed') {
    const host = (i as any).listen
    const port = (i as any).listen_port
    const addr = host || port ? ` — ${host ?? ''}${port ? `:${port}` : ''}` : ''
    return `mixed${addr}`
  }
  if (i.type === 'tun') {
    const name = (i as any).interface_name
    const addr = (i as any).address?.[0]
    const extra = name || addr ? ` — ${name ?? addr ?? ''}` : ''
    return `tun${extra}`
  }
  return `${i.type}`
}

const getId = (i: APIInbound) => (typeof i.id === 'number' ? i.id : -1)
const selectedInbounds = computed(() =>
  inbounds.value.filter(i => typeof i.id === 'number' && props.form.inbounds?.includes(i.id))
)

const addInbound = () => {
  // push a new, unsaved inbound; component will be editable by default (no id)
  newInbounds.value.push({ type: 'mixed' } as APIInbound)
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
