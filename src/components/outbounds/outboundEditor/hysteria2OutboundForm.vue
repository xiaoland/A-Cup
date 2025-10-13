<template>
  <v-row>
    <v-col cols="12" md="6">
      <v-text-field v-model="form.credential.password" label="Password" variant="outlined" type="password" />
    </v-col>
    <v-col cols="12" md="3">
      <v-text-field type="number" v-model.number="form.credential.up_mbps" label="Up Mbps" variant="outlined" />
    </v-col>
    <v-col cols="12" md="3">
      <v-text-field type="number" v-model.number="form.credential.down_mbps" label="Down Mbps" variant="outlined" />
    </v-col>
    <v-col cols="12" md="4">
      <v-select :items="hy2ObfsTypes" v-model="form.credential.obfs.type" label="Obfs Type" variant="outlined" clearable />
    </v-col>
    <v-col cols="12" md="8">
      <v-text-field v-model="form.credential.obfs.password" label="Obfs Password" variant="outlined" />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { Outbound } from './types'

defineProps<{ form: Outbound }>()

const hy2ObfsTypes = ['salamander']
</script>

<style scoped>
</style>