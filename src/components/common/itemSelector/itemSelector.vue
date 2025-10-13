<template>
  <v-card>
    <v-toolbar density="compact">
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-spacer />
      <v-btn icon="mdi-plus" @click="onCreate" />
    </v-toolbar>
    <v-list>
      <v-list-item v-for="(item, i) in items" :key="i">
        <Editor
          :model-value="item.data"
          :start-editable="item.isNew"
          :show-delete="!item.isNew"
          @save="(value) => onSave(i, value)"
          @delete="() => onDelete(i)"
          @cancel="() => onCancel(i)"
        >
          <template #default>
            <slot name="form" :item="item.data" />
          </template>
          <template #readonly>
            <slot name="readonly" :item="item.data" />
          </template>
        </Editor>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup lang="ts" generic="T extends { id?: number }">
import { ref, watch } from 'vue';
import Editor from '../Editor.vue';
import type { Item } from './types';

const props = defineProps<{
  modelValue: T[];
  title: string;
  createItem: (item: T) => Promise<T>;
  updateItem: (item: T) => Promise<T>;
  deleteItem: (item: T) => Promise<void>;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: T[]): void;
}>();

const items = ref<Item<T>[]>([]);

watch(
  () => props.modelValue,
  (newVal) => {
    items.value = newVal.map((data) => ({ data, isNew: false }));
  },
  { immediate: true }
);

const onCreate = () => {
  items.value.push({ data: {} as T, isNew: true });
};

const onSave = async (index: number, value: T) => {
  const item = items.value[index];
  if (item.isNew) {
    const newItem = await props.createItem(value);
    items.value[index] = { data: newItem, isNew: false };
  } else {
    const updatedItem = await props.updateItem({ ...item.data, ...value });
    items.value[index] = { data: updatedItem, isNew: false };
  }
  emit('update:modelValue', items.value.map((i) => i.data));
};

const onDelete = async (index: number) => {
  const item = items.value[index];
  if (!item.isNew) {
    await props.deleteItem(item.data);
  }
  items.value.splice(index, 1);
  emit('update:modelValue', items.value.map((i) => i.data));
};

const onCancel = (index: number) => {
  const item = items.value[index];
  if (item.isNew) {
    items.value.splice(index, 1);
  }
};
</script>

<style scoped lang="scss" src="./index.scss"></style>