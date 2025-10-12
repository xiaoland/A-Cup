<template>
  <v-card variant="outlined" class="form-section">
    <v-card-title class="text-h6 d-flex align-center justify-space-between">
      Inbounds
      <div class="d-flex" style="gap: 8px">
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

  <!-- Create dialog reusing InboundEditor -->
  <v-dialog v-model="createDialog" max-width="900px" scrollable>
    <InboundEditor @save="onCreateSaved" @cancel="createDialog = false" />
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import InboundEditor from '@/components/inboundEditor/inboundEditor.vue'
import type { Inbound as APIInbound } from '@/components/inboundEditor/types'

const props = defineProps<{ form: any }>()

const inbounds = ref<APIInbound[]>([])

const createDialog = ref(false)

const chipLabel = (i: APIInbound) => i.type ? `${i.type}${i.address || i.port ? ` — ${i.address || ''}${i.port ? `:${i.port}` : ''}` : ''}` : `Inbound #${i.id}`

const getId = (i: APIInbound) => (typeof i.id === 'number' ? i.id : -1)
const selectedInbounds = computed(() =>
  inbounds.value.filter(i => typeof i.id === 'number' && props.form.inbounds?.includes(i.id))
)

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
}

const removeInbound = (id?: number) => {
  if (id == null) return
  props.form.inbounds = (props.form.inbounds || []).filter((i: number) => i !== id)
}
</script>

<style scoped>
.selection-chips { display: flex; flex-wrap: wrap; gap: 8px; }
</style>
