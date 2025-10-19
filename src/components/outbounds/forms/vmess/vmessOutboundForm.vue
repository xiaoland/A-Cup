<template>
  <div class="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="field col-span-1">
      <label for="server">Server</label>
      <InputText id="server" v-model="form.server" />
    </div>
    <div class="field col-span-1">
      <label for="server_port">Port</label>
      <InputNumber id="server_port" v-model="form.server_port" />
    </div>
    <div class="field col-span-1">
      <label for="uuid">UUID</label>
      <InputText id="uuid" v-model="form.uuid" />
    </div>
    <div class="field col-span-1">
      <label for="security">Security</label>
      <InputText id="security" v-model="form.security" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import type { VmessOutbound } from '@/schemas/outbound'

const props = defineProps<{ form: VmessOutbound }>()
const form = ref(props.form)
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>