<template>
  <v-row>
    <v-col cols="12" md="6">
      <v-select :items="ssMethods" v-model="form.credential.method" label="Method" variant="outlined" />
    </v-col>
    <v-col cols="12" md="6">
      <v-text-field v-model="form.credential.password" label="Password" variant="outlined" type="password" />
    </v-col>
    <v-col cols="12" md="6">
      <v-text-field v-model="form.credential.plugin" label="Plugin (optional)" variant="outlined" />
    </v-col>
    <v-col cols="12" md="6">
      <v-text-field v-model="form.credential.plugin_opts" label="Plugin Opts (optional)" variant="outlined" />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
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
</style>