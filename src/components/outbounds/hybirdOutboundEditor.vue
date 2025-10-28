<script setup lang="ts">
import { ref, watch } from 'vue';
import type { SingBoxOutbound } from '../../../schemas/singbox';
import { SingBoxOutboundSchema } from '../../../schemas/singbox';
import type { Outbound } from '../../../schemas/outbound';
import { exportOutboundToSingBox } from '../../../schemas/outbound';
import OutboundPicker from './outboundPicker.vue';
import DialFieldsEditor from '../common/DialFieldsEditor.vue';
import JSONEditor from '../common/JSONEditor.vue';
import { z } from 'zod';
import { useOutboundStore } from '@/stores/outbound';

const props = withDefaults(defineProps<{
  modelValue: SingBoxOutbound;
}>(), {
  modelValue: () => ({} as SingBoxOutbound),
});

const emit = defineEmits(['update:modelValue']);
const outboundStore = useOutboundStore();
const selectedOutboundId = ref<number | undefined>(parseInt(props.modelValue?.tag));

watch(selectedOutboundId, (newId) => {
  if (!newId) {
    emit("update:modelValue", {});
  }
  else {
    const outbound = outboundStore.outbounds.find(o => o.id === newId);
    if (outbound) {
      emit("update:modelValue", exportOutboundToSingBox(outbound));
    }
  }
});

</script>

<template>
  <div>
    <OutboundPicker v-model="selectedOutboundId" />

    <JSONEditor height="300" :modelValue="modelValue" @update:modelValue="emit('update:modelValue', $event)" class="mt-4" />

    <DialFieldsEditor :modelValue="modelValue" @update:modelValue="emit('update:modelValue', $event)" class="mt-4" />
  </div>
</template>
