<template>
  <div class="flex items-center gap-2">
    <div class="flex-grow">
      <MultiSelect
        v-if="multiple"
        v-model="selected"
        :options="options"
        placeholder="Select Outbound(s)"
        class="w-full"
      />
      <Select
        v-else
        v-model="selected"
        :options="options"
        placeholder="Select Outbound"
        class="w-full"
      />
    </div>
    <Button v-if="!availableOutboundTags" icon="i-mdi-plus" @click="$emit('create')" text />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useOutboundStore } from '@/stores/outbound'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'

const props = defineProps({
  modelValue: {
    type: [String, Array] as import('vue').PropType<string | string[]>,
    default: null,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  mask: {
    type: Array as () => (string | number)[],
    default: () => [],
  },
  availableOutboundTags: {
    type: Array as () => string[],
    default: undefined,
  },
})

const emit = defineEmits(['update:modelValue', 'create'])

const outboundStore = useOutboundStore()
const selected = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const options = computed(() => {
  if (props.availableOutboundTags) {
    return props.availableOutboundTags.filter(tag => !props.mask.includes(tag))
  }
  return outboundStore.outbounds
    .filter(o => !props.mask.includes(o.id!))
    .map(o => o.name)
})

onMounted(async () => {
  if (!props.availableOutboundTags) {
    await outboundStore.fetchOutbounds()
  }
})
</script>

<style scoped></style>