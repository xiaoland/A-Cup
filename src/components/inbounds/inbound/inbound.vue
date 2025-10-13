<template>
  <Editor
    v-model="form"
    title="Inbound"
    :show-delete="true"
    @delete="$emit('delete', form.tag)"
  >
    <v-row dense>
      <v-col cols="12" md="6">
        <v-select :items="types" v-model="form.type" label="Type" />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="form.tag"
          label="Tag"
          :error-messages="tagErrors"
        />
      </v-col>
    </v-row>

    <MixedInboundForm v-if="form.type === 'mixed'" :form="form as MixedInbound" @update:form="onFormUpdate" />
    <TunInboundForm v-else-if="form.type === 'tun'" :form="form as TunInbound" @update:form="onFormUpdate" />
  </Editor>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Editor from '../../common/Editor.vue'
import MixedInboundForm from './mixedInboundForm.vue'
import TunInboundForm from './tunInboundForm.vue'
import { InboundSchema, type Inbound, type MixedInbound, type TunInbound } from './schema'
import { z } from 'zod'

const props = defineProps<{ form: Inbound, allTags: string[] }>()
const emit = defineEmits<{ (e: 'update:form', v: Inbound): void; (e: 'delete', tag: string): void }>()

const form = ref<Inbound>(props.form)
const types = ['mixed', 'tun']
const tagErrors = ref<string[]>([])

const validationSchema = InboundSchema.superRefine((data, ctx) => {
  if (props.allTags.filter((t: string) => t !== props.form.tag).includes(data.tag)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['tag'],
      message: 'Tag should not be duplicate',
    });
  }
});

const validateTag = () => {
  const result = validationSchema.safeParse(form.value);
  if (result.success) {
    tagErrors.value = [];
  } else {
    tagErrors.value = result.error.flatten().fieldErrors.tag ?? [];
  }
};

watch(
  () => props.form,
  (newValue) => {
    if (JSON.stringify(newValue) !== JSON.stringify(form.value)) {
      form.value = newValue
    }
  },
  { immediate: true, deep: true }
)

watch(form, (newValue) => {
  validateTag();
  emit('update:form', newValue);
}, { deep: true });


const onFormUpdate = (updatedForm: Inbound) => {
  form.value = updatedForm;
}
</script>

<style scoped>
</style>