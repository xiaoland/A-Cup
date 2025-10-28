<script setup lang="ts">
import { z } from 'zod';
import { UrlTestOutboundSchema } from '../../../../schemas/singbox';
import Chips from 'primevue/chips';
import InputText from 'primevue/inputtext';

type UrlTestOutboundModel = z.infer<typeof UrlTestOutboundSchema>;

defineProps<{
  modelValue: UrlTestOutboundModel;
}>();

</script>

<template>
    <div>
        <div class="field">
            <label for="outbounds">Outbounds</label>
            <Chips id="outbounds" :modelValue="modelValue.outbounds" @update:modelValue="$emit('update:modelValue', { ...modelValue, outbounds: $event })" />
        </div>
        <div class="field">
            <label for="url">URL</label>
            <InputText id="url" :modelValue="modelValue.url" @update:modelValue="$emit('update:modelValue', { ...modelValue, url: $event })" />
        </div>
        <div class="field">
            <label for="interval">Interval</label>
            <InputText id="interval" :modelValue="modelValue.interval" @update:modelValue="$emit('update:modelValue', { ...modelValue, interval: $event })" />
        </div>
    </div>
</template>
