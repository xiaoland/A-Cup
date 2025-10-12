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
            <v-textarea
              v-model="formJsonText"
              label="Outbound JSON"
              variant="outlined"
              rows="18"
              :error-messages="formJsonError || undefined"
            />
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
                        <v-textarea
                          v-model="transportText"
                          label="Transport (JSON)"
                          variant="outlined"
                          rows="6"
                          :error-messages="transportError || undefined"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-textarea
                          v-model="tlsText"
                          label="TLS (JSON)"
                          variant="outlined"
                          rows="6"
                          :error-messages="tlsError || undefined"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-textarea
                          v-model="muxText"
                          label="Mux (JSON)"
                          variant="outlined"
                          rows="6"
                          :error-messages="muxError || undefined"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-textarea
                          v-model="otherText"
                          label="Other (JSON)"
                          variant="outlined"
                          rows="6"
                          :error-messages="otherError || undefined"
                        />
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
import { ref, onMounted, watchEffect, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { Outbound } from './types'
import { typeOptions, regionOptions } from './types'

const props = defineProps<{ form: Outbound }>()
const emit = defineEmits<{ (e: 'saved', value: Outbound): void; (e: 'cancel'): void; (e: 'deleted', id: number): void }>()

const router = useRouter()
const userStore = useUserStore()

const form = props.form

const saving = ref(false)
const deleting = ref(false)
const editMode = ref<'ui' | 'json'>('ui')
const formJsonText = ref('')
const formJsonError = ref('')

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
import { computed } from 'vue'
const transportText = ref<string>('')
const transportError = ref<string>('')
const tlsText = ref<string>('')
const tlsError = ref<string>('')
const muxText = ref<string>('')
const muxError = ref<string>('')
const otherText = ref<string>('')
const otherError = ref<string>('')

const syncFromObject = () => {
  if (!form.credential || typeof form.credential !== 'object') form.credential = {}
  try { transportText.value = JSON.stringify(form.transport ?? {}, null, 2); transportError.value = '' } catch { transportText.value = '{}' }
  try { tlsText.value = JSON.stringify(form.tls ?? {}, null, 2); tlsError.value = '' } catch { tlsText.value = '{}' }
  try { muxText.value = JSON.stringify(form.mux ?? {}, null, 2); muxError.value = '' } catch { muxText.value = '{}' }
  try { otherText.value = JSON.stringify(form.other ?? {}, null, 2); otherError.value = '' } catch { otherText.value = '{}' }
}
const parseAdvanced = () => {
  let ok = true
  try { form.transport = transportText.value ? JSON.parse(transportText.value) : {}; transportError.value = '' } catch { transportError.value = 'Invalid JSON'; ok = false }
  try { form.tls = tlsText.value ? JSON.parse(tlsText.value) : {}; tlsError.value = '' } catch { tlsError.value = 'Invalid JSON'; ok = false }
  try { form.mux = muxText.value ? JSON.parse(muxText.value) : {}; muxError.value = '' } catch { muxError.value = 'Invalid JSON'; ok = false }
  try { form.other = otherText.value ? JSON.parse(otherText.value) : {}; otherError.value = 'Invalid JSON'; ok = false } catch { otherError.value = 'Invalid JSON'; ok = false }
  return ok
}
onMounted(syncFromObject)

// ensure nested objects for hysteria2 obfs when editing
watchEffect(() => {
  if (form.type === 'hysteria2') {
    if (!form.credential) form.credential = {}
    if (form.credential && typeof form.credential === 'object' && !('obfs' in form.credential)) {
      ;(form.credential as any).obfs = {}
    }
  }
})

watch(editMode, (mode) => {
  if (mode === 'json') {
    try {
      formJsonText.value = JSON.stringify(form, null, 2)
      formJsonError.value = ''
    } catch {
      formJsonText.value = '{}'
    }
  } else {
    // switching to UI: try applying JSON back
    try {
      const parsed = JSON.parse(formJsonText.value || '{}')
      Object.assign(form, parsed)
      formJsonError.value = ''
      syncFromObject()
    } catch (e) {
      formJsonError.value = 'Invalid JSON'
      editMode.value = 'json'
    }
  }
})

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
  if (!parseAdvanced()) return
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