<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { z } from 'zod';
import { SelectorOutboundSchema, UrlTestOutboundSchema, DirectOutboundSchema, SingBoxOutboundSchema, type SingBoxOutbound } from '../../../schemas/singbox';
import Dropdown from 'primevue/dropdown';
import SelectorForm from './outboundEditor/selectorForm.vue';
import UrltestForm from './outboundEditor/urltestForm.vue';
import DirectForm from './outboundEditor/directForm.vue';
import InputText from 'primevue/inputtext';

type SpecialOutboundModel = z.infer<typeof SelectorOutboundSchema> | z.infer<typeof UrlTestOutboundSchema> | z.infer<typeof DirectOutboundSchema>;

const props = defineProps<{
  modelValue?: SingBoxOutbound;
}>();

const emit = defineEmits(['update:modelValue']);

const localOutbound = ref<SingBoxOutbound | undefined>();

watch(() => props.modelValue, (newValue) => {
    localOutbound.value = newValue;
}, { deep: true, immediate: true });

onMounted(() => {
    if (!localOutbound.value) {
        localOutbound.value = {
            type: 'selector',
            tag: 'new-special-outbound',
            outbounds: [],
        }
    }
})

watch(localOutbound, (newValue) => {
  emit('update:modelValue', newValue);
}, { deep: true });

const outboundTypes = [
    { label: 'Selector', value: 'selector' },
    { label: 'URLTest', value: 'urltest' },
    { label: 'Direct', value: 'direct' },
];

watch(() => localOutbound.value?.type, (newType, oldType) => {
  if (!newType || newType === oldType) return;

  switch (newType) {
    case 'selector':
      localOutbound.value = SelectorOutboundSchema.parse({ type: 'selector', tag: localOutbound.value?.tag });
      break;
    case 'urltest':
      localOutbound.value = UrlTestOutboundSchema.parse({ type: 'urltest', tag: localOutbound.value?.tag });
      break;
    case 'direct':
      localOutbound.value = DirectOutboundSchema.parse({ type: 'direct', tag: localOutbound.value?.tag });
      break;
  }
});

</script>

<template>
    <div v-if="localOutbound">
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label for="tag">Tag</label>
                <InputText id="tag" v-model="localOutbound.tag" class="w-full" />
            </div>
            <div>
                <label for="type">Type</label>
                <Dropdown id="type" v-model="localOutbound.type" :options="outboundTypes" optionLabel="label" optionValue="value" class="w-full" />
            </div>
        </div>
        <div class="mt-4">
            <SelectorForm v-if="localOutbound.type === 'selector'" v-model="localOutbound" />
            <UrltestForm v-if="localOutbound.type === 'urltest'" v-model="localOutbound" />
            <DirectForm v-if="localOutbound.type === 'direct'" v-model="localOutbound" />
        </div>
    </div>
</template>
