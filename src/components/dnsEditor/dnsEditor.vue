<template>
  <v-card variant="outlined" class="form-section">
    <v-card-title class="text-h6 d-flex align-center justify-space-between">
      DNS
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="6">
          <v-select
            v-model="selectedServerIds"
            :items="serverItems"
            item-title="title"
            item-value="value"
            label="DNS Servers"
            multiple
            chips
            clearable
            variant="outlined"
            :loading="loadingServers"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            v-model="selectedRuleIds"
            :items="ruleItems"
            item-title="title"
            item-value="value"
            label="DNS Rules"
            multiple
            chips
            clearable
            variant="outlined"
            :loading="loadingRules"
          />
        </v-col>
      </v-row>

      <v-expansion-panels class="mt-4">
        <v-expansion-panel>
          <v-expansion-panel-title>Advanced</v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="localDns.strategy" label="Strategy" variant="outlined" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="localDns.client_ip" label="Client IP" variant="outlined" />
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

type DnsServer = any
type DnsRule = any

type DnsConfig = {
  servers?: DnsServer[]
  rules?: DnsRule[]
  strategy?: string
  client_ip?: string
}

const props = defineProps<{ dns: DnsConfig }>()
const emit = defineEmits<{ 'update:dns': [value: DnsConfig] }>()

const userStore = useUserStore()

const localDns = ref<DnsConfig>({ servers: [], rules: [] })

const loadingServers = ref(false)
const serverItems = ref<{ title: string; value: number; raw: any }[]>([])
const selectedServerIds = ref<number[]>([])

const loadingRules = ref(false)
const ruleItems = ref<{ title: string; value: number; raw: any }[]>([])
const selectedRuleIds = ref<number[]>([])

const syncEmit = () => {
  const servers = selectedServerIds.value
    .map((id) => serverItems.value.find((s) => s.value === id)?.raw)
    .filter(Boolean)
  const rules = selectedRuleIds.value
    .map((id) => ruleItems.value.find((r) => r.value === id)?.raw)
    .filter(Boolean)
  emit('update:dns', { ...localDns.value, servers, rules })
}

watch(() => props.dns, (val) => {
  if (!val) return
  localDns.value = { ...val }
}, { immediate: true, deep: true })

watch([localDns, selectedServerIds, selectedRuleIds], syncEmit, { deep: true })

const loadServers = async () => {
  loadingServers.value = true
  try {
    const res = await userStore.authorizedFetch('/api/dns_servers')
    if (res.ok) {
      const data = await res.json()
      serverItems.value = data.map((s: any) => ({ title: `${s.name} (${s.type})`, value: s.id, raw: s }))
    }
  } finally {
    loadingServers.value = false
  }
}

const loadRules = async () => {
  loadingRules.value = true
  try {
    const res = await userStore.authorizedFetch('/api/dns_rules')
    if (res.ok) {
      const data = await res.json()
      ruleItems.value = data.map((r: any) => ({ title: r.name, value: r.id, raw: r }))
    }
  } finally {
    loadingRules.value = false
  }
}

onMounted(() => {
  loadServers()
  loadRules()
})
</script>

<style scoped>
</style>
