<template>
  <div class="d-flex align-center" style="gap: 8px;">
    <div class="flex-grow-1">
      <v-select
        v-model="selected"
        :items="outboundStore.outbounds"
        :multiple="multiple"
        item-title="name"
        :item-value="itemValue"
        label="Outbound"
        :return-object="false"
        @update:modelValue="onSelection"
        hide-details
      ></v-select>
    </div>
    <v-btn @click="showCreateDialog = true" icon="mdi-plus" variant="text"></v-btn>
    <v-dialog v-model="showCreateDialog" max-width="600px">
      <v-card>
        <v-card-title>Create New Outbound</v-card-title>
        <v-card-text>
          <outbound-editor :form="emptyOutbound" @close="showCreateDialog = false" @created="onOutboundCreated" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useOutboundStore } from '@/stores/outbound';
import { useUserStore } from '@/stores/user';
import type { Outbound } from '@/types/outbound';
import OutboundEditor from '@/components/outbounds/outboundEditor/outboundEditor.vue';

const props = defineProps({
  modelValue: {
    type: [String, Array] as import('vue').PropType<string | string[] | number | number[]>,
    default: '',
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  valueAs: {
    type: String as () => 'id' | 'tag',
    default: 'tag',
  },
});

const emit = defineEmits(['update:modelValue']);

const outboundStore = useOutboundStore();
const userStore = useUserStore();
const selected = ref<any>(props.multiple ? [] : '');
const showCreateDialog = ref(false);
const emptyOutbound: Outbound = {
  name: '',
  type: 'vmess',
  tag: '',
  server: '',
  server_port: 443,
  uuid: '',
  security: 'auto',
};
const itemValue = computed(() => (props.valueAs === 'id' ? 'id' : 'tag'));

const fetchOutbounds = async () => {
  await outboundStore.fetchOutbounds();
  updateSelected(props.modelValue);
};

onMounted(fetchOutbounds);

const onOutboundCreated = () => {
  fetchOutbounds();
  showCreateDialog.value = false;
};

const onSelection = (value: any | any[]) => {
  if (props.valueAs === 'id') {
    if (props.multiple) {
      const ids = Array.isArray(value) ? value.map((item: any) => (typeof item === 'object' && item.id ? item.id : item)) : [];
      emit('update:modelValue', ids);
    } else {
      const id = typeof value === 'object' && value.id ? value.id : value;
      emit('update:modelValue', id);
    }
  } else {
    emit('update:modelValue', value);
  }
};

const updateSelected = (modelValue: any) => {
  if (props.valueAs === 'id') {
    if (props.multiple) {
      selected.value = Array.isArray(modelValue) ? modelValue.map(Number) : [];
    } else {
      selected.value = modelValue ? Number(modelValue) : '';
    }
    return;
  }

  if (props.multiple) {
    const names = (Array.isArray(modelValue) ? modelValue : []) as string[];
    selected.value = names
      .map((name) => outboundStore.outbounds.find((o) => o.name === name)?.name)
      .filter((name) => name) as string[];
  } else {
    const name = modelValue as string;
    const found = outboundStore.outbounds.find((o) => o.name === name);
    selected.value = found ? found.name : '';
  }
};

watch(
  () => props.modelValue,
  (newValue) => {
    updateSelected(newValue);
  },
  { immediate: true, deep: true }
);

watch(() => outboundStore.outbounds, () => {
  updateSelected(props.modelValue);
});
</script>

<style scoped></style>