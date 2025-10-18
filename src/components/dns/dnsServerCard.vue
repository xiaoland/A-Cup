<template>
  <Card>
    <template #content>
      <div class="flex justify-between items-center">
        <div>
          <div class="font-bold">{{ server.tag }}</div>
          <div class="text-sm text-gray-500">{{ server.address }}</div>
        </div>
        <div>
          <Button icon="i-mdi-pencil" text rounded @click="$emit('edit', server)" />
          <Button icon="i-mdi-delete" severity="danger" text rounded @click="$emit('delete', server)" />
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import Button from 'primevue/button'
import type { DnsServer } from '@/schemas/dns'

defineProps<{ server: DnsServer }>()
defineEmits(['edit', 'delete'])
</script>