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
      <label for="method">Method</label>
      <InputText id="method" v-model="form.method" />
    </div>
    <div class="field col-span-1">
      <label for="password">Password</label>
      <InputText id="password" v-model="form.password" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import type { ShadowsocksOutbound } from '@/schemas/outbound'

const props = defineProps<{ form: ShadowsocksOutbound }>()
const form = ref(props.form)
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>