<template>
  <v-card variant="outlined" class="form-section">
    <v-card-title class="text-h6 d-flex align-center justify-space-between">
      DNS
    </v-card-title>
    <v-card-text>
      <!-- Servers -->
      <div class="mb-2 d-flex align-center justify-space-between">
        <div class="text-subtitle-1">Servers</div>
        <v-btn size="small" variant="outlined" prepend-icon="mdi-plus" @click="openServerDialog()">Add DNS Server</v-btn>
      </div>

      <v-expansion-panels multiple class="mb-6">
        <v-expansion-panel v-for="(server, sidx) in localDns.servers" :key="sidx">
          <v-expansion-panel-title>
            <div class="d-flex align-center w-100">
              <span class="me-3">Server #{{ sidx + 1 }}</span>
              <v-chip size="x-small" class="me-2">{{ server.type }}</v-chip>
              <span class="text-caption text-medium-emphasis">{{ server.name || server.address || '—' }}</span>
              <v-spacer />
              <v-btn icon="mdi-pencil" size="x-small" variant="text" class="me-1" @click.stop="openServerDialog(server, sidx)" />
              <v-btn icon="mdi-delete" size="x-small" variant="text" color="error" @click.stop="removeServer(sidx)" />
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="text-caption text-medium-emphasis">{{ summarizeServer(server) }}</div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <v-divider class="my-4" />

      <!-- Rules -->
      <div class="mb-2 d-flex align-center justify-space-between">
        <div class="text-subtitle-1">Rules</div>
        <v-btn size="small" variant="outlined" prepend-icon="mdi-plus" @click="openRuleDialog()">Add DNS Rule</v-btn>
      </div>

      <div class="rules-list">
        <div
          v-for="(rule, ridx) in localDns.rules"
          :key="ridx"
          class="rule-item"
          draggable="true"
          @dragstart="onRuleDragStart(ridx)"
          @dragover.prevent
          @drop="onRuleDrop(ridx)"
        >
          <div class="rule-main">
            <div class="rule-handle">
              <v-icon size="small">mdi-drag</v-icon>
            </div>
            <div class="rule-summary">
              <div class="text-body-2">{{ rule.name || `Rule #${ridx + 1}` }} <v-chip size="x-small" class="ms-1">{{ rule.action || 'route' }}</v-chip></div>
              <div class="text-caption text-medium-emphasis">{{ summarizeRule(rule) }}</div>
            </div>
          </div>
          <div class="rule-actions">
            <v-btn icon="mdi-pencil" size="x-small" variant="text" class="me-1" @click="openRuleDialog(rule, ridx)" />
            <v-btn icon="mdi-delete" size="x-small" variant="text" color="error" @click="removeRule(ridx)" />
          </div>
        </div>
        <div v-if="(localDns.rules?.length || 0) === 0" class="text-body-2 text-medium-emphasis">No rules yet. Click Add to create one.</div>
      </div>

      <v-divider class="my-4" />

      <!-- Advanced -->
      <v-expansion-panels class="mt-2">
        <v-expansion-panel>
          <v-expansion-panel-title>Advanced</v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="localDns.final" label="Final Server Tag" variant="outlined" hint="Default DNS server tag; first server used if empty" persistent-hint />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="localDns.strategy"
                  :items="strategyItems"
                  item-title="title"
                  item-value="value"
                  label="Strategy"
                  variant="outlined"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="4">
                <v-switch v-model="localDns.disable_cache" label="Disable Cache" color="primary" />
              </v-col>
              <v-col cols="12" md="4">
                <v-switch v-model="localDns.disable_expire" label="Disable Expire" color="primary" />
              </v-col>
              <v-col cols="12" md="4">
                <v-switch v-model="localDns.independent_cache" label="Independent Cache" color="primary" />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field v-model.number="localDns.cache_capacity" type="number" label="Cache Capacity" variant="outlined" hint="Value < 1024 ignored" persistent-hint />
              </v-col>
              <v-col cols="12" md="4">
                <v-switch v-model="localDns.reverse_mapping" label="Reverse Mapping" color="primary" />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="localDns.client_subnet" label="Client Subnet" variant="outlined" hint="edns0-subnet; CIDR or IP" persistent-hint />
              </v-col>
            </v-row>
            <v-divider class="my-2" />
            <div class="text-subtitle-2 mb-2">FakeIP</div>
            <v-row>
              <v-col cols="12" md="4">
                <v-switch v-model="localFakeip.enabled" label="Enable FakeIP" color="primary" />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="localFakeip.inet4_range" label="IPv4 Range" placeholder="198.18.0.0/15" variant="outlined" />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="localFakeip.inet6_range" label="IPv6 Range" placeholder="fc00::/18" variant="outlined" />
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
  </v-card>

  <!-- Server Dialog -->
  <v-dialog v-model="serverDialog.show" max-width="900px" scrollable>
    <v-card>
      <v-card-title>{{ serverDialog.editIndex === -1 ? 'Add DNS Server' : 'Edit DNS Server' }}</v-card-title>
      <v-card-text>
        <DNSServerEditor v-model:dns-server="serverDialog.data" :mode="serverDialog.editIndex === -1 ? 'create' : 'edit'" @save="onServerSaved" @cancel="serverDialog.show = false" />
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Rule Dialog -->
  <v-dialog v-model="ruleDialog.show" max-width="900px" scrollable>
    <v-card>
      <v-card-title>{{ ruleDialog.editIndex === -1 ? 'Add DNS Rule' : 'Edit DNS Rule' }}</v-card-title>
      <v-card-text>
        <DNSRuleEditor v-model:dns-rule="ruleDialog.data" :dns-servers="localDns.servers" :mode="ruleDialog.editIndex === -1 ? 'create' : 'edit'" @save="onRuleSaved" @cancel="ruleDialog.show = false" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import DNSServerEditor from '@/components/dnsServerEditor/dnsServerEditor.vue'
import DNSRuleEditor from '@/components/dnsRuleEditor/dnsRuleEditor.vue'

type DnsServer = any
type DnsRule = any

type FakeIP = {
  enabled?: boolean
  inet4_range?: string
  inet6_range?: string
}

type DnsConfig = {
  servers: DnsServer[]
  rules: DnsRule[]
  final?: string
  strategy?: 'prefer_ipv4' | 'prefer_ipv6' | 'ipv4_only' | 'ipv6_only' | ''
  disable_cache?: boolean
  disable_expire?: boolean
  independent_cache?: boolean
  cache_capacity?: number
  reverse_mapping?: boolean
  client_subnet?: string
  fakeip?: FakeIP
}

const props = defineProps<{ dns: DnsConfig }>()
const emit = defineEmits<{ 'update:dns': [value: DnsConfig] }>()

const localDns = ref<DnsConfig>({ servers: [], rules: [] })
const localFakeip = ref<FakeIP>({})

const strategyItems = [
  { title: 'prefer_ipv4', value: 'prefer_ipv4' },
  { title: 'prefer_ipv6', value: 'prefer_ipv6' },
  { title: 'ipv4_only', value: 'ipv4_only' },
  { title: 'ipv6_only', value: 'ipv6_only' }
]

watch(() => props.dns, (val) => {
  if (!val) return
  localDns.value = { ...val, servers: [...(val.servers || [])], rules: [...(val.rules || [])] }
  localFakeip.value = { ...(val.fakeip || {}) }
}, { immediate: true, deep: true })

watch([localDns, localFakeip], () => {
  const payload: DnsConfig = { ...localDns.value }
  if (localFakeip.value && (localFakeip.value.enabled || localFakeip.value.inet4_range || localFakeip.value.inet6_range)) {
    payload.fakeip = { ...localFakeip.value }
  } else {
    delete (payload as any).fakeip
  }
  emit('update:dns', payload)
}, { deep: true })

// Servers
const serverDialog = ref<{ show: boolean; editIndex: number; data: DnsServer | undefined }>({ show: false, editIndex: -1, data: undefined })

const openServerDialog = (server?: DnsServer, index: number = -1) => {
  serverDialog.value = {
    show: true,
    editIndex: index,
    data: server ? { ...server } : undefined
  }
}

const onServerSaved = (saved: DnsServer) => {
  if (serverDialog.value.editIndex === -1) {
    localDns.value.servers.push(saved)
  } else {
    localDns.value.servers.splice(serverDialog.value.editIndex, 1, saved)
  }
  serverDialog.value.show = false
}

const removeServer = (index: number) => {
  localDns.value.servers.splice(index, 1)
}

const summarizeServer = (s: any) => {
  const parts: string[] = []
  if (s.type) parts.push(s.type)
  if (s.address) parts.push(`${s.address}${s.port ? ':' + s.port : ''}`)
  if (s.outbound_detour) parts.push(`detour#${s.outbound_detour}`)
  if (s.wg_endpoint_detour) parts.push(`wg#${s.wg_endpoint_detour}`)
  return parts.join(' · ')
}

// Rules
const ruleDialog = ref<{ show: boolean; editIndex: number; data: DnsRule | undefined }>({ show: false, editIndex: -1, data: undefined })
const draggingRuleIndex = ref<number | null>(null)

const openRuleDialog = (rule?: DnsRule, index: number = -1) => {
  ruleDialog.value = {
    show: true,
    editIndex: index,
    data: rule ? { ...rule } : undefined
  }
}

const onRuleSaved = (saved: DnsRule) => {
  if (ruleDialog.value.editIndex === -1) {
    localDns.value.rules.push(saved)
  } else {
    localDns.value.rules.splice(ruleDialog.value.editIndex, 1, saved)
  }
  ruleDialog.value.show = false
}

const removeRule = (index: number) => {
  localDns.value.rules.splice(index, 1)
}

const summarizeRule = (r: any) => {
  const tokens: string[] = []
  if (Array.isArray(r.domains) && r.domains.length) tokens.push(r.domains[0])
  if (Array.isArray(r.domain_suffixes) && r.domain_suffixes.length) tokens.push('.' + r.domain_suffixes[0])
  if (Array.isArray(r.domain_keywords) && r.domain_keywords.length) tokens.push('*' + r.domain_keywords[0])
  if (Array.isArray(r.rule_sets) && r.rule_sets.length) tokens.push(`#sets:${r.rule_sets.length}`)
  return tokens.join(' · ')
}

const onRuleDragStart = (index: number) => {
  draggingRuleIndex.value = index
}

const onRuleDrop = (toIndex: number) => {
  const from = draggingRuleIndex.value
  if (from === null || from === toIndex) return
  const list = localDns.value.rules
  const [moved] = list.splice(from, 1)
  list.splice(toIndex, 0, moved)
  draggingRuleIndex.value = null
}
</script>

<style scoped lang="scss">
.rules-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.rule-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 8px;
  background: rgb(var(--v-theme-surface));
}
.rule-main { display: flex; align-items: center; gap: 8px; }
.rule-handle { cursor: grab; display: flex; align-items: center; }
.rule-summary { display: flex; flex-direction: column; }
</style>
