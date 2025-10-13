<template>
  <v-row>
    <v-col cols="12" md="6">
      <v-select
        v-model="form.type"
        :items="typeOptions"
        item-title="title"
        item-value="value"
        label="Type"
        variant="outlined"
        required
      />
    </v-col>
    <v-col cols="12">
      <OutboundsSelector v-model="(form as any).outbounds" />
    </v-col>
    <v-col cols="12" md="4">
      <v-switch inset v-model="(form as any).interrupt_exist_connections" label="Interrupt existing connections" />
    </v-col>
    <v-col cols="12" md="6">
      <v-text-field v-model="(form as any).url" label="Test URL (optional)" variant="outlined" />
    </v-col>
    <v-col cols="12" md="3">
      <v-text-field v-model="(form as any).interval" label="Interval (e.g. 3m)" variant="outlined" />
    </v-col>
    <v-col cols="12" md="3">
      <v-text-field type="number" v-model.number="(form as any).tolerance" label="Tolerance (ms)" variant="outlined" />
    </v-col>
    <v-col cols="12" md="4">
      <v-text-field v-model="(form as any).idle_timeout" label="Idle Timeout (e.g. 30m)" variant="outlined" />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { Outbound } from './types'
import { typeOptions } from './types'
import OutboundsSelector from '@/components/outbounds/common/OutboundsSelector.vue'

defineProps<{ form: Outbound }>()
</script>

<style scoped>
</style>