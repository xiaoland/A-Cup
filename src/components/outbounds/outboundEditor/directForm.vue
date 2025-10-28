<script setup lang="ts">
import { z } from 'zod';
import { DirectOutboundSchema } from '../../../../schemas/singbox';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';

type DirectOutboundModel = z.infer<typeof DirectOutboundSchema>;

defineProps<{
  modelValue: DirectOutboundModel;
}>();
</script>

<template>
    <div>
        <p>No options for direct outbound.</p>
    </div>
</template>
