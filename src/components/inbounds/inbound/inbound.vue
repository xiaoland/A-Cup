<template>
  <div class="p-fluid form-grid">
    <div class="field col-span-6">
      <label for="type">Type</label>
      <Select
        id="type"
        v-model="editableForm.type"
        :options="types"
        placeholder="Select a type"
      />
    </div>
    <div class="field col-span-6">
      <label for="tag">Tag</label>
      <InputText
        id="tag"
        v-model="editableForm.tag"
        :invalid="tagErrors.length > 0"
      />
      <small v-if="tagErrors.length > 0" class="p-error">{{ tagErrors[0] }}</small>
    </div>

    <div class="col-span-12">
      <MixedInboundForm v-if="editableForm.type === 'mixed'" v-model:form="editableForm" />
      <TunInboundForm v-else-if="editableForm.type === 'tun'" v-model:form="editableForm" />
    </div>
  </div>

  <div class="flex justify-end gap-2 mt-4">
    <Button
        label="Delete"
        severity="danger"
        icon="i-mdi-delete"
        @click="onDelete"
        v-if="form.tag"
    />
    <Button label="Cancel" severity="secondary" @click="$emit('cancel')" />
    <Button label="Save" @click="onSave" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import MixedInboundForm from './mixedInboundForm.vue'
import TunInboundForm from './tunInboundForm.vue'
import { InboundSchema, type Inbound } from './schema'
import { z } from 'zod'

const props = defineProps<{ form: Inbound; allTags: string[] }>()
const emit = defineEmits<{
  (e: 'save', v: Inbound): void
  (e: 'delete', tag: string): void
  (e: 'cancel'): void
}>()

const editableForm = ref<Inbound>(JSON.parse(JSON.stringify(props.form)))
const types = ref(['mixed', 'tun'])
const tagErrors = ref<string[]>([])

const validationSchema = InboundSchema.superRefine((data, ctx) => {
  if (!data.tag) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['tag'],
      message: 'Tag is required',
    });
    return;
  }
  if (props.allTags.includes(data.tag)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['tag'],
      message: 'Tag should not be duplicate',
    })
  }
})

const validate = () => {
  const result = validationSchema.safeParse(editableForm.value)
  if (result.success) {
    tagErrors.value = []
    return true
  } else {
    tagErrors.value = result.error.flatten().fieldErrors.tag ?? []
    return false
  }
}

watch(() => editableForm.value.tag, () => {
  validate()
})

const onSave = () => {
  if (validate()) {
    emit('save', editableForm.value)
  }
}

const onDelete = () => {
  if (props.form.tag) {
    emit('delete', props.form.tag)
  }
}
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 1rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.col-span-6 {
  grid-column: span 6 / span 6;
}
.col-span-12 {
  grid-column: span 12 / span 12;
}
</style>