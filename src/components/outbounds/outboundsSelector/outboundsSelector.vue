<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-2">
      <div class="flex-grow">
        <Select
          v-model="selected"
          :options="availableOutbounds"
          :multiple="multiple"
          option-label="name"
          :option-value="valueAs === 'id' ? 'id' : 'name'"
          placeholder="Select Outbound(s)"
          class="w-full"
        />
      </div>
      <Button icon="i-mdi-plus" @click="showCreateDialog = true" text />
    </div>
    <div class="flex justify-end gap-2">
      <Button label="Cancel" severity="secondary" @click="$emit('cancel')" />
      <Button label="Confirm" @click="onConfirm" />
    </div>
    <Dialog v-model:visible="showCreateDialog" modal header="Create New Outbound" :style="{ width: '50vw' }">
      <OutboundEditor :form="emptyOutbound" @saved="onOutboundCreated" @cancel="showCreateDialog = false" />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useOutboundStore } from '@/stores/outbound'
import type { Outbound } from '@/types/outbound'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import OutboundEditor from '@/components/outbounds/outboundEditor/outboundEditor.vue'

const props = defineProps({
  modelValue: {
    type: [String, Array, Number, Array] as import('vue').PropType<string | string[] | number | number[]>,
    default: '',
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  valueAs: {
    type: String as () => 'id' | 'tag',
    default: 'tag',
  },
  mask: {
    type: Array as () => number[],
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const outboundStore = useOutboundStore()
const selected = ref<any>(props.multiple ? [] : null)
const showCreateDialog = ref(false)
const emptyOutbound = computed((): Outbound => ({
  name: '',
  type: 'vmess',
  tag: '',
  server: '',
  server_port: 443,
  uuid: '',
  security: 'auto',
}))

const availableOutbounds = computed(() => {
  return outboundStore.outbounds.filter(o => !props.mask.includes(o.id!))
})

onMounted(async () => {
  await outboundStore.fetchOutbounds()
  updateSelected(props.modelValue)
})

const onOutboundCreated = (newOutbound: Outbound) => {
  if (newOutbound.id) {
    if (props.multiple) {
      const currentVal = Array.isArray(selected.value) ? selected.value : []
      selected.value = [...currentVal, newOutbound.id]
    } else {
      selected.value = newOutbound.id
    }
  }
  showCreateDialog.value = false
}

const onConfirm = () => {
  emit('confirm', selected.value)
}

const updateSelected = (modelValue: any) => {
  selected.value = modelValue
}

watch(() => props.modelValue, (newValue) => {
  updateSelected(newValue)
}, { immediate: true, deep: true })

watch(() => outboundStore.outbounds, () => {
  updateSelected(props.modelValue)
})
</script>

<style scoped></style>