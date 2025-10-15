<template>
  <Editor
    v-model="server"
    title="DNS Server"
    :show-delete="true"
    @delete="emit('remove')"
    :start-editable="true"
  >
    <v-form>
      <v-select v-model="type" label="Type" :items="['udp', 'https', 'fakeip']" />
      <v-text-field v-model="server.tag" label="Tag" />
      <v-text-field v-if="type !== 'fakeip'" v-model="server.address" label="Address" />
      <v-text-field v-if="type === 'https'" v-model="server.address_resolver" label="Address Resolver" />
      <v-text-field v-model="server.detour" label="Detour" />
    </v-form>
  </Editor>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { type DnsServer } from '@/schemas/dns'
import Editor from '@/components/common/Editor.vue'

const props = defineProps<{
  modelValue: DnsServer
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: DnsServer): void
  (e: 'remove'): void
}>()

const server = ref(props.modelValue)
const type = computed({
  get: () => {
    if (server.value.address?.startsWith('https')) {
      return 'https'
    }
    if (server.value.address === 'fakeip') {
      return 'fakeip'
    }
    return 'udp'
  },
  set: (value) => {
    if (value === 'https') {
      server.value.address = 'https://'
    } else if (value === 'fakeip') {
      server.value.address = 'fakeip'
    } else {
      server.value.address = ''
    }
  },
})

watch(
  server,
  (value) => {
    emit('update:modelValue', value)
  },
  { deep: true }
)
</script>