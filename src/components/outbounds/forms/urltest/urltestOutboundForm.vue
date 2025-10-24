<template>
  <div class="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="field col-span-1">
      <label for="url">URL</label>
      <InputText id="url" v-model="form.url" />
    </div>
    <div class="field col-span-1">
      <label for="interval">Interval</label>
      <InputText id="interval" v-model="form.interval" />
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
import InputText from 'primevue/inputtext'
import type { UrlTestOutbound } from '@/schemas/outbound'
import outboundsPicker from '@/components/outbounds/outboundsPicker/outboundsPicker.vue'

const props = defineProps<{
  form: UrlTestOutbound
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