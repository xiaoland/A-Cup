<template>
  <div :style="{ width: '100%', height }" ref="container"></div>
  <div v-if="errorMessage" class="text-error text-caption mt-1">{{ errorMessage }}</div>
  <v-progress-linear v-if="loading" indeterminate color="primary" class="mt-2" />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'

 type Monaco = typeof import('monaco-editor/esm/vs/editor/editor.api')

const props = withDefaults(defineProps<{
  modelValue: any
  height?: string
  readOnly?: boolean
  schemaUrl?: string
  schemaRefPath?: string
}>(), {
  height: '400px',
  readOnly: false,
  schemaUrl: undefined,
  schemaRefPath: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [val: any]
  'valid': [ok: boolean]
}>()

const container = ref<HTMLDivElement | null>(null)
let monaco: Monaco | null = null
let editorInstance: import('monaco-editor').editor.IStandaloneCodeEditor | null = null
const loading = ref(false)
const errorMessage = ref('')

const toText = (val: any) => {
  try { return JSON.stringify(val ?? {}, null, 2) } catch { return '' }
}

const parseText = (text: string) => {
  try { return { value: JSON.parse(text), ok: true } } catch { return { value: props.modelValue, ok: false } }
}

async function loadSchemaObject(): Promise<any | undefined> {
  if (!props.schemaUrl) return undefined
  try {
    const res = await fetch(props.schemaUrl)
    const schema = await res.json()
    // Try to pick a sub-schema for inbound if a ref path is provided; otherwise attempt common locations
    const tryPaths = [props.schemaRefPath, '#/$defs/Inbound', '#/$defs/inbound', '#/definitions/Inbound', '#/definitions/inbound'].filter(Boolean) as string[]
    for (const p of tryPaths) {
      const path = p.replace(/^#\//, '').split('/')
      let cur: any = schema
      let ok = true
      for (const k of path) {
        if (cur && typeof cur === 'object' && k in cur) cur = cur[k]; else { ok = false; break }
      }
      if (ok && cur && typeof cur === 'object') return cur
    }
    return schema
  } catch (_) {
    return undefined
  }
}

async function init() {
  if (!container.value) return
  loading.value = true
  try {
    const [{ editor: MonacoEditor, languages, Uri }, EditorWorker, JsonWorker] = await Promise.all([
      import('monaco-editor/esm/vs/editor/editor.api'),
      import('monaco-editor/esm/vs/editor/editor.worker?worker'),
      import('monaco-editor/esm/vs/language/json/json.worker?worker'),
    ])
    // @ts-ignore - expose workers
    self.MonacoEnvironment = {
      getWorker(_: string, label: string) {
        if (label === 'json') return new JsonWorker.default()
        return new EditorWorker.default()
      }
    }
    monaco = { editor: MonacoEditor, languages, Uri } as Monaco
    const schemaObject = await loadSchemaObject()

    // Configure JSON language features
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      allowComments: false,
      enableSchemaRequest: false,
      validate: true,
      schemas: schemaObject ? [{
        uri: 'inmemory://model/inbound.schema.json',
        fileMatch: ['*'],
        schema: schemaObject,
      }] : [],
    })

    const initialValue = toText(props.modelValue)
    const model = monaco.editor.createModel(initialValue, 'json', monaco.Uri.parse('inmemory://model/inbound.json'))

    editorInstance = monaco.editor.create(container.value, {
      model,
      readOnly: props.readOnly,
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      tabSize: 2,
      formatOnPaste: true,
      formatOnType: true,
    })

    // Emit validity on content change
    const sub = editorInstance.onDidChangeModelContent(() => {
      const text = editorInstance!.getValue()
      const { value, ok } = parseText(text)
      errorMessage.value = ok ? '' : 'Invalid JSON'
      emit('valid', ok)
      if (ok) emit('update:modelValue', value)
    })

    // Dispose listener with editor
    editorInstance.onDidDispose(() => { sub.dispose() })
  } finally {
    loading.value = false
  }
}

watch(() => props.modelValue, (v) => {
  if (editorInstance && monaco) {
    const current = editorInstance.getValue()
    const next = toText(v)
    if (current !== next) editorInstance.setValue(next)
  }
})

onMounted(() => { init() })
onBeforeUnmount(() => { editorInstance?.dispose(); monaco = null })
</script>

<style scoped>
.text-error { color: #b00020; }
</style>
