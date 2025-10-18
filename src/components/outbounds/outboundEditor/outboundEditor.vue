<template>
  <div>
    <!-- TODO: Refactor this component to use PrimeVue -->
  </div>
</template>

<script setup lang="ts">
// import { ref, onMounted, computed, watch } from 'vue'
// import { useRouter } from 'vue-router'
// import { useUserStore } from '@/stores/user'
// import type { Outbound } from './types'
// import { typeOptions, regionOptions } from './types'
// import OutboundsSelector from '@/components/outbounds/common/OutboundsSelector.vue'
// import JSONEditor from '@/components/common/JSONEditor.vue'
// import Editor from '@/components/common/Editor.vue'
// import VmessOutboundForm from './vmessOutboundForm.vue'
// import VlessOutboundForm from './vlessOutboundForm.vue'
// import ShadowsocksOutboundForm from './shadowsocksOutboundForm.vue'
// import Hysteria2OutboundForm from './hysteria2OutboundForm.vue'
// import SelectorOutboundForm from './selectorOutboundForm.vue'
// import UrltestOutboundForm from './urltestOutboundForm.vue'

// const props = withDefaults(defineProps<{ form: Outbound, showDelete?: boolean }>(), { showDelete: false })
// const emit = defineEmits<{ (e: 'saved', value: Outbound): void; (e: 'cancel'): void; (e: 'deleted', id: number): void }>()

// const router = useRouter()
// const userStore = useUserStore()

// const saving = ref(false)
// const deleting = ref(false)

// // for default options, fetch all outbounds for name lookup
// const allOutbounds = ref<any[]>([])
// const loadAllOutbounds = async () => {
//   try {
//     const res = await userStore.authorizedFetch('/api/outbounds')
//     if (res.ok) {
//       const data = await res.json()
//       if (Array.isArray(data)) allOutbounds.value = data
//     }
//   } catch (e) { console.error(e) }
// }
// onMounted(loadAllOutbounds)
// const getDefaultOptions = (ids?: number[]) =>
//   allOutbounds.value
//     .filter((o: any) => Array.isArray(ids) && ids.length > 0 && ids.includes(o.id))
//     .map((o: any) => ({ title: o.name || `#${o.id}`, value: o.id }))

// // Credential constants moved to individual form components
// onMounted(() => { /* nested fields will be created via v-model usages as needed */ })

// // Ensure nested credential object exists for bindings
// const form = props.form
// const ensureCredential = () => {
//   const m: any = form
//   if (!m || typeof m !== 'object') return true
//   if (!m.credential || typeof m.credential !== 'object') m.credential = {}
//   if (m.type === 'hysteria2') {
//     if (!m.credential.obfs || typeof m.credential.obfs !== 'object') m.credential.obfs = {}
//   }
//   // Ensure outbounds array exists for selector and urltest types
//   if ((m.type === 'selector' || m.type === 'urltest') && !Array.isArray(m.outbounds)) {
//     m.outbounds = []
//   }
//   return true
// }

// // Watch for type changes to ensure outbounds array is properly initialized
// watch(() => form.type, (newType) => {
//   if (newType === 'selector' || newType === 'urltest') {
//     if (!Array.isArray((form as any).outbounds)) {
//       (form as any).outbounds = []
//     }
//   }
// }, { immediate: true })

// const onCancel = () => {
//   emit('cancel')
// }

// const onEditorSave = async (value: any) => {
//   // Special handling: selector/urltest emit only, no backend save
//   if (value?.type === 'selector') {
//     const obj: any = {
//       type: 'selector',
//       outbounds: value.outbounds ?? [],
//       interrupt_exist_connections: !!value.interrupt_exist_connections,
//     }
//     if (value.default) obj.default = value.default
//     emit('saved', obj as any)
//     router.push('/outbounds')
//     return
//   }
//   if (value?.type === 'urltest') {
//     const obj: any = {
//       type: 'urltest',
//       outbounds: value.outbounds ?? [],
//       url: value.url || undefined,
//       interval: value.interval || undefined,
//       tolerance: value.tolerance || undefined,
//       idle_timeout: value.idle_timeout || undefined,
//       interrupt_exist_connections: !!value.interrupt_exist_connections,
//     }
//     emit('saved', obj as any)
//     router.push('/outbounds')
//     return
//   }
//   saving.value = true
//   try {
//     const body = { ...value }
//     const hasId = !!body.id
//     const url = hasId ? `/api/outbounds/${body.id}` : '/api/outbounds'
//     const method = hasId ? 'PUT' : 'POST'
//     const res = await userStore.authorizedFetch(url, {
//       method,
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(body)
//     })
//     if (!res.ok) throw new Error(`Save failed: ${res.status}`)
//     const saved = await res.json()
//     emit('saved', saved)
//   } catch (e) {
//     console.error(e)
//   } finally {
//     saving.value = false
//   }
// }

// const onDelete = () => {
//   if (!props.form.id) return
//   emit('deleted', props.form.id as number)
// }
</script>

<style scoped>
</style>