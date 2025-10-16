<template>
  <Editor
    v-model="editableForm"
    :title="`Inbound: ${form.tag}`"
    :show-delete="true"
    @delete="form.tag && $emit('delete', form.tag)"
    @save="onSave"
    @cancel="resetForm"
    :start-editable="!form.tag"
  >
    <v-row dense>
      <v-col cols="12" md="6">
        <v-select :items="types" v-model="editableForm.type" label="Type" />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="editableForm.tag"
          label="Tag"
          :error-messages="tagErrors"
        />
      </v-col>
    </v-row>

    <MixedInboundForm v-if="editableForm.type === 'mixed'" :form="editableForm as MixedInbound" @update:form="onFormUpdate" />
    <TunInboundForm v-else-if="editableForm.type === 'tun'" :form="editableForm as TunInbound" @update:form="onFormUpdate" />
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

const editableForm = ref<Inbound>(JSON.parse(JSON.stringify(props.form)))
const types = ['mixed', 'tun']
const tagErrors = ref<string[]>([])

const validationSchema = InboundSchema.superRefine((data, ctx) => {
  if (data.tag && props.allTags.filter((t: string) => t !== props.form.tag).includes(data.tag)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['tag'],
      message: 'Tag should not be duplicate',
    });
  }
});

const validateTag = () => {
  const result = validationSchema.safeParse(editableForm.value);
  if (result.success) {
    tagErrors.value = [];
    return true;
  } else {
    tagErrors.value = result.error.flatten().fieldErrors.tag ?? [];
    return false;
  }
};

watch(() => editableForm.value.tag, () => {
  validateTag();
}, { deep: true });

watch(
  () => props.form,
  (newValue) => {
    resetForm();
  },
  { deep: true }
)

const onFormUpdate = (updatedForm: Inbound) => {
  editableForm.value = updatedForm;
}

const onSave = () => {
  if (validateTag()) {
    emit('update:form', editableForm.value);
  }
}

const resetForm = () => {
  editableForm.value = JSON.parse(JSON.stringify(props.form));
}
</script>

<style scoped>
</style>