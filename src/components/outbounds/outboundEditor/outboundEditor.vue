<template>
  <v-container class="py-4">
    <v-card>
      <v-card-title class="text-h6 d-flex align-center justify-space-between">
        Outbound Editor
        <div class="d-flex align-center" style="gap: 8px">
          <span class="text-caption text-medium-emphasis">Mode</span>
          <v-btn-toggle v-model="editMode" density="compact" mandatory>
            <v-btn value="ui" size="small">UI</v-btn>
            <v-btn value="json" size="small">JSON</v-btn>
          </v-btn-toggle>
        </div>
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="onSave">
          <template v-if="editMode === 'json'">
            <JSONEditor v-model="jsonWhole" label="Outbound JSON" :rows="18" />
          </template>
          <template v-else-if="form.type === 'selector'">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.type"
                  :items="typeOptions"
                  item-title="title"
                  item-value="value"
                  label="Type"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12">
                <OutboundsSelector v-model="selectorConfig.outbounds" />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="selectorConfig.default"
                  :items="selectorDefaultOptions"
                  item-title="title"
                  item-value="value"
                  label="Default (optional)"
                  clearable
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12">
                <v-switch inset v-model="selectorConfig.interrupt_exist_connections" label="Interrupt existing connections" />
              </v-col>
            </v-row>
          </template>
          <template v-else-if="form.type === 'urltest'">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.type"
                  :items="typeOptions"
                  item-title="title"
                  item-value="value"
                  label="Type"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12">
                <OutboundsSelector v-model="urltestConfig.outbounds" />
              </v-col>
              <v-col cols="12" md="4">
                <v-switch inset v-model="urltestConfig.interrupt_exist_connections" label="Interrupt existing connections" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="urltestConfig.url" label="Test URL (optional)" variant="outlined" />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field v-model="urltestConfig.interval" label="Interval (e.g. 3m)" variant="outlined" />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field type="number" v-model.number="urltestConfig.tolerance" label="Tolerance (ms)" variant="outlined" />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="urltestConfig.idle_timeout" label="Idle Timeout (e.g. 30m)" variant="outlined" />
              </v-col>
            </v-row>
          </template>
          <template v-else>
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.type"
                :items="typeOptions"
                item-title="title"
                item-value="value"
                label="Type"
                variant="outlined"
                required
              />
            </v-col>

            <!-- Basic Info (default expanded) -->
            <v-col cols="12">
              <v-expansion-panels variant="accordion" :model-value="[0]">
                <v-expansion-panel>
                  <v-expansion-panel-title>Basic Info</v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-row>
                      <v-col cols="12" md="4">
                        <v-text-field v-model="form.name" label="Name" variant="outlined" required />
                      </v-col>
                      <v-col cols="12" md="4">
                        <v-select
                          v-model="form.region"
                          :items="regionOptions"
                          item-title="title"
                          item-value="value"
                          label="Region"
                          variant="outlined"
                          clearable
                        />
                      </v-col>
                      <v-col cols="12" md="4">
                        <v-text-field v-model="form.provider" label="Provider" variant="outlined" />
                      </v-col>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>

            <v-col cols="12" md="8">
              <v-text-field v-model="form.server" label="Server" variant="outlined" required />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model.number="form.server_port" label="Port" type="number" variant="outlined" required />
            </v-col>

            <!-- Credential (default expanded) -->
            <v-col cols="12">
              <v-expansion-panels variant="accordion" :model-value="[0]">
                <v-expansion-panel>
                  <v-expansion-panel-title>Credential</v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <template v-if="form.type === 'shadowsocks'">
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-select :items="ssMethods" v-model="form.credential.method" label="Method" variant="outlined" />
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field v-model="form.credential.password" label="Password" variant="outlined" type="password" />
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field v-model="form.credential.plugin" label="Plugin (optional)" variant="outlined" />
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field v-model="form.credential.plugin_opts" label="Plugin Opts (optional)" variant="outlined" />
                        </v-col>
                      </v-row>
                    </template>
                    <template v-else-if="form.type === 'vmess'">
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field v-model="form.credential.uuid" label="UUID" variant="outlined" />
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-select :items="vmessSecurities" v-model="form.credential.security" label="Security" variant="outlined" />
                        </v-col>
                        <v-col cols="12" md="4">
                          <v-text-field type="number" v-model.number="form.credential.alter_id" label="Alter ID" variant="outlined" />
                        </v-col>
                        <v-col cols="12" md="4">
                          <v-switch inset v-model="form.credential.global_padding" label="Global Padding" />
                        </v-col>
                        <v-col cols="12" md="4">
                          <v-switch inset v-model="form.credential.authenticated_length" label="Authenticated Length" />
                        </v-col>
                      </v-row>
                    </template>
                    <template v-else-if="form.type === 'vless'">
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field v-model="form.credential.uuid" label="UUID" variant="outlined" />
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-select :items="vlessFlows" v-model="form.credential.flow" label="Flow (optional)" variant="outlined" clearable />
                        </v-col>
                      </v-row>
                    </template>
                    <template v-else-if="form.type === 'hysteria2'">
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field v-model="form.credential.password" label="Password" variant="outlined" type="password" />
                        </v-col>
                        <v-col cols="12" md="3">
                          <v-text-field type="number" v-model.number="form.credential.up_mbps" label="Up Mbps" variant="outlined" />
                        </v-col>
                        <v-col cols="12" md="3">
                          <v-text-field type="number" v-model.number="form.credential.down_mbps" label="Down Mbps" variant="outlined" />
                        </v-col>
                        <v-col cols="12" md="4">
                          <v-select :items="hy2ObfsTypes" v-model="hy2ObfsType" label="Obfs Type" variant="outlined" clearable />
                        </v-col>
                        <v-col cols="12" md="8">
                          <v-text-field v-model="hy2ObfsPassword" label="Obfs Password" variant="outlined" />
                        </v-col>
                      </v-row>
                    </template>
                    <template v-else>
                      <div class="text-medium-emphasis">No credential fields for this type.</div>
                    </template>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>

            <!-- Advanced section -->
            <v-col cols="12">
              <v-expansion-panels variant="accordion">
                <v-expansion-panel>
                  <v-expansion-panel-title>Advanced</v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-row>
                      <v-col cols="12" md="6">
                        <JSONEditor v-model="form.transport" label="Transport (JSON)" :rows="6" />
                      </v-col>
                      <v-col cols="12" md="6">
                        <JSONEditor v-model="form.tls" label="TLS (JSON)" :rows="6" />
                      </v-col>
                      <v-col cols="12" md="6">
                        <JSONEditor v-model="form.mux" label="Mux (JSON)" :rows="6" />
                      </v-col>
                      <v-col cols="12" md="6">
                        <JSONEditor v-model="form.other" label="Other (JSON)" :rows="6" />
                      </v-col>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
          </v-row>
          </template>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="onCancel">Cancel</v-btn>
        <v-btn color="primary" :loading="saving" @click="onSave">Save</v-btn>
        <v-btn
          v-if="form.id"
          color="error"
          variant="outlined"
          :loading="deleting"
          @click="onDelete"
        >Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { Outbound } from './types'
import { typeOptions, regionOptions } from './types'
import OutboundsSelector from '@/components/outbounds/common/OutboundsSelector.vue'
import JSONEditor from '@/components/common/JSONEditor.vue'

const props = defineProps<{ form: Outbound }>()
const emit = defineEmits<{ (e: 'saved', value: Outbound): void; (e: 'cancel'): void; (e: 'deleted', id: number): void }>()

const router = useRouter()
const userStore = useUserStore()

const form = props.form

const saving = ref(false)
const deleting = ref(false)
const editMode = ref<'ui' | 'json'>('ui')
// JSON mode uses JSONEditor bound to this computed
const jsonWhole = computed({
  get: () => form,
  set: (v: any) => { if (v && typeof v === 'object') Object.assign(form, v) }
})
const selectorConfig = ref<{ outbounds: number[]; default: number | null; interrupt_exist_connections: boolean }>({ outbounds: [], default: null, interrupt_exist_connections: false })
const urltestConfig = ref<{ outbounds: number[]; url: string; interval: string; tolerance: number; idle_timeout: string; interrupt_exist_connections: boolean }>({ outbounds: [], url: '', interval: '', tolerance: 0, idle_timeout: '', interrupt_exist_connections: false })

// for default options, fetch all outbounds for name lookup
const allOutbounds = ref<any[]>([])
const loadAllOutbounds = async () => {
  try {
    const res = await userStore.authorizedFetch('/api/outbounds')
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) allOutbounds.value = data
    }
  } catch (e) { console.error(e) }
}
onMounted(loadAllOutbounds)
const selectorDefaultOptions = computed(() =>
  allOutbounds.value
    .filter((o: any) => selectorConfig.value.outbounds.includes(o.id))
    .map((o: any) => ({ title: o.name || `#${o.id}`, value: o.id }))
)

// Credential helpers
const ssMethods = [
  '2022-blake3-aes-128-gcm',
  '2022-blake3-aes-256-gcm',
  '2022-blake3-chacha20-poly1305',
  'none',
  'aes-128-gcm', 'aes-192-gcm', 'aes-256-gcm',
  'chacha20-ietf-poly1305', 'xchacha20-ietf-poly1305',
  'aes-128-ctr','aes-192-ctr','aes-256-ctr','aes-128-cfb','aes-192-cfb','aes-256-cfb','rc4-md5','chacha20-ietf','xchacha20'
]
const vmessSecurities = ['auto','none','zero','aes-128-gcm','chacha20-poly1305']
const vlessFlows = ['xtls-rprx-vision']
const hy2ObfsTypes = ['salamander']
onMounted(() => { if (!form.credential || typeof form.credential !== 'object') form.credential = {} })

// ensure nested objects for hysteria2 obfs when editing
watchEffect(() => {
  if (form.type === 'hysteria2') {
    if (!form.credential) form.credential = {}
    if (form.credential && typeof form.credential === 'object' && !('obfs' in form.credential)) {
      ;(form.credential as any).obfs = {}
    }
  }
})

// JSON mode serialization/deserialization handled by JSONEditor on blur

const hy2ObfsType = computed({
  get: () => (form.credential as any)?.obfs?.type ?? '',
  set: (v: any) => {
    if (!form.credential || typeof form.credential !== 'object') form.credential = {}
    if (!(form.credential as any).obfs) (form.credential as any).obfs = {}
    if (v == null || v === '') delete (form.credential as any).obfs.type
    else (form.credential as any).obfs.type = v
  }
})
const hy2ObfsPassword = computed({
  get: () => (form.credential as any)?.obfs?.password ?? '',
  set: (v: any) => {
    if (!form.credential || typeof form.credential !== 'object') form.credential = {}
    if (!(form.credential as any).obfs) (form.credential as any).obfs = {}
    if (v == null || v === '') delete (form.credential as any).obfs.password
    else (form.credential as any).obfs.password = v
  }
})

const onCancel = () => {
  emit('cancel')
  router.back()
}

const onSave = async () => {
  // Special handling: selector/urltest emit only, no backend save
  if (form.type === 'selector') {
    const obj: any = {
      type: 'selector',
      outbounds: selectorConfig.value.outbounds,
      interrupt_exist_connections: !!selectorConfig.value.interrupt_exist_connections,
    }
    if (selectorConfig.value.default) obj.default = selectorConfig.value.default
    emit('saved', obj as any)
    router.push('/outbounds')
    return
  }
  if (form.type === 'urltest') {
    const obj: any = {
      type: 'urltest',
      outbounds: urltestConfig.value.outbounds,
      url: urltestConfig.value.url || undefined,
      interval: urltestConfig.value.interval || undefined,
      tolerance: urltestConfig.value.tolerance || undefined,
      idle_timeout: urltestConfig.value.idle_timeout || undefined,
      interrupt_exist_connections: !!urltestConfig.value.interrupt_exist_connections,
    }
    emit('saved', obj as any)
    router.push('/outbounds')
    return
  }
  saving.value = true
  try {
    const body = { ...form }
    const hasId = !!body.id
    const url = hasId ? `/api/outbounds/${body.id}` : '/api/outbounds'
    const method = hasId ? 'PUT' : 'POST'
    const res = await userStore.authorizedFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error(`Save failed: ${res.status}`)
    const saved = await res.json()
    emit('saved', saved)
    router.push('/outbounds')
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

const onDelete = async () => {
  if (!form.id) return
  deleting.value = true
  try {
    const res = await userStore.authorizedFetch(`/api/outbounds/${form.id}`, { method: 'DELETE' })
    if (!res.ok && res.status !== 204) throw new Error(`Delete failed: ${res.status}`)
    emit('deleted', form.id)
    router.push('/outbounds')
  } catch (e) {
    console.error(e)
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
</style>