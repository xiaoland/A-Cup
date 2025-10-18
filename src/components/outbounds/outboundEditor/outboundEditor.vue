<template>
  <div class="outbound-editor">
    <Card>
      <template #title>
        <div class="text-2xl font-bold">Outbound Editor</div>
      </template>
      <template #content>
        <form @submit.prevent="() => onEditorSave(form)">
          <template v-if="form.type === 'selector'">
            <SelectorOutboundForm :form="form" />
          </template>
          <template v-else-if="form.type === 'urltest'">
            <UrltestOutboundForm :form="form" />
          </template>
          <template v-else>
            <div class="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="field col-span-1">
                <label :for="`type-${uniqueId}`">Type</label>
                <Select
                  :id="`type-${uniqueId}`"
                  v-model="form.type"
                  :options="typeOptions"
                  option-label="title"
                  option-value="value"
                />
              </div>
              <div class="field col-span-1">
                <label :for="`name-${uniqueId}`">Name</label>
                <InputText :id="`name-${uniqueId}`" v-model="form.name" />
              </div>
              <div class="field col-span-1">
                <label :for="`region-${uniqueId}`">Region</label>
                <Select
                  :id="`region-${uniqueId}`"
                  v-model="form.region"
                  :options="regionOptions"
                  option-label="title"
                  option-value="value"
                  placeholder="Select a region"
                  show-clear
                />
              </div>
              <div class="field col-span-1">
                <label :for="`provider-${uniqueId}`">Provider</label>
                <InputText :id="`provider-${uniqueId}`" v-model="form.provider" />
              </div>
              <div class="field md:col-span-2 grid grid-cols-3 gap-4">
                <div class="field col-span-2">
                    <label :for="`server-${uniqueId}`">Server</label>
                    <InputText :id="`server-${uniqueId}`" v-model="form.server" />
                </div>
                 <div class="field col-span-1">
                    <label :for="`server_port-${uniqueId}`">Port</label>
                    <InputNumber :id="`server_port-${uniqueId}`" v-model="form.server_port" />
                </div>
              </div>

              <div class="md:col-span-2">
                <Accordion :active-index="0">
                  <AccordionPanel value="credential" header="Credential">
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
                      <div>No credential fields for this type.</div>
                    </template>
                  </AccordionPanel>
                </Accordion>
              </div>

              <div class="md:col-span-2">
                <Accordion>
                  <AccordionPanel value="advanced" header="Advanced">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div class="field">
                        <label>Transport (JSON)</label>
                        <JSONEditor v-model="form.transport" :rows="6" />
                      </div>
                      <div class="field">
                        <label>TLS (JSON)</label>
                        <JSONEditor v-model="form.tls" :rows="6" />
                      </div>
                      <div class="field">
                        <label>Mux (JSON)</label>
                        <JSONEditor v-model="form.mux" :rows="6" />
                      </div>
                      <div class="field">
                        <label>Other (JSON)</label>
                        <JSONEditor v-model="form.other" :rows="6" />
                      </div>
                    </div>
                  </AccordionPanel>
                </Accordion>
              </div>
            </div>
          </template>
        </form>
      </template>
    </Card>
    <div class="flex justify-end gap-2 mt-4">
      <Button label="Cancel" severity="secondary" @click="onCancel" />
      <Button label="Save" @click="onEditorSave(form)" :loading="saving" />
       <Button v-if="showDelete" label="Delete" severity="danger" @click="onDelete" :loading="deleting" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import JSONEditor from '@/components/common/JSONEditor.vue'
import type { Outbound } from './types'
import { typeOptions, regionOptions } from './types'
import VmessOutboundForm from './vmessOutboundForm.vue'
import VlessOutboundForm from './vlessOutboundForm.vue'
import ShadowsocksOutboundForm from './shadowsocksOutboundForm.vue'
import Hysteria2OutboundForm from './hysteria2OutboundForm.vue'
import SelectorOutboundForm from './selectorOutboundForm.vue'
import UrltestOutboundForm from './urltestOutboundForm.vue'

const props = withDefaults(defineProps<{ form: Outbound; showDelete?: boolean }>(), { showDelete: false })
const emit = defineEmits<{ (e: 'saved', value: Outbound): void; (e: 'cancel'): void; (e: 'deleted', id: number): void }>()

const router = useRouter()
const userStore = useUserStore()

const saving = ref(false)
const deleting = ref(false)
const uniqueId = computed(() => props.form.name || Math.random().toString(36).substring(7))

// Ensure nested credential object exists for bindings
const form = props.form
const ensureCredential = () => {
  const m: any = form
  if (!m || typeof m !== 'object') return true
  if (!m.credential || typeof m.credential !== 'object') m.credential = {}
  if (m.type === 'hysteria2') {
    if (!m.credential.obfs || typeof m.credential.obfs !== 'object') m.credential.obfs = {}
  }
  // Ensure outbounds array exists for selector and urltest types
  if ((m.type === 'selector' || m.type === 'urltest') && !Array.isArray(m.outbounds)) {
    m.outbounds = []
  }
  return true
}
ensureCredential();

// Watch for type changes to ensure outbounds array is properly initialized
watch(() => form.type, (newType) => {
  if (newType === 'selector' || newType === 'urltest') {
    if (!Array.isArray((form as any).outbounds)) {
      (form as any).outbounds = []
    }
  }
}, { immediate: true })

const onCancel = () => {
  emit('cancel')
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
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

const onDelete = () => {
  if (!props.form.id) return
  deleting.value = true;
  emit('deleted', props.form.id as number)
}
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>