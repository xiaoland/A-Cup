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
              <div v-if="formData.inbounds.length === 0" class="text-body-2 text-medium-emphasis">
                No inbounds. Click Add to create one.
              </div>
              <v-expansion-panels v-else multiple>
                <v-expansion-panel v-for="(inb, idx) in formData.inbounds" :key="idx">
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

          <OutboundsEditor :form="formData" />


          <!-- Route Editor -->
          <RouteEditor v-model:route="formData.route" />

          

          

          

          <!-- DNS Editor -->
          <DNSEditor :dns="formData.dns" />

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

    
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import type { Profile, Props, Outbound, RuleSet } from './types'
import { profileTagOptions } from './types'
import RouteEditor from '@/components/routeEditor/routeEditor.vue'
import DNSEditor from '@/components/dnsEditor/dnsEditor.vue'
import OutboundsEditor from './outboundsEditor.vue'

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
const formData = ref<any>({
  name: '',
  tags: [],
  inbounds: [],
  outbounds: [],
  route_final: undefined,
  wg_endpoints: [],
  rules: [],
  rule_sets: [],
  dns_rules: [],
  dns: { servers: [], rules: [], fakeip: {} },
  route: { final: undefined, auto_detect_interface: true, rule_set: [], rules: [] }
})

// Embedded editor states removed; bind directly to formData

// Available entities - loaded from API
const availableOutbounds = ref<Outbound[]>([])
const availableRuleSets = ref<RuleSet[]>([])

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

const selectedOutbounds = computed(() => 
  availableOutbounds.value.filter(item => formData.value.outbounds.includes(item.id))
)

const selectedRuleSets = computed(() => 
  availableRuleSets.value.filter(item => formData.value.rule_sets.includes(item.id))
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
    case 'outbounds': return availableOutbounds.value
    case 'rule_sets': return availableRuleSets.value
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
    outbounds: 'Outbounds', 
    rule_sets: 'Rule Sets'
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

const removeOutbound = (id: number) => {
  formData.value.outbounds = formData.value.outbounds.filter((i: number) => i !== id)
}


const removeRuleSet = (id: number) => {
  formData.value.rule_sets = formData.value.rule_sets.filter((i: number) => i !== id)
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
      dns: formData.value.dns,
      ntp: {},
      certificate: {},
      inbounds: formData.value.inbounds,
      outbounds: formData.value.outbounds,
      route: formData.value.route,
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
    const [ outboundsRes, ruleSetsRes ] = await Promise.all([
      userStore.authorizedFetch('/api/outbounds'),
      userStore.authorizedFetch('/api/rule_sets')
    ])
    
    if (outboundsRes.ok) {
      availableOutbounds.value = await outboundsRes.json()
    }
    if (ruleSetsRes.ok) {
      availableRuleSets.value = await ruleSetsRes.json()
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
      const np: any = newProfile
      formData.value = {
        ...formData.value,
        ...np,
        inbounds: Array.isArray(np.inbounds) ? JSON.parse(JSON.stringify(np.inbounds)) : [],
        route: np.route ? JSON.parse(JSON.stringify(np.route)) : { final: undefined, auto_detect_interface: true, rule_set: [], rules: [] },
        dns: np.dns ? JSON.parse(JSON.stringify(np.dns)) : { servers: [], rules: [], fakeip: {} }
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
        dns: { servers: [], rules: [], fakeip: {} },
        route: { final: undefined, auto_detect_interface: true, rule_set: [], rules: [] }
      }
    }
  },
  { immediate: true }
)

// Inline inbound helpers
const addInbound = () => {
  formData.value.inbounds.push({ type: 'mixed', address: '', port: undefined })
}

const removeInboundAt = (idx: number) => {
  formData.value.inbounds.splice(idx, 1)
}

// Load available entities on mount
onMounted(() => {
  loadAvailableEntities()
})
</script>

<style lang="scss" scoped>
@use './index.scss';
</style>
