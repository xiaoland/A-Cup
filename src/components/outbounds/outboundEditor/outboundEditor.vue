<template>
  <div class="outbound-editor">
    <Card>
      <template #title>
        <div class="text-2xl font-bold">Outbound Editor</div>
      </template>
      <template #content>
        <form @submit.prevent="onSave">
          <div class="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="field col-span-1">
              <label :for="`name-${uniqueId}`">Name</label>
              <InputText :id="`name-${uniqueId}`" v-model="form.name" />
              <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
            </div>
            <div class="field col-span-1">
              <label :for="`type-${uniqueId}`">Type</label>
              <Select
                :id="`type-${uniqueId}`"
                v-model="form.type"
                :options="typeOptions"
                option-label="title"
                option-value="value"
                @change="onTypeChange"
              />
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
          </div>
          <Accordion :multiple="true" :active-index="[0]">
            <AccordionPanel value="credential" header="Credential">
              <div v-if="form.type === 'shadowsocks'">
                <ShadowsocksOutboundForm :form="form as any" />
              </div>
              <div v-else-if="form.type === 'vmess'">
                <VmessOutboundForm :form="form as any" />
              </div>
              <div v-else-if="form.type === 'vless'">
                <VlessOutboundForm :form="form as any" />
              </div>
              <div v-else-if="form.type === 'hysteria2'">
                <Hysteria2OutboundForm :form="form as any" />
              </div>
              <div v-else-if="form.type === 'selector'">
                <SelectorOutboundForm :form="form as any" />
              </div>
              <div v-else-if="form.type === 'urltest'">
                <UrlTestOutboundForm :form="form as any" />
              </div>
            </AccordionPanel>
            <AccordionPanel value="advanced" header="Advanced" v-if="form.type === 'shadowsocks' || form.type === 'vmess' || form.type === 'vless' || form.type === 'hysteria2'">
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
        </form>
      </template>
    </Card>
    <div class="flex justify-end gap-2 mt-4">
      <Button label="Cancel" severity="secondary" @click="onCancel" />
      <Button label="Save" @click="onSave" :loading="saving" />
      <Button v-if="showDelete" label="Delete" severity="danger" @click="onDelete" :loading="deleting" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { z } from 'zod'
import { useOutboundStore } from '@/stores/outbound'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import JSONEditor from '@/components/common/JSONEditor.vue'
import { typeOptions, regionOptions } from './types'
import type { Outbound } from '@/types/outbound'
import ShadowsocksOutboundForm from '@/components/outbounds/forms/shadowsocks/shadowsocksOutboundForm.vue'
import VmessOutboundForm from '@/components/outbounds/forms/vmess/vmessOutboundForm.vue'
import VlessOutboundForm from '@/components/outbounds/forms/vless/vlessOutboundForm.vue'
import Hysteria2OutboundForm from '@/components/outbounds/forms/hysteria2/hysteria2OutboundForm.vue'
import SelectorOutboundForm from '@/components/outbounds/forms/selector/selectorOutboundForm.vue'
import UrlTestOutboundForm from '@/components/outbounds/forms/urltest/urltestOutboundForm.vue'
import {
  ShadowsocksOutboundSchema,
  VmessOutboundSchema,
  VlessOutboundSchema,
  Hysteria2OutboundSchema,
  SelectorOutboundSchema,
  UrlTestOutboundSchema,
} from '@/schemas/outbound'

const props = withDefaults(defineProps<{ form: Outbound; showDelete?: boolean }>(), { showDelete: false })
const emit = defineEmits<{ (e: 'saved', value: Outbound): void; (e: 'cancel'): void; (e: 'deleted', id: number): void }>()

const outboundStore = useOutboundStore()
const saving = ref(false)
const deleting = ref(false)
const form = ref(props.form)
const errors = ref<Record<string, string>>({})
const uniqueId = computed(() => Math.random().toString(36).substring(7))

const getDefaultOutbound = (type: string) => {
  const base = { name: '', tag: '', type }
  switch (type) {
    case 'shadowsocks':
      return { ...base, server: '', server_port: 443, method: '2022-blake3-aes-128-gcm', password: '' }
    case 'vmess':
      return { ...base, server: '', server_port: 443, uuid: '', security: 'auto' }
    case 'vless':
      return { ...base, server: '', server_port: 443, uuid: '' }
    case 'hysteria2':
      return { ...base, server: '', server_port: 443, password: '' }
    case 'selector':
      return { ...base, outbounds: [], default: '' }
    case 'urltest':
      return { ...base, outbounds: [], url: '', interval: '' }
    default:
      return base
  }
}

const onTypeChange = () => {
  form.value = getDefaultOutbound(form.value.type) as any
}

const onSave = async () => {
  saving.value = true
  errors.value = {}
  try {
    let validatedData
    switch (form.value.type) {
      case 'shadowsocks':
        validatedData = ShadowsocksOutboundSchema.parse(form.value)
        break
      case 'vmess':
        validatedData = VmessOutboundSchema.parse(form.value)
        break
      case 'vless':
        validatedData = VlessOutboundSchema.parse(form.value)
        break
      case 'hysteria2':
        validatedData = Hysteria2OutboundSchema.parse(form.value)
        break
      case 'selector':
        validatedData = SelectorOutboundSchema.parse(form.value)
        break
      case 'urltest':
        validatedData = UrlTestOutboundSchema.parse(form.value)
        break
      default:
        throw new Error('Invalid outbound type')
    }

    validatedData.tag = validatedData.name
    let savedOutbound
    if (props.form.id) {
      savedOutbound = await outboundStore.updateOutbound(props.form.id, validatedData)
    } else {
      savedOutbound = await outboundStore.createOutbound(validatedData)
    }
    if (savedOutbound) {
      emit('saved', savedOutbound)
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.value = error.issues.reduce((acc: Record<string, string>, curr) => {
        const path = curr.path[0]
        if (typeof path === 'string') {
          acc[path] = curr.message
        }
        return acc
      }, {})
    } else {
      console.error(error)
    }
  } finally {
    saving.value = false
  }
}

const onCancel = () => {
  emit('cancel')
}

const onDelete = async () => {
  if (!props.form.id) return
  deleting.value = true
  try {
    await outboundStore.deleteOutbound(props.form.id)
    emit('deleted', props.form.id as number)
  } catch (error) {
    console.error(error)
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>