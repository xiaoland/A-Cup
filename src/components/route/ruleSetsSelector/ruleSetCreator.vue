<template>
  <v-form @submit.prevent="submit">
    <v-text-field
      v-model="form.name"
      label="Name"
      :error-messages="extract('name')"
    />
    <v-select
      v-model="form.type"
      label="Type"
      :items="['remote', 'inline']"
      :error-messages="extract('type')"
    />
    <v-select
      v-model="form.format"
      label="Format"
      :items="['source', 'binary']"
      :error-messages="extract('format')"
    />
    <v-textarea
      v-model="form.content"
      label="Content"
      :error-messages="extract('content')"
      rows="5"
    />

    <v-card-actions class="justify-end">
      <v-btn variant="text" @click="onCancel">Cancel</v-btn>
      <v-btn color="primary" type="submit" :loading="isSubmitting">Save</v-btn>
    </v-card-actions>
  </v-form>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import type { RuleSet } from './types'

const props = defineProps<{
  onCancel: () => void
  onSave: (values: Omit<RuleSet, 'id'>) => Promise<void>
}>()

const schema = z.object({
  name: z.string().min(1),
  type: z.enum(['remote', 'inline']),
  format: z.enum(['source', 'binary']),
  content: z.string().min(1),
})

const { handleSubmit, isSubmitting, setErrors } = useForm({
  validationSchema: toTypedSchema(schema),
})

const form = ref<Omit<RuleSet, 'id'>>({
  name: '',
  type: 'inline',
  format: 'source',
  content: ''
})

const submit = handleSubmit(async (values) => {
  try {
    await props.onSave(values)
  } catch (error: any) {
    if (error.data?.errors) {
      setErrors(error.data.errors)
    }
  }
})

const extract = (field: keyof typeof form.value) => {
  const { errors } = useForm()
  return errors.value[field]
}
</script>