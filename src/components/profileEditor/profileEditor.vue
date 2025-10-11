<template>
  <v-container class="profile-editor">
    <v-card>
      <v-card-title>
        <v-icon class="me-2">mdi-account-network-outline</v-icon>
        {{ isEditing ? 'Edit Profile' : 'Create Profile' }}
      </v-card-title>
      
      <v-card-text>
        <v-form @submit.prevent="saveProfile">
          <!-- Basic Info -->
          <v-card variant="outlined" class="form-section">
            <v-card-title class="text-h6">Basic Information</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="8">
                  <v-text-field
                    v-model="formData.name"
                    label="Profile Name *"
                    required
                    variant="outlined"
                    hint="A descriptive name for this profile"
                    persistent-hint
                  />
                </v-col>
              </v-row>
              
              <v-row>
                <v-col cols="12">
                  <v-combobox
                    v-model="selectedTagValues"
                    :items="profileTagOptions"
                    item-title="title"
                    item-value="value"
                    label="Tags"
                    variant="outlined"
                    multiple
                    chips
                    clearable
                    hint="Tags help categorize profiles for different systems, devices, or use cases"
                    persistent-hint
                    class="tags-input"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Inbounds Inline Editors -->
          <v-card variant="outlined" class="form-section">
            <v-card-title class="text-h6 d-flex align-center justify-space-between">
              Inbounds
              <v-btn color="primary" variant="outlined" size="small" prepend-icon="mdi-plus" @click="addInbound">
                Add Inbound
              </v-btn>
            </v-card-title>
            <v-card-text>
              <div v-if="inboundsState.length === 0" class="text-body-2 text-medium-emphasis">
                No inbounds. Click Add to create one.
              </div>
              <v-expansion-panels v-else multiple>
                <v-expansion-panel v-for="(inb, idx) in inboundsState" :key="idx">
                  <v-expansion-panel-title>
                    <div class="d-flex align-center w-100">
                      <span class="me-3">Inbound #{{ idx + 1 }}</span>
                      <v-chip size="x-small" class="me-2">{{ inb.type }}</v-chip>
                      <span class="text-caption text-medium-emphasis">{{ inb.address ? `${inb.address}:${inb.port || ''}` : '—' }}</span>
                      <v-spacer />
                      <v-btn icon="mdi-delete" size="x-small" variant="text" @click.stop="removeInboundAt(idx)" />
                    </div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-row>
                      <v-col cols="12" md="4">
                        <v-select v-model="inb.type" :items="['mixed','tun','socks','http']" label="Type" variant="outlined" />
                      </v-col>
                      <v-col cols="12" md="4">
                        <v-text-field v-model="inb.address" label="Address" variant="outlined" />
                      </v-col>
                      <v-col cols="12" md="4">
                        <v-text-field v-model.number="inb.port" type="number" label="Port" variant="outlined" />
                      </v-col>
                    </v-row>
                    <v-row v-if="inb.type === 'tun'">
                      <v-col cols="12" md="6">
                        <v-select v-model="inb.stack" :items="['system','gvisor','mixed']" label="Stack" variant="outlined" />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field v-model.number="inb.mtu" type="number" label="MTU" variant="outlined" />
                      </v-col>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card-text>
          </v-card>

          <!-- Outbounds Selection -->
          <v-card variant="outlined" class="form-section">
            <v-card-title class="text-h6 d-flex align-center justify-space-between">
              Outbounds
              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                @click="openSelectionDialog('outbounds')"
                prepend-icon="mdi-plus"
              >
                Select Outbounds
              </v-btn>
            </v-card-title>
            <v-card-text class="selection-section">
              <div v-if="selectedOutbounds.length === 0" class="text-body-2 text-medium-emphasis">
                No outbounds selected. First outbound will be the fallback.
              </div>
              <div v-else class="selection-chips">
                <v-chip
                  v-for="(outbound, index) in selectedOutbounds"
                  :key="outbound.id"
                  closable
                  :color="index === 0 ? 'primary' : undefined"
                  :variant="index === 0 ? 'elevated' : 'outlined'"
                  @click:close="removeOutbound(outbound.id)"
                >
                  {{ outbound.name || `${outbound.type} ${outbound.region ? `(${outbound.region})` : ''}` }}
                  <v-tooltip v-if="index === 0" activator="parent">Fallback outbound</v-tooltip>
                </v-chip>
              </div>
            </v-card-text>
          </v-card>

          <!-- Route Editor -->
          <RouteEditor v-model:route="routeState" />

          <!-- WireGuard Endpoints Selection -->
          <v-card variant="outlined" class="form-section">
            <v-card-title class="text-h6 d-flex align-center justify-space-between">
              WireGuard Endpoints
              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                @click="openSelectionDialog('wg_endpoints')"
                prepend-icon="mdi-plus"
              >
                Select Endpoints
              </v-btn>
            </v-card-title>
            <v-card-text class="selection-section">
              <div v-if="selectedWgEndpoints.length === 0" class="text-body-2 text-medium-emphasis">
                No WireGuard endpoints selected
              </div>
              <div v-else class="selection-chips">
                <v-chip
                  v-for="endpoint in selectedWgEndpoints"
                  :key="endpoint.id"
                  closable
                  @click:close="removeWgEndpoint(endpoint.id)"
                >
                  {{ endpoint.name }}
                  <v-icon v-if="endpoint.system" size="small" class="ms-1">mdi-cog</v-icon>
                </v-chip>
              </div>
            </v-card-text>
          </v-card>

          <!-- Route Rules Selection -->
          <v-card variant="outlined" class="form-section">
            <v-card-title class="text-h6 d-flex align-center justify-space-between">
              Route Rules
              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                @click="openSelectionDialog('rules')"
                prepend-icon="mdi-plus"
              >
                Select Rules
              </v-btn>
            </v-card-title>
            <v-card-text class="selection-section">
              <div v-if="selectedRules.length === 0" class="text-body-2 text-medium-emphasis">
                No route rules selected
              </div>
              <div v-else class="selection-chips">
                <v-chip
                  v-for="rule in selectedRules"
                  :key="rule.id"
                  closable
                  @click:close="removeRule(rule.id)"
                >
                  {{ rule.name }} ({{ rule.action }})
                </v-chip>
              </div>
            </v-card-text>
          </v-card>

          

          <!-- DNS Editor -->
          <DNSEditor v-model:dns="dnsState" />

          <!-- Action Buttons -->
          <div class="action-buttons d-flex justify-end">
            <v-btn
              variant="outlined"
              class="me-3"
              @click="$emit('cancel')"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              variant="elevated"
              type="submit"
              :loading="saving"
            >
              {{ isEditing ? 'Update' : 'Create' }} Profile
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Selection Dialog -->
    <v-dialog
      v-model="selectionDialog.show"
      max-width="600px"
      scrollable
    >
      <v-card class="selection-dialog">
        <v-card-title>
          Select {{ selectionDialog.title }}
        </v-card-title>
        
        <v-card-text>
          <v-text-field
            v-model="selectionDialog.search"
            label="Search"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            clearable
            class="search-field"
          />
          
          <v-list class="item-list">
            <v-list-item
              v-for="item in filteredSelectionItems"
              :key="item.id"
              :title="getItemTitle(item)"
              :subtitle="getItemSubtitle(item)"
              :active="isItemSelected(item)"
              :color="isItemSelected(item) ? 'primary' : undefined"
              @click="toggleSelection(item)"
            >
              <template #prepend>
                <v-checkbox
                  :model-value="isItemSelected(item)"
                  color="primary"
                  hide-details
                />
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="selectionDialog.show = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="confirmSelection"
          >
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import type { 
  Profile, 
  Props, 
  Inbound,
  Outbound,
  WireguardEndpoint,
  RouteRule,
  RuleSet,
  DNSRule,
  DNSServer
} from './types'
import { profileTagOptions } from './types'
import RouteEditor from '@/components/routeEditor/routeEditor.vue'
import DNSEditor from '@/components/dnsEditor/dnsEditor.vue'

// Props
const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
})

// Emits
const emit = defineEmits<{
  save: [profile: Profile]
  cancel: []
}>()

// Store
const userStore = useUserStore()

// Reactive data
const saving = ref(false)
const loadingEntities = ref(false)
const formData = ref<Profile>({
  name: '',
  tags: [],
  inbounds: [],
  outbounds: [],
  route_final: undefined,
  wg_endpoints: [],
  rules: [],
  rule_sets: [],
  dns_rules: [],
  dns: []
})

// Embedded editor states
const inboundsState = ref<any[]>([])
const routeState = ref<any>({ final: undefined, auto_detect_interface: true, rule_set: [], rules: [] })
const dnsState = ref<any>({ servers: [], rules: [] })

// Available entities - loaded from API
const availableInbounds = ref<Inbound[]>([])
const availableOutbounds = ref<Outbound[]>([])
const availableWgEndpoints = ref<WireguardEndpoint[]>([])
const availableRules = ref<RouteRule[]>([])
const availableRuleSets = ref<RuleSet[]>([])
const availableDnsRules = ref<DNSRule[]>([])
const availableDnsServers = ref<DNSServer[]>([])

// Selection dialog
const selectionDialog = ref({
  show: false,
  type: '' as keyof Profile,
  title: '',
  search: '',
  selectedItems: [] as any[]
})

// Computed
const isEditing = computed(() => props.mode === 'edit')

const selectedInbounds = computed(() => 
  availableInbounds.value.filter(item => formData.value.inbounds.includes(item.id))
)

const selectedOutbounds = computed(() => 
  availableOutbounds.value.filter(item => formData.value.outbounds.includes(item.id))
)

const selectedWgEndpoints = computed(() => 
  availableWgEndpoints.value.filter(item => formData.value.wg_endpoints.includes(item.id))
)

const selectedRules = computed(() => 
  availableRules.value.filter(item => formData.value.rules.includes(item.id))
)

const selectedRuleSets = computed(() => 
  availableRuleSets.value.filter(item => formData.value.rule_sets.includes(item.id))
)

const selectedDnsRules = computed(() => 
  availableDnsRules.value.filter(item => formData.value.dns_rules.includes(item.id))
)

const selectedDnsServers = computed(() => 
  availableDnsServers.value.filter(item => formData.value.dns.includes(item.id))
)

const selectedTagValues = computed({
  get: () => formData.value.tags,
  set: (value: any[]) => {
    // Convert objects back to strings if needed
    formData.value.tags = value.map(item => 
      typeof item === 'object' && item.value ? item.value : item
    )
  }
})

const currentSelectionItems = computed(() => {
  switch (selectionDialog.value.type) {
    case 'inbounds': return availableInbounds.value
    case 'outbounds': return availableOutbounds.value
    case 'wg_endpoints': return availableWgEndpoints.value
    case 'rules': return availableRules.value
    case 'rule_sets': return availableRuleSets.value
    case 'dns_rules': return availableDnsRules.value
    case 'dns': return availableDnsServers.value
    default: return []
  }
})

const filteredSelectionItems = computed(() => {
  if (!selectionDialog.value.search) return currentSelectionItems.value
  
  const search = selectionDialog.value.search.toLowerCase()
  return currentSelectionItems.value.filter(item => 
    getItemTitle(item).toLowerCase().includes(search) ||
    getItemSubtitle(item).toLowerCase().includes(search)
  )
})

// Methods
const openSelectionDialog = (type: keyof Profile) => {
  const titles: Record<string, string> = {
    inbounds: 'Inbounds',
    outbounds: 'Outbounds', 
    wg_endpoints: 'WireGuard Endpoints',
    rules: 'Route Rules',
    rule_sets: 'Rule Sets',
    dns_rules: 'DNS Rules',
    dns: 'DNS Servers'
  }
  
  selectionDialog.value = {
    show: true,
    type,
    title: titles[type] || '',
    search: '',
    selectedItems: [...(formData.value[type] as number[])]
  }
}

const getItemTitle = (item: any): string => {
  if ('name' in item) return item.name
  if ('type' in item) return item.type
  return `Item ${item.id}`
}

const getItemSubtitle = (item: any): string => {
  if ('address' in item && item.address) {
    return `${item.address}${item.port ? `:${item.port}` : ''}`
  }
  if ('region' in item && item.region) return item.region
  if ('action' in item && item.action) return item.action
  if ('type' in item && item.type) return item.type
  return ''
}

const isItemSelected = (item: any): boolean => {
  return selectionDialog.value.selectedItems.includes(item.id)
}

const toggleSelection = (item: any) => {
  const index = selectionDialog.value.selectedItems.indexOf(item.id)
  if (index > -1) {
    selectionDialog.value.selectedItems.splice(index, 1)
  } else {
    selectionDialog.value.selectedItems.push(item.id)
  }
}

const confirmSelection = () => {
  const field = selectionDialog.value.type as keyof Profile
  ;(formData.value[field] as number[]) = [...selectionDialog.value.selectedItems]
  selectionDialog.value.show = false
}

const removeInbound = (id: number) => {
  formData.value.inbounds = formData.value.inbounds.filter(i => i !== id)
}

const removeOutbound = (id: number) => {
  formData.value.outbounds = formData.value.outbounds.filter(i => i !== id)
}

const removeWgEndpoint = (id: number) => {
  formData.value.wg_endpoints = formData.value.wg_endpoints.filter(i => i !== id)
}

const removeRule = (id: number) => {
  formData.value.rules = formData.value.rules.filter(i => i !== id)
}

const removeRuleSet = (id: number) => {
  formData.value.rule_sets = formData.value.rule_sets.filter(i => i !== id)
}

const removeDnsRule = (id: number) => {
  formData.value.dns_rules = formData.value.dns_rules.filter(i => i !== id)
}

const removeDnsServer = (id: number) => {
  formData.value.dns = formData.value.dns.filter(i => i !== id)
}

const saveProfile = async () => {
  if (!formData.value.name.trim()) {
    return
  }
  
  saving.value = true
  
  try {
    const method = props.mode === 'edit' ? 'PUT' : 'POST'
    const url = props.mode === 'edit' && formData.value.id 
      ? `/api/profiles/${formData.value.id}` 
      : '/api/profiles'
    
    // Build Sing-Box-like payload: include all top-level fields.
    // outbounds and route.rule_set are ID arrays; other sections initialized for delegation to dedicated editors.
    const payload: any = {
      name: formData.value.name,
      tags: formData.value.tags,
      log: { level: 'info', timestamp: true },
      dns: dnsState.value,
      ntp: {},
      certificate: {},
      inbounds: inboundsState.value,
      outbounds: formData.value.outbounds,
      route: routeState.value,
      services: [],
      experimental: { cache_file: { enabled: true, store_fakeip: true, store_rdrc: false } },
    }

    const response = await userStore.authorizedFetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    
    if (response.ok) {
      const savedProfile = await response.json()
      emit('save', savedProfile)
    } else {
      const errorText = await response.text()
      console.error('Error saving profile:', errorText)
      // In real app, show error message to user
    }
  } catch (error) {
    console.error('Error saving profile:', error)
    // In real app, show error message to user
  } finally {
    saving.value = false
  }
}

// Load available entities from API
const loadAvailableEntities = async () => {
  loadingEntities.value = true
  
  try {
    const [
      inboundsRes,
      outboundsRes,
      endpointsRes,
      rulesRes,
      ruleSetsRes,
      dnsRulesRes,
      dnsServersRes
    ] = await Promise.all([
      userStore.authorizedFetch('/api/inbounds'),
      userStore.authorizedFetch('/api/outbounds'),
      userStore.authorizedFetch('/api/endpoints'),
      userStore.authorizedFetch('/api/route_rules'),
      userStore.authorizedFetch('/api/rule_sets'),
      userStore.authorizedFetch('/api/dns_rules'),
      userStore.authorizedFetch('/api/dns_servers')
    ])
    
    if (inboundsRes.ok) {
      availableInbounds.value = await inboundsRes.json()
    }
    if (outboundsRes.ok) {
      availableOutbounds.value = await outboundsRes.json()
    }
    if (endpointsRes.ok) {
      availableWgEndpoints.value = await endpointsRes.json()
    }
    if (rulesRes.ok) {
      availableRules.value = await rulesRes.json()
    }
    if (ruleSetsRes.ok) {
      availableRuleSets.value = await ruleSetsRes.json()
    }
    if (dnsRulesRes.ok) {
      availableDnsRules.value = await dnsRulesRes.json()
    }
    if (dnsServersRes.ok) {
      availableDnsServers.value = await dnsServersRes.json()
    }
  } catch (error) {
    console.error('Error loading available entities:', error)
  } finally {
    loadingEntities.value = false
  }
}

// Initialize form data
watch(
  () => props.profile,
  (newProfile) => {
    if (newProfile) {
      formData.value = { ...newProfile }
      // Initialize embedded states if present on profile payload
      if ((newProfile as any).inbounds && Array.isArray((newProfile as any).inbounds)) {
        inboundsState.value = JSON.parse(JSON.stringify((newProfile as any).inbounds))
      }
      if ((newProfile as any).route) {
        routeState.value = JSON.parse(JSON.stringify((newProfile as any).route))
      }
      if ((newProfile as any).dns) {
        dnsState.value = JSON.parse(JSON.stringify((newProfile as any).dns))
      }
    } else {
      formData.value = {
        name: '',
        tags: [],
        inbounds: [],
        outbounds: [],
        route_final: undefined,
        wg_endpoints: [],
        rules: [],
        rule_sets: [],
        dns_rules: [],
        dns: []
      }
      inboundsState.value = []
      routeState.value = { final: undefined, auto_detect_interface: true, rule_set: [], rules: [] }
      dnsState.value = { servers: [], rules: [] }
    }
  },
  { immediate: true }
)

// Inline inbound helpers
const addInbound = () => {
  inboundsState.value.push({ type: 'mixed', address: '', port: undefined })
}

const removeInboundAt = (idx: number) => {
  inboundsState.value.splice(idx, 1)
}

// Load available entities on mount
onMounted(() => {
  loadAvailableEntities()
})
</script>

<style lang="scss" scoped>
@use './index.scss';
</style>
