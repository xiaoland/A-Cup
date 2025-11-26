<template>
  <Card>
    <template #title>
      <div class="flex justify-between items-center">
        <div class="text-xl font-bold">DNS Server</div>
        <Button icon="i-mdi-delete" severity="danger" text rounded @click="emit('remove')" />
      </div>
    </template>
    <template #content>
      <div class="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="field col-span-1">
          <label for="type">Type</label>
          <Select id="type" v-model="server.type" :options="['udp', 'https', 'fakeip']" />
        </div>
        <div class="field col-span-1">
          <label for="tag">Tag</label>
          <InputText id="tag" v-model="server.tag" />
        </div>
        <div v-if="server.type !== 'fakeip'" class="field col-span-1">
          <label for="address">Address</label>
          <InputText id="address" v-model="server.address" />
        </div>

        <!-- UDP Fields -->
        <div v-if="server.type === 'udp'" class="field col-span-1">
          <label for="server_port">Server Port</label>
          <InputNumber id="server_port" v-model.number="server.server_port" />
        </div>

        <!-- HTTPS Fields -->
        <template v-if="server.type === 'https'">
          <div class="field col-span-1">
            <label for="server_port_https">Server Port</label>
            <InputNumber id="server_port_https" v-model.number="server.server_port" />
          </div>
          <div class="field col-span-1">
            <label for="path">Path</label>
            <InputText id="path" v-model="server.path" />
          </div>
        </template>

        <!-- FakeIP Fields -->
        <template v-if="server.type === 'fakeip'">
          <div class="field col-span-1">
            <label for="inet4_range">IPv4 Range</label>
            <InputText id="inet4_range" v-model="server.inet4_range" />
          </div>
          <div class="field col-span-1">
            <label for="inet6_range">IPv6 Range</label>
            <InputText id="inet6_range" v-model="server.inet6_range" />
          </div>
        </template>

        <div class="col-span-2">
            <dialEditor v-model="server" :dns-server-tags="dnsServerTags" />
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { type DnsServer, dnsServerSchema } from '@/schemas/dns'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import dialEditor from '@/components/common/dialEditor.vue'

const props = defineProps<{
  modelValue?: DnsServer
  dnsServerTags?: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: DnsServer): void
  (e: 'remove'): void
}>()

const server = ref(props.modelValue || dnsServerSchema.parse({ tag: '', address: '' }))

watch(
  () => server.value.type,
  (newType) => {
    if (newType === 'fakeip') {
      server.value.address = undefined
    }
  }
)

watch(
  server,
  (value) => {
    emit('update:modelValue', value)
  },
  { deep: true }
)
</script>

<style scoped>
.field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
</style>