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
  <div v-for="(item, idx) in inbounds" :key="item.tag ?? `new-${idx}`" class="mt-4">
    <Inbound
      :form="item"
      :all-tags="allTags"
      @update:form="updateInbound(idx, $event)"
      @delete="removeInbound(item.tag)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Inbound from '@/components/inbounds/inbound/inbound.vue'
import { defaultInbound } from '@/components/inbounds/inbound/schema'
import type { Inbound as APIInbound } from '@/components/inbounds/inbound/schema'

const props = defineProps<{ modelValue: APIInbound[] }>()
const emit = defineEmits(['update:modelValue'])

const inbounds = ref<APIInbound[]>([])
const allTags = computed(() => inbounds.value.map((i) => i.tag))

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== inbounds.value) {
      inbounds.value = newValue
    }
  },
  { immediate: true, deep: true }
)

const addInbound = () => {
  inbounds.value.push(defaultInbound())
  emit('update:modelValue', inbounds.value)
}

const updateInbound = (index: number, updatedInbound: APIInbound) => {
  inbounds.value[index] = updatedInbound
  emit('update:modelValue', inbounds.value)
}

const removeInbound = (tag: string) => {
  inbounds.value = inbounds.value.filter((inbound) => inbound.tag !== tag)
  emit('update:modelValue', inbounds.value)
}
</script>

<style scoped>
.selection-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>