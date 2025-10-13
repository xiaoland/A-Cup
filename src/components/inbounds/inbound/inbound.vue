<template>
  <Editor
    v-model="form"
    title="Inbound"
    :start-editable="isNew"
    :show-delete="true"
    @save="onSave"
    @delete="$emit('delete')"
  >
    <v-row dense>
      <v-col cols="12" md="6">
        <v-select :items="types" v-model="form.type" label="Type" />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field v-model="form.tag" label="Tag" />
      </v-col>
    </v-row>

    <MixedInboundForm v-if="form.type === 'mixed'" :form="form as MixedInbound" @update:form="updateForm" />
    <TunInboundForm v-else-if="form.type === 'tun'" :form="form as TunInbound" @update:form="updateForm" />
  </Editor>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Editor from '../../common/Editor.vue'
import MixedInboundForm from './mixedInboundForm.vue'
import TunInboundForm from './tunInboundForm.vue'
import { InboundSchema, type Inbound, type MixedInbound, type TunInbound } from './schema'

const props = defineProps<{ form: Inbound }>()
const emit = defineEmits<{ (e: 'save', v: Inbound): void; (e: 'delete'): void }>()

const form = ref<Inbound>(props.form)
const types = ['mixed', 'tun']
const isNew = computed(() => form.value.id == null)

const updateForm = (updatedForm: MixedInbound | TunInbound) => {
  form.value = updatedForm as Inbound
}

const onSave = (savedForm: Inbound) => {
  const schema = savedForm.type === 'mixed' ? 'MixedInboundSchema' : 'TunInboundSchema'
  const parsed = InboundSchema.safeParse(savedForm)
  if (!parsed.success) {
    alert(parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('\n'))
    return
  }
  emit('save', savedForm)
}
</script>

<style scoped>
</style>