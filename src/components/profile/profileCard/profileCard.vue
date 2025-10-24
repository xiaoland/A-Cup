<template>
  <Card class="profile-item">
    <template #content>
      <div class="flex justify-between items-start">
        <div>
          <div class="text-xl font-bold">{{ profile.name }}</div>
          <div class="text-sm text-gray-500">ID: {{ profile.id }}</div>
        </div>
        <div class="flex items-center">
          <Button
            icon="i-mdi-export"
            text
            rounded
            @click.stop="$emit('export', profile)"
          />
          <Button
            icon="i-mdi-pencil"
            text
            rounded
            @click.stop="$emit('edit', profile)"
          />
          <Menu ref="menu" :model="menuItems" :popup="true" />
          <Button
            icon="i-mdi-dots-vertical"
            text
            rounded
            @click.stop="menu.toggle($event)"
          />
        </div>
      </div>

      <!-- Tags -->
      <div v-if="profile.tags && profile.tags.length > 0" class="mt-4 flex flex-wrap gap-2">
        <Chip
          v-for="tag in profile.tags"
          :key="tag"
          :label="tag"
        />
      </div>

      <!-- Component Statistics -->
      <div class="mt-4 flex justify-around p-2 bg-gray-100 rounded">
        <div class="text-center">
          <div class="text-sm text-gray-500">Outbounds</div>
          <div class="text-lg font-bold">{{ profile.outbounds.length }}</div>
        </div>
        <div class="text-center">
          <div class="text-sm text-gray-500">Rule Sets</div>
          <div class="text-lg font-bold">{{ profile.rule_sets.length }}</div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import Chip from 'primevue/chip'
import type { Props, Emits } from './profileCard.ts'

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const menu = ref()
const menuItems = ref([
  {
    label: 'Duplicate',
    icon: 'i-mdi-content-copy',
    command: () => emit('duplicate', props.profile),
  },
  {
    label: 'Delete',
    icon: 'i-mdi-delete',
    command: () => emit('delete', props.profile),
  },
])
</script>