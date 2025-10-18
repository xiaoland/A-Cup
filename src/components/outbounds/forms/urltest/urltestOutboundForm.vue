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
      <AutoComplete
        id="outbounds"
        v-model="form.outbounds"
        :suggestions="filteredOutbounds"
        @complete="searchOutbounds"
        multiple
        typeahead
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import AutoComplete from 'primevue/autocomplete'
import type { UrlTestOutbound } from '@/types/outbound'
import { useOutboundStore } from '@/stores/outbound'

const props = defineProps<{ form: UrlTestOutbound }>()
const form = ref(props.form)
const outboundStore = useOutboundStore()
const filteredOutbounds = ref<string[]>([])

const searchOutbounds = (event: { query: string }) => {
  const query = event.query.toLowerCase()
  filteredOutbounds.value = outboundStore.outbounds
    .map(o => o.name)
    .filter(name => name.toLowerCase().includes(query))
}
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>