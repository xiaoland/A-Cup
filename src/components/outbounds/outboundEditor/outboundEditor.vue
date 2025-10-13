<template>
  <v-container class="py-4">
    <Editor
      :model-value="form"
      title="Outbound Editor"
      :start-editable="true"
      :show-delete="!!form.id"
      @cancel="onCancel"
      @save="onEditorSave"
      @delete="onDelete"
    >
      <template #default="{ model }">
        <v-form @submit.prevent="() => onEditorSave(model)">
          <template v-if="model.type === 'selector'">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="model.type"
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
          <template v-else-if="model.type === 'urltest'">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="model.type"
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
                  v-model="model.type"
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
                          <v-text-field v-model="model.name" label="Name" variant="outlined" required />
                        </v-col>
                        <v-col cols="12" md="4">
                          <v-select
                            v-model="model.region"
                            :items="regionOptions"
                            item-title="title"
                            item-value="value"
                            label="Region"
                            variant="outlined"
                            clearable
                          />
                        </v-col>
                        <v-col cols="12" md="4">
                          <v-text-field v-model="model.provider" label="Provider" variant="outlined" />
                        </v-col>
                      </v-row>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-col>

              <v-col cols="12" md="8">
                <v-text-field v-model="model.server" label="Server" variant="outlined" required />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model.number="model.server_port" label="Port" type="number" variant="outlined" required />
              </v-col>

              <!-- Credential (default expanded) -->
              <v-col cols="12">
                <v-expansion-panels variant="accordion" :model-value="[0]">
                  <v-expansion-panel>
                    <v-expansion-panel-title>Credential</v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <template v-if="model.type === 'shadowsocks'">
                        <v-row>
                          <v-col cols="12" md="6">
                            <v-select :items="ssMethods" v-model="model.credential.method" label="Method" variant="outlined" />
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-text-field v-model="model.credential.password" label="Password" variant="outlined" type="password" />
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-text-field v-model="model.credential.plugin" label="Plugin (optional)" variant="outlined" />
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-text-field v-model="model.credential.plugin_opts" label="Plugin Opts (optional)" variant="outlined" />
                          </v-col>
                        </v-row>
                      </template>
                      <template v-else-if="model.type === 'vmess'">
                        <v-row>
                          <v-col cols="12" md="6">
                            <v-text-field v-model="model.credential.uuid" label="UUID" variant="outlined" />
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-select :items="vmessSecurities" v-model="model.credential.security" label="Security" variant="outlined" />
                          </v-col>
                          <v-col cols="12" md="4">
                            <v-text-field type="number" v-model.number="model.credential.alter_id" label="Alter ID" variant="outlined" />
                          </v-col>
                          <v-col cols="12" md="4">
                            <v-switch inset v-model="model.credential.global_padding" label="Global Padding" />
                          </v-col>
                          <v-col cols="12" md="4">
                            <v-switch inset v-model="model.credential.authenticated_length" label="Authenticated Length" />
                          </v-col>
                        </v-row>
                      </template>
                      <template v-else-if="model.type === 'vless'">
                        <v-row>
                          <v-col cols="12" md="6">
                            <v-text-field v-model="model.credential.uuid" label="UUID" variant="outlined" />
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-select :items="vlessFlows" v-model="model.credential.flow" label="Flow (optional)" variant="outlined" clearable />
                          </v-col>
                        </v-row>
                      </template>
                      <template v-else-if="model.type === 'hysteria2'">
                        <v-row>
                          <v-col cols="12" md="6">
                            <v-text-field v-model="model.credential.password" label="Password" variant="outlined" type="password" />
                          </v-col>
                          <v-col cols="12" md="3">
                            <v-text-field type="number" v-model.number="model.credential.up_mbps" label="Up Mbps" variant="outlined" />
                          </v-col>
                          <v-col cols="12" md="3">
                            <v-text-field type="number" v-model.number="model.credential.down_mbps" label="Down Mbps" variant="outlined" />
                          </v-col>
                          <v-col cols="12" md="4">
                            <v-select :items="hy2ObfsTypes" v-model="model.credential.obfs.type" label="Obfs Type" variant="outlined" clearable />
                          </v-col>
                          <v-col cols="12" md="8">
                            <v-text-field v-model="model.credential.obfs.password" label="Obfs Password" variant="outlined" />
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
                          <JSONEditor v-model="model.transport" label="Transport (JSON)" :rows="6" />
                        </v-col>
                        <v-col cols="12" md="6">
                          <JSONEditor v-model="model.tls" label="TLS (JSON)" :rows="6" />
                        </v-col>
                        <v-col cols="12" md="6">
                          <JSONEditor v-model="model.mux" label="Mux (JSON)" :rows="6" />
                        </v-col>
                        <v-col cols="12" md="6">
                          <JSONEditor v-model="model.other" label="Other (JSON)" :rows="6" />
                        </v-col>
                      </v-row>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-col>
            </v-row>
          </template>
        </v-form>
      </template>
    </Editor>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { Outbound } from './types'
import { typeOptions, regionOptions } from './types'
import OutboundsSelector from '@/components/outbounds/common/OutboundsSelector.vue'
import JSONEditor from '@/components/common/JSONEditor.vue'
import Editor from '@/components/common/Editor.vue'

const props = defineProps<{ form: Outbound }>()
const emit = defineEmits<{ (e: 'saved', value: Outbound): void; (e: 'cancel'): void; (e: 'deleted', id: number): void }>()

const router = useRouter()
const userStore = useUserStore()

const saving = ref(false)
const deleting = ref(false)
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
onMounted(() => { /* nested fields will be created via v-model usages as needed */ })

const onCancel = () => {
  emit('cancel')
  router.back()
}

const onEditorSave = async (value: any) => {
  // Special handling: selector/urltest emit only, no backend save
  if (value?.type === 'selector') {
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
  if (value?.type === 'urltest') {
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
    const body = { ...value }
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
  if (!props.form.id) return
  deleting.value = true
  try {
    const res = await userStore.authorizedFetch(`/api/outbounds/${props.form.id}`, { method: 'DELETE' })
    if (!res.ok && res.status !== 204) throw new Error(`Delete failed: ${res.status}`)
    emit('deleted', props.form.id as number)
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