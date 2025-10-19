<template>
  <Card>
    <template #content>
      <div class="flex justify-between items-center">
        <div>
          <div class="font-bold">{{ rule.action }}</div>
          <div class="text-sm text-gray-500">{{ rule.outbound }}</div>
        </div>
        <div>
          <Button icon="i-mdi-pencil" text rounded @click="$emit('edit', rule)" />
          <Button icon="i-mdi-delete" severity="danger" text rounded @click="$emit('delete', rule)" />
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import Button from 'primevue/button'
import type { RouteRule } from '@/schemas/route'

defineProps<{ rule: RouteRule }>()
defineEmits(['edit', 'delete'])
</script>