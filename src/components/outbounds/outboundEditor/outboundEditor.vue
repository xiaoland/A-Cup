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
      <template #default>
        <!-- Ensure credential structure exists for nested bindings -->
        <span v-if="ensureCredential()" style="display:none" />
        <v-form @submit.prevent="() => onEditorSave(form)">
          <template v-if="form.type === 'selector'">
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
                <OutboundsSelector v-model="(form as any).outbounds" />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="(form as any).default"
                  :items="getDefaultOptions((form as any).outbounds)"
                  item-title="title"
                  item-value="value"
                  label="Default (optional)"
                  clearable
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12">
                <v-switch inset v-model="(form as any).interrupt_exist_connections" label="Interrupt existing connections" />
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
                <OutboundsSelector v-model="(form as any).outbounds" />
              </v-col>
              <v-col cols="12" md="4">
                <v-switch inset v-model="(form as any).interrupt_exist_connections" label="Interrupt existing connections" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="(form as any).url" label="Test URL (optional)" variant="outlined" />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field v-model="(form as any).interval" label="Interval (e.g. 3m)" variant="outlined" />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field type="number" v-model.number="(form as any).tolerance" label="Tolerance (ms)" variant="outlined" />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="(form as any).idle_timeout" label="Idle Timeout (e.g. 30m)" variant="outlined" />
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
                        <ShadowsocksOutboundForm :form="form" />
                      </template>
                      <template v-else-if="form.type === 'vmess'">
                        <VmessOutboundForm :form="form" />
                      </template>
                      <template v-else-if="form.type === 'vless'">
                        <VlessOutboundForm :form="form" />
                      </template>
                      <template v-else-if="form.type === 'hysteria2'">
                        <Hysteria2OutboundForm :form="form" />
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
import VmessOutboundForm from './vmessOutboundForm.vue'
import VlessOutboundForm from './vlessOutboundForm.vue'
import ShadowsocksOutboundForm from './shadowsocksOutboundForm.vue'
import Hysteria2OutboundForm from './hysteria2OutboundForm.vue'

const props = defineProps<{ form: Outbound }>()
const emit = defineEmits<{ (e: 'saved', value: Outbound): void; (e: 'cancel'): void; (e: 'deleted', id: number): void }>()

const router = useRouter()
const userStore = useUserStore()

const saving = ref(false)
const deleting = ref(false)

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
const getDefaultOptions = (ids?: number[]) =>
  allOutbounds.value
    .filter((o: any) => Array.isArray(ids) && ids.includes(o.id))
    .map((o: any) => ({ title: o.name || `#${o.id}`, value: o.id }))

// Credential constants moved to individual form components
onMounted(() => { /* nested fields will be created via v-model usages as needed */ })

// Ensure nested credential object exists for bindings
const form = props.form
const ensureCredential = () => {
  const m: any = form
  if (!m || typeof m !== 'object') return true
  if (!m.credential || typeof m.credential !== 'object') m.credential = {}
  if (m.type === 'hysteria2') {
    if (!m.credential.obfs || typeof m.credential.obfs !== 'object') m.credential.obfs = {}
  }
  return true
}

const onCancel = () => {
  emit('cancel')
  router.back()
}

const onEditorSave = async (value: any) => {
  // Special handling: selector/urltest emit only, no backend save
  if (value?.type === 'selector') {
    const obj: any = {
      type: 'selector',
      outbounds: value.outbounds ?? [],
      interrupt_exist_connections: !!value.interrupt_exist_connections,
    }
    if (value.default) obj.default = value.default
    emit('saved', obj as any)
    router.push('/outbounds')
    return
  }
  if (value?.type === 'urltest') {
    const obj: any = {
      type: 'urltest',
      outbounds: value.outbounds ?? [],
      url: value.url || undefined,
      interval: value.interval || undefined,
      tolerance: value.tolerance || undefined,
      idle_timeout: value.idle_timeout || undefined,
      interrupt_exist_connections: !!value.interrupt_exist_connections,
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