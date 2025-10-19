<script setup lang="ts">
import { ref } from 'vue'
import OutboundEditor from '@/components/outbounds/outboundEditor/outboundEditor.vue'
import type { VmessOutbound } from '@/schemas/outbound'

const form = ref<VmessOutbound>({
  name: '',
  tag: '',
  type: 'vmess',
  server: '',
  server_port: 443,
  uuid: '',
  security: 'auto',
})
</script>

<template>
  <OutboundEditor :form="form" />
</template>

<style>
</style>
