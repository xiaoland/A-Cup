<template>
  <div class="flex items-center gap-2">
    <div class="flex-grow">
      <Select
        v-model="selected"
        :options="outboundStore.outbounds"
        :multiple="multiple"
        option-label="name"
        :option-value="valueAs === 'id' ? 'id' : 'name'"
        placeholder="Select Outbound(s)"
        class="w-full"
        @update:modelValue="onSelection"
      />
    </div>
    <Button icon="pi pi-plus" @click="showCreateDialog = true" />
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
})

const emit = defineEmits(['update:modelValue'])

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

onMounted(async () => {
  await outboundStore.fetchOutbounds()
  updateSelected(props.modelValue)
})

const onOutboundCreated = (newOutbound: Outbound) => {
  if (newOutbound.id) {
    if (props.multiple) {
      const currentVal = Array.isArray(selected.value) ? selected.value : []
      onSelection([...currentVal, newOutbound.id])
    } else {
      onSelection(newOutbound.id)
    }
  }
  showCreateDialog.value = false
}

const onSelection = (value: any) => {
  emit('update:modelValue', value)
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