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
              <label for="name">Name</label>
              <InputText id="name" v-model="form.name" />
            </div>
            <div class="field col-span-1">
              <label for="type">Type</label>
              <Select
                id="type"
                v-model="form.type"
                :options="typeOptions"
                option-label="title"
                option-value="value"
                @change="onTypeChange"
              />
            </div>
            <div class="field col-span-1">
              <label for="region">Region</label>
              <Select
                id="region"
                v-model="form.region"
                :options="regionOptions"
                option-label="title"
                option-value="value"
                placeholder="Select a region"
                show-clear
              />
            </div>
            <div class="field col-span-1">
              <label for="provider">Provider</label>
              <InputText id="provider" v-model="form.provider" />
            </div>
          </div>
          <div class="md:col-span-2" v-if="form.type === 'shadowsocks' || form.type === 'vmess' || form.type === 'vless' || form.type === 'hysteria2'">
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
          <div v-if="form.type === 'shadowsocks'">
            <ShadowsocksOutboundForm :form="form" />
          </div>
          <div v-else-if="form.type === 'vmess'">
            <VmessOutboundForm :form="form" />
          </div>
          <div v-else-if="form.type === 'vless'">
            <VlessOutboundForm :form="form" />
          </div>
          <div v-else-if="form.type === 'hysteria2'">
            <Hysteria2OutboundForm :form="form" />
          </div>
          <div v-else-if="form.type === 'selector'">
            <SelectorOutboundForm :form="form" />
          </div>
          <div v-else-if="form.type === 'urltest'">
            <UrlTestOutboundForm :form="form" />
          </div>
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
import { ref } from 'vue'
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

const onTypeChange = () => {
  // Reset the form when the type changes
  form.value = { type: form.value.type, name: form.value.name } as any
}

const onSave = async () => {
  saving.value = true
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
    if (props.form.id) {
      await outboundStore.updateOutbound(props.form.id, validatedData)
    } else {
      await outboundStore.createOutbound(validatedData)
    }
    emit('saved', validatedData)
  } catch (error) {
    console.error(error)
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