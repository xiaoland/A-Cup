<template>
  <div class="d-flex flex-column" style="gap: 8px">
    <div class="d-flex align-center" style="gap: 8px">
      <v-btn color="primary" variant="outlined" @click="dialog = true">{{
        selectButtonText
      }}</v-btn>
      <span class="text-caption text-medium-emphasis">Selected: {{ selected.length }}</span>
    </div>
    <div class="d-flex" style="gap: 6px; flex-wrap: wrap">
      <v-chip
        v-for="item in selectedItems"
        :key="item.id"
        size="small"
        class="ma-1"
        variant="tonal"
        closable
        @click:close="removeItem(item.id)"
      >
        {{ item.name || `#${item.id}` }}
      </v-chip>
    </div>

    <v-dialog v-model="dialog" max-width="900">
      <v-card>
        <v-card-title class="text-h6">{{ dialogTitle }}</v-card-title>
        <v-card-text>
          <v-tabs v-model="tab" class="mb-4">
            <v-tab value="select">Select</v-tab>
            <v-tab v-if="$slots.create" value="create">Create New</v-tab>
          </v-tabs>

          <v-window v-model="tab">
            <v-window-item value="select">
              <v-text-field
                v-model="q"
                label="Search"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                clearable
                class="mb-2"
              />
              <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-2" />
              <v-list
                v-else
                lines="two"
                density="comfortable"
                class="border rounded"
                max-height="400"
                style="overflow-y: auto"
              >
                <v-list-item
                  v-for="item in filtered"
                  :key="item.id"
                  :title="item.name || `#${item.id}`"
                  :subtitle="getItemSubtitle(item)"
                >
                  <template #prepend>
                    <v-checkbox-btn
                      :model-value="local.has(item.id)"
                      @click.stop="toggle(item.id)"
                    />
                  </template>
                </v-list-item>
              </v-list>
            </v-window-item>

            <v-window-item v-if="$slots.create" value="create">
              <slot name="create" :on-created="handleCreated" />
            </v-window-item>
          </v-window>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn v-if="tab === 'select'" color="primary" @click="apply">Apply</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';

interface Item {
  id: number;
  name?: string;
  [key: string]: any;
}

interface Props {
  modelValue?: number[];
  apiEndpoint: string;
  selectButtonText?: string;
  dialogTitle?: string;
  itemSubtitleField?: string;
  filterFn?: (item: Item, query: string) => boolean;
  authorizedFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  selectButtonText: 'Select Items',
  dialogTitle: 'Select Items',
  itemSubtitleField: 'type',
});

const emit = defineEmits<{ (e: 'update:modelValue', v: number[]): void }>();

const dialog = ref(false);
const tab = ref('select');
const loading = ref(false);
const items = ref<Item[]>([]);
const q = ref('');
const local = ref<Set<number>>(new Set(props.modelValue || []));

watch(
  () => props.modelValue,
  (v) => {
    local.value = new Set(v || []);
  }
);

const filtered = computed(() => {
  const needle = q.value.trim().toLowerCase();
  if (!needle) return items.value;

  if (props.filterFn) {
    return items.value.filter((it) => props.filterFn!(it, needle));
  }

  return items.value.filter(
    (it) =>
      (it.name || '').toLowerCase().includes(needle) ||
      (it[props.itemSubtitleField] || '').toString().toLowerCase().includes(needle)
  );
});

const selected = computed(() => Array.from(local.value));

const selectedItems = computed(() => items.value.filter((it) => local.value.has(it.id)));

const getItemSubtitle = (item: Item) => {
  return item[props.itemSubtitleField] || '';
};

const toggle = (id: number) => {
  const s = local.value;
  if (s.has(id)) s.delete(id);
  else s.add(id);
};

const removeItem = (id: number) => {
  local.value.delete(id);
  emit('update:modelValue', Array.from(local.value));
};

const apply = () => {
  emit('update:modelValue', Array.from(local.value));
  dialog.value = false;
};

const load = async () => {
  loading.value = true;
  try {
    const res = await props.authorizedFetch(props.apiEndpoint);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) items.value = data;
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const handleCreated = async (newItem: Item) => {
  await load();
  if (newItem && newItem.id) {
    local.value.add(newItem.id);
  }
  tab.value = 'select';
};

onMounted(load);
</script>

<style scoped></style>
