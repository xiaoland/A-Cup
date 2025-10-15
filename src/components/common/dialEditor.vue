<template>
  <div>
    <outboundsSelector v-model="dial.detour" label="Detour" class="my-2" />
    <template v-if="!dial.detour">
      <v-text-field v-model="dial.bind_interface" label="Bind Interface" class="my-2" />
      <v-text-field v-model="dial.inet4_bind_address" label="IPv4 Bind Address" class="my-2" />
      <v-text-field v-model="dial.inet6_bind_address" label="IPv6 Bind Address" class="my-2" />
      <v-text-field v-model.number="dial.routing_mark" label="Routing Mark" class="my-2" />
      <v-checkbox v-model="dial.reuse_addr" label="Reuse Address" />
      <v-text-field v-model="dial.netns" label="Network Namespace" class="my-2" />
      <v-text-field v-model="dial.connect_timeout" label="Connect Timeout" class="my-2" />
      <v-checkbox v-model="dial.tcp_fast_open" label="TCP Fast Open" />
      <v-checkbox v-model="dial.tcp_multi_path" label="TCP Multi Path" />
      <v-checkbox v-model="dial.udp_fragment" label="UDP Fragment" />
      <v-text-field v-model="dial.domain_resolver" label="Domain Resolver" class="my-2" />
      <v-text-field v-model="dial.network_strategy" label="Network Strategy" class="my-2" />
      <v-combobox v-model="dial.network_type" label="Network Type" multiple chips class="my-2" />
      <v-combobox v-model="dial.fallback_network_type" label="Fallback Network Type" multiple chips class="my-2" />
      <v-text-field v-model="dial.fallback_delay" label="Fallback Delay" class="my-2" />
      <v-text-field v-model="dial.domain_strategy" label="Domain Strategy" class="my-2" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import outboundsSelector from '@/components/outbounds/outboundsSelector/outboundsSelector.vue'
import { type dialSchema } from '@/schemas/dns'

const props = defineProps<{
  modelValue: any
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const dial = ref(props.modelValue || {})

watch(
  dial,
  (value) => {
    emit('update:modelValue', value)
  },
  { deep: true }
)
</script>