<template>
  <v-row>
    <v-col cols="12" md="6">
      <v-text-field v-model="form.credential.uuid" label="UUID" variant="outlined" />
    </v-col>
    <v-col cols="12" md="6">
      <v-select :items="vlessFlows" v-model="form.credential.flow" label="Flow (optional)" variant="outlined" clearable />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { Outbound } from './types'

defineProps<{ form: Outbound }>()

const vlessFlows = ['xtls-rprx-vision']
</script>

<style scoped>
</style>