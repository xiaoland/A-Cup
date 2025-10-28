<script setup lang="ts">
import { z } from 'zod';
import { SelectorOutboundSchema } from '../../../../schemas/singbox';
import Chips from 'primevue/chips';
import InputText from 'primevue/inputtext';

type SelectorOutboundModel = z.infer<typeof SelectorOutboundSchema>;

defineProps<{
  modelValue: SelectorOutboundModel;
}>();

</script>

<template>
    <div>
        <div class="field">
            <label for="outbounds">Outbounds</label>
            <Chips id="outbounds" :modelValue="modelValue.outbounds" @update:modelValue="$emit('update:modelValue', { ...modelValue, outbounds: $event })" />
        </div>
        <div class="field">
            <label for="default">Default</label>
            <InputText id="default" :modelValue="modelValue.default" @update:modelValue="$emit('update:modelValue', { ...modelValue, default: $event })" />
        </div>
    </div>
</template>
