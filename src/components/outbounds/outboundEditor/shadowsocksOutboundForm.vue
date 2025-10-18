<template>
  <div class="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="field col-span-1">
      <label for="method">Method</label>
      <Select
        id="method"
        v-model="form.credential.method"
        :options="ssMethods"
      />
    </div>
    <div class="field col-span-1">
      <label for="password">Password</label>
      <Password
        id="password"
        v-model="form.credential.password"
        :feedback="false"
        toggleMask
      />
    </div>
    <div class="field col-span-1">
      <label for="plugin">Plugin (optional)</label>
      <InputText id="plugin" v-model="form.credential.plugin" />
    </div>
    <div class="field col-span-1">
      <label for="plugin_opts">Plugin Opts (optional)</label>
      <InputText id="plugin_opts" v-model="form.credential.plugin_opts" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Select from 'primevue/select'
import Password from 'primevue/password'
import InputText from 'primevue/inputtext'
import type { Outbound } from './types'

defineProps<{ form: Outbound }>()

const ssMethods = [
  '2022-blake3-aes-128-gcm',
  '2022-blake3-aes-256-gcm',
  '2022-blake3-chacha20-poly1305',
  'none',
  'aes-128-gcm', 'aes-192-gcm', 'aes-256-gcm',
  'chacha20-ietf-poly1305', 'xchacha20-ietf-poly1305',
  'aes-128-ctr','aes-192-ctr','aes-256-ctr','aes-128-cfb','aes-192-cfb','aes-256-cfb','rc4-md5','chacha20-ietf','xchacha20'
]
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>