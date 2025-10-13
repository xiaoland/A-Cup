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
  </v-card>

  <!-- Display and edit using Inbound component -->
  <div v-for="(item, idx) in modelValue" :key="item.tag ?? `new-${idx}`" class="mt-4">
    <Inbound
      :form="item"
      :all-tags="allTags"
      @update:form="updateInbound(idx, $event)"
      @delete="removeInbound(item.tag)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Inbound from '@/components/inbounds/inbound/inbound.vue'
import { defaultInbound } from '@/components/inbounds/inbound/schema'
import type { Inbound as APIInbound } from '@/components/inbounds/inbound/schema'

const props = defineProps<{ modelValue: APIInbound[] }>()
const emit = defineEmits(['update:modelValue'])

const allTags = computed(() => (props.modelValue || []).map((i) => i.tag))

const addInbound = () => {
  const newInbounds = [...(props.modelValue || []), defaultInbound()]
  emit('update:modelValue', newInbounds)
}

const updateInbound = (index: number, updatedInbound: APIInbound) => {
  const newInbounds = [...(props.modelValue || [])]
  newInbounds[index] = updatedInbound
  emit('update:modelValue', newInbounds)
}

const removeInbound = (tag: string) => {
  const newInbounds = (props.modelValue || []).filter((inbound) => inbound.tag !== tag)
  emit('update:modelValue', newInbounds)
}
</script>

<style scoped>
.selection-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>