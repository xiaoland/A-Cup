<script setup lang="ts">
import { z } from 'zod';
import { DirectOutboundSchema } from '../../../../schemas/singbox';

type DirectOutboundModel = z.infer<typeof DirectOutboundSchema>;

defineProps<{
  modelValue: DirectOutboundModel;
}>();
</script>

<template>
  <div class="flex flex-col gap-4 p-4 bg-surface-50 rounded-lg border border-surface-200">
    <div class="flex items-center gap-3">
      <i class="pi pi-info-circle text-primary text-lg"></i>
      <div>
        <p class="font-medium text-sm m-0">No Additional Configuration Required</p>
        <small class="text-surface-600">
          The direct outbound uses all requests without any proxy or modification.
        </small>
      </div>
    </div>
  </div>
</template>
