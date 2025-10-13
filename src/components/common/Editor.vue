<template>
  <v-card variant="outlined" class="editor">
    <v-toolbar density="comfortable" color="transparent" :elevation="0">
      <template #prepend>
        <v-btn
          v-if="showDelete"
          icon="mdi-delete"
          color="error"
          variant="text"
          @click="onDelete"
        />
      </template>
      <v-toolbar-title class="text-subtitle-1">{{ title }}</v-toolbar-title>
      <template #append>
        <div class="d-flex align-center gap-2">
          <v-btn
            v-if="!isEditing"
            variant="text"
            prepend-icon="mdi-pencil"
            @click="enterEdit"
          >Edit</v-btn>

          <v-btn-toggle
            v-else
            v-model="editView"
            density="comfortable"
            divided
            color="primary"
            class="mr-1"
          >
            <v-btn value="form" size="small">Form</v-btn>
            <v-btn value="json" size="small">JSON</v-btn>
          </v-btn-toggle>
        </div>
      </template>
    </v-toolbar>

    <v-divider />

    <v-card-text>
      <!-- Editable -->
      <template v-if="isEditing">
        <div v-if="editView === 'form'">
          <slot />
        </div>
        <div v-else>
          <JSONEditor v-model="value" :rows="jsonRows" />
        </div>
      </template>

      <!-- Readonly -->
      <template v-else>
        <slot name="readonly">
          <pre class="readonly-json">{{ pretty(modelValue) }}</pre>
        </slot>
      </template>
    </v-card-text>

    <!-- Actions -->
    <v-divider v-if="isEditing" />
    <v-card-actions v-if="isEditing" class="justify-end">
      <v-spacer />
      <v-btn variant="text" @click="onCancel">Cancel</v-btn>
      <v-btn color="primary" @click="onSave">Save</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import JSONEditor from './JSONEditor.vue'

type ViewMode = 'form' | 'json'

const props = withDefaults(defineProps<{
  modelValue: any
  title?: string
  startEditable?: boolean
  showDelete?: boolean
  jsonRows?: number
}>(), {
  title: 'Editor',
  startEditable: false,
  showDelete: false,
  jsonRows: 12,
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: any): void
  (e: 'save', v: any): void
  (e: 'cancel'): void
  (e: 'delete'): void
}>()

const isEditing = ref<boolean>(!!props.startEditable)
const editView = ref<ViewMode>('form')
const value = computed({
  get: () => props.modelValue,
  set: (v: any) => emit('update:modelValue', v)
})

const enterEdit = () => {
  isEditing.value = true
}

const onCancel = () => {
  isEditing.value = false
  emit('cancel')
}

const onSave = () => {
  emit('save', value.value)
  isEditing.value = false
}

const onDelete = () => emit('delete')

const pretty = (v: any) => {
  try { return JSON.stringify(v ?? {}, null, 2) } catch { return '' }
}

const jsonRows = props.jsonRows
</script>

<style scoped>
.editor {
  overflow: hidden;
}
.readonly-json {
  margin: 0;
  white-space: pre-wrap;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
}
</style>
