<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DNSServerList from '@/components/dnsServerList/dnsServerList.vue'
import DNSRuleList from '@/components/dnsRuleList/dnsRuleList.vue'
import type { DNSServer } from '@/components/dnsServerList/types'
import type { DNSRule } from '@/components/dnsRuleList/types'

const router = useRouter()
const dnsServerListRef = ref<InstanceType<typeof DNSServerList> | null>(null)
const dnsRuleListRef = ref<InstanceType<typeof DNSRuleList> | null>(null)

const tab = ref('servers')

const handleCreateServer = () => {
  router.push('/dns/servers/create')
}

const handleEditServer = (server: DNSServer) => {
  router.push(`/dns/servers/${server.id}/edit`)
}

const handleCreateRule = () => {
  router.push('/dns/rules/create')
}

const handleEditRule = (rule: DNSRule) => {
  router.push(`/dns/rules/${rule.id}/edit`)
}
</script>

<template>
  <v-container class="dns-management">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="me-2">mdi-dns</v-icon>
        DNS Management
      </v-card-title>
      
      <v-tabs v-model="tab" class="px-4">
        <v-tab value="servers">
          <v-icon class="me-2">mdi-dns</v-icon>
          DNS Servers
        </v-tab>
        <v-tab value="rules">
          <v-icon class="me-2">mdi-dns-outline</v-icon>
          DNS Rules
        </v-tab>
      </v-tabs>

      <v-card-text class="pa-0">
        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="servers">
            <div class="pa-4">
              <DNSServerList 
                ref="dnsServerListRef"
                @create="handleCreateServer"
                @edit="handleEditServer"
              />
            </div>
          </v-tabs-window-item>
          
          <v-tabs-window-item value="rules">
            <div class="pa-4">
              <DNSRuleList 
                ref="dnsRuleListRef"
                @create="handleCreateRule"
                @edit="handleEditRule"
              />
            </div>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>
.dns-management {
  max-width: 100%;
}
</style>