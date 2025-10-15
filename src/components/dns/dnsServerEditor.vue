<template>
  <Editor
    v-model="server"
    title="DNS Server"
    :show-delete="true"
    @delete="emit('remove')"
    :start-editable="true"
  >
    <v-form>
      <v-select v-model="type" label="Type" :items="['udp', 'https', 'fakeip']" class="my-2" />
      <v-text-field v-model="server.tag" label="Tag" class="my-2" />
      <v-text-field v-if="type !== 'fakeip'" v-model="server.address" label="Address" class="my-2" />

      <!-- UDP Fields -->
      <div v-if="type === 'udp'">
        <v-text-field v-model.number="server.server_port" label="Server Port" class="my-2" />
      </div>

      <!-- HTTPS Fields -->
      <div v-if="type === 'https'">
        <v-text-field v-model.number="server.server_port" label="Server Port" class="my-2" />
        <v-text-field v-model="server.path" label="Path" class="my-2" />
        <!-- A simple key-value editor for headers can be implemented here -->
      </div>

      <!-- FakeIP Fields -->
      <div v-if="type === 'fakeip'">
        <v-text-field v-model="server.inet4_range" label="IPv4 Range" class="my-2" />
        <v-text-field v-model="server.inet6_range" label="IPv6 Range" class="my-2" />
      </div>

      <dialEditor v-model="server.dial_fields" class="my-2" />
    </v-form>
  </Editor>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { type DnsServer, dnsServerSchema } from '@/schemas/dns'
import Editor from '@/components/common/Editor.vue'
import dialEditor from '@/components/common/dialEditor.vue'

const props = defineProps<{
  modelValue?: DnsServer
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: DnsServer): void
  (e: 'remove'): void
}>()

const server = ref(props.modelValue || dnsServerSchema.parse({ tag: '', address: '' }))
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