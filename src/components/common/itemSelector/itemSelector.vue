<template>
  <v-card variant="outlined" class="item-selector">
    <v-toolbar density="comfortable" color="transparent">
      <v-toolbar-title class="text-subtitle-1">{{ title }}</v-toolbar-title>
      <v-spacer />
      <v-btn
        v-if="!isCreating"
        variant="text"
        prepend-icon="mdi-plus"
        @click="isCreating = true"
      >
        New
      </v-btn>
    </v-toolbar>

    <v-divider />

    <v-card-text>
      <template v-if="isCreating">
        <slot name="creator" :on-cancel="() => isCreating = false" :on-save="handleSaveNew" />
      </template>
      <template v-else>
        <v-list
          v-if="items.length"
          v-model:selected="selected"
          density="compact"
          class="py-0"
        >
          <v-list-item
            v-for="item in items"
            :key="item[itemValue]"
            :value="item[itemValue]"
            :title="item[itemTitle]"
          />
        </v-list>
        <div v-else class="text-center text-caption text-disabled">
          No items
        </div>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, watch, computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: any
  title?: string
  items: T[]
  itemTitle?: keyof T
  itemValue?: keyof T
  create?: (item: Omit<T, 'id'>) => Promise<T>
}>(), {
  itemTitle: 'name' as keyof T,
  itemValue: 'id' as keyof T,
  title: 'Selector'
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: any): void
  (e: 'update:items', v: T[]): void
}>()

const isCreating = ref(false)
const selected = ref([props.modelValue])

watch(() => props.modelValue, (v) => {
  selected.value = [v]
})

watch(selected, (v) => {
  if (v && v.length) {
    emit('update:modelValue', v[0])
  }
})

const handleSaveNew = async (newItem: Omit<T, 'id'>) => {
  if (props.create) {
    const created = await props.create(newItem)
    emit('update:items', [...props.items, created])
    emit('update:modelValue', created[props.itemValue])
  }
  isCreating.value = false
}
</script>

<style scoped>
.item-selector {
  overflow: hidden;
}
</style>