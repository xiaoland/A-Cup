<template>
  <v-row>
    <v-col cols="12" md="6">
      <v-text-field v-model="form.credential.uuid" label="UUID" variant="outlined" />
    </v-col>
    <v-col cols="12" md="6">
      <v-select :items="vmessSecurities" v-model="form.credential.security" label="Security" variant="outlined" />
    </v-col>
    <v-col cols="12" md="4">
      <v-text-field type="number" v-model.number="form.credential.alter_id" label="Alter ID" variant="outlined" />
    </v-col>
    <v-col cols="12" md="4">
      <v-switch inset v-model="form.credential.global_padding" label="Global Padding" />
    </v-col>
    <v-col cols="12" md="4">
      <v-switch inset v-model="form.credential.authenticated_length" label="Authenticated Length" />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { Outbound } from './types'

defineProps<{ form: Outbound }>()

const vmessSecurities = ['auto','none','zero','aes-128-gcm','chacha20-poly1305']
</script>

<style scoped>
</style>