<script setup lang="ts">
import { ref } from 'vue'
import OutboundEditor from '@/components/outbounds/outboundEditor/outboundEditor.vue'
import type { Outbound } from '@/components/outbounds/outboundEditor/types'

const form = ref<Outbound>({
  name: '',
  region: undefined,
  provider: undefined,
  tag: undefined,
  type: 'vmess',
  server: '',
  server_port: 0,
  credential: {},
})
</script>

<template>
  <OutboundEditor :form="form" />
</template>

<style>
</style>
