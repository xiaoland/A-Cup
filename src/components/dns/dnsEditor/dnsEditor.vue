<template>
  <Editor title="DNS" :model-value="dns">
    <v-tabs v-model="tab" color="primary">
      <v-tab value="servers">Servers</v-tab>
      <v-tab value="rules">Rules</v-tab>
      <v-tab value="advanced">Advanced</v-tab>
    </v-tabs>
    <v-window v-model="tab">
      <v-window-item value="servers">
        <div class="d-flex flex-column" style="gap: 16px;">
          <dnsServerEditor
            v-for="(server, i) in dns.servers"
            :key="i"
            v-model="dns.servers[i]"
            @remove="removeServer(i)"
          />
        </div>
        <v-btn class="mt-4" @click="addServer">Add Server</v-btn>
      </v-window-item>
      <v-window-item value="rules">
        <div class="d-flex flex-column" style="gap: 16px;">
          <dnsRuleEditor
            v-if="dns.rules"
            v-for="(rule, i) in dns.rules"
            :key="i"
            v-model="dns.rules[i]"
            :dns-servers="serverTags"
            @remove="removeRule(i)"
          />
        </div>
        <v-btn class="mt-4" @click="addRule">Add Rule</v-btn>
      </v-window-item>
      <v-window-item value="advanced">
        <outboundsSelector v-model="dns.final" label="Final" />
        <v-select
          v-model="dns.strategy"
          label="Strategy"
          :items="['prefer_ipv4', 'prefer_ipv6', 'ipv4_only', 'ipv6_only']"
        />
        <v-checkbox v-model="dns.disable_cache" label="Disable Cache" />
        <v-checkbox v-model="dns.disable_expire" label="Disable Expire" />
      </v-window-item>
    </v-window>
  </Editor>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { type Dns, dnsSchema } from '@/schemas/dns'
import Editor from '@/components/common/Editor.vue'
import dnsServerEditor from '../dnsServerEditor.vue'
import dnsRuleEditor from '../dnsRuleEditor/dnsRuleEditor.vue'
import outboundsSelector from '@/components/outbounds/outboundsSelector/outboundsSelector.vue'

const props = defineProps<{
  modelValue?: Dns
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Dns): void
}>()

const dns = ref(props.modelValue || dnsSchema.parse({ servers: [] }))
const tab = ref('servers')

const serverTags = computed(() => dns.value.servers.map((s) => s.tag))

const addServer = () => {
  dns.value.servers.push(dnsSchema.shape.servers.element.parse({ tag: 'new-server', address: '' }))
}

const removeServer = (index: number) => {
  dns.value.servers.splice(index, 1)
}

const addRule = () => {
  if (!dns.value.rules) {
    dns.value.rules = []
  }
  dns.value.rules.push(dnsSchema.shape.rules.unwrap().element.parse({ server: '' }))
}

const removeRule = (index: number) => {
  dns.value.rules?.splice(index, 1)
}

watch(
  dns,
  (value) => {
    emit('update:modelValue', value)
  },
  { deep: true }
)
</script>