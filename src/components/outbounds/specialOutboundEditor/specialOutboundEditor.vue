<template>
  <div class="outbound-editor">
    <Card>
      <template #title>
        <div class="text-2xl font-bold">Special Outbound Editor</div>
      </template>
      <template #content>
        <form @submit.prevent="onSave">
          <div class="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="field col-span-1">
              <label :for="`tag-${uniqueId}`">Tag</label>
              <InputText :id="`tag-${uniqueId}`" v-model="form.tag" />
              <small v-if="errors.tag" class="p-error">{{ errors.tag }}</small>
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
          </div>
          <Accordion :multiple="true" :value="['credential']">
            <AccordionPanel value="credential" header="Credential">
              <div v-if="form.type === 'selector'">
                <SelectorOutboundForm :form="form as any" />
              </div>
              <div v-else-if="form.type === 'urltest'">
                <UrlTestOutboundForm :form="form as any" />
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
import Card from 'primevue/card'
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import { typeOptions } from './types'
import type { SpecialOutbound } from '@/types/outbound'
import SelectorOutboundForm from '@/components/outbounds/forms/selector/selectorOutboundForm.vue'
import UrlTestOutboundForm from '@/components/outbounds/forms/urltest/urltestOutboundForm.vue'
import { SpecialOutboundSchema } from '@/schemas/outbound'

const props = withDefaults(defineProps<{ form: SpecialOutbound; showDelete?: boolean }>(), {
  showDelete: false,
})
const emit = defineEmits<{
  (e: 'saved', value: SpecialOutbound): void
  (e: 'cancel'): void
  (e: 'deleted'): void
}>()

const saving = ref(false)
const deleting = ref(false)
const form = ref(props.form)
const errors = ref<Record<string, string>>({})
const uniqueId = computed(() => Math.random().toString(36).substring(7))

const getDefaultOutbound = (type: string) => {
  const base = { tag: '', type }
  switch (type) {
    case 'selector':
      return { ...base, outbounds: [], default: '' }
    case 'urltest':
      return { ...base, outbounds: [], url: '', interval: '' }
    case 'direct':
      return { ...base }
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
    const validatedData = SpecialOutboundSchema.parse(form.value)
    emit('saved', validatedData)
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

const onDelete = () => {
  emit('deleted')
}
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>