<template>
  <div class="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="field col-span-1">
      <label for="default">Default</label>
      <outboundsPicker
        id="default"
        v-model="form.default"
        :available-outbound-tags="availableOutboundTags"
      />
    </div>
    <div class="field col-span-2">
      <label for="outbounds">Outbounds</label>
      <outboundsPicker
        id="outbounds"
        v-model="form.outbounds"
        :available-outbound-tags="availableOutboundTags"
        multiple
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SelectorOutbound } from '@/schemas/outbound'
import outboundsPicker from '@/components/outbounds/outboundsPicker/outboundsPicker.vue'

const props = defineProps<{
  form: SelectorOutbound
  availableOutboundTags?: string[]
}>()
const form = ref(props.form)
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>