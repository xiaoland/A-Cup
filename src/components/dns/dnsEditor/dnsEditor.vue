<template>
  <div>
    <!-- TODO: Refactor this component to use PrimeVue -->
  </div>
</template>

<script setup lang="ts">
// import { ref, watch, computed } from 'vue'
// import { type Dns, dnsSchema } from '@/schemas/dns'
// import Editor from '@/components/common/Editor.vue'
// import dnsServerEditor from '../dnsServerEditor.vue'
// import dnsRuleEditor from '../dnsRuleEditor/dnsRuleEditor.vue'
// import outboundsSelector from '@/components/outbounds/outboundsSelector/outboundsSelector.vue'

// const props = defineProps<{
//   modelValue?: Dns
// }>()

// const emit = defineEmits<{
//   (e: 'update:modelValue', value: Dns): void
// }>()

// const dns = ref(props.modelValue || dnsSchema.parse({ servers: [] }))
// const tab = ref('servers')

// const serverTags = computed(() => dns.value.servers.map((s) => s.tag))

// const addServer = () => {
//   dns.value.servers.push(dnsSchema.shape.servers.element.parse({ tag: 'new-server', address: '' }))
// }

// const removeServer = (index: number) => {
//   dns.value.servers.splice(index, 1)
// }

// const addRule = () => {
//   if (!dns.value.rules) {
//     dns.value.rules = []
//   }
//   dns.value.rules.push(dnsSchema.shape.rules.unwrap().element.parse({ server: '' }))
// }

// const removeRule = (index: number) => {
//   dns.value.rules?.splice(index, 1)
// }

// watch(
//   dns,
//   (value) => {
//     emit('update:modelValue', value)
//   },
//   { deep: true }
// )
</script>