<template>
  <div class="d-flex align-center" style="gap: 8px;">
    <div class="flex-grow-1">
      <v-select
        v-model="selected"
        :items="outboundsWithTags"
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
import type { Outbound } from '@/components/outbounds/outboundEditor/types';
import OutboundEditor from '@/components/outbounds/outboundEditor/outboundEditor.vue';

interface OutboundWithTag extends Outbound {
  tag: string;
}

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
const outboundsWithTags = ref<OutboundWithTag[]>([]);
const selected = ref<any>(props.multiple ? [] : '');
const showCreateDialog = ref(false);
const emptyOutbound: Outbound = {
  name: '',
  type: 'vmess',
  server: '',
  server_port: 443,
  credential: {
    uuid: '',
    alter_id: 0,
    security: 'auto',
  },
};
const itemValue = computed(() => (props.valueAs === 'id' ? 'id' : 'tag'));

const fetchOutboundsWithTags = async () => {
  await outboundStore.fetchOutbounds();
  const outbounds = outboundStore.outbounds;
  const tagsPromises = outbounds.map(async (outbound) => {
    if (outbound.id) {
      const response = await userStore.authorizedFetch(`/api/outbounds/${outbound.id}/tag`);
      if (response.ok) {
        const data = await response.json();
        return { ...outbound, tag: data.tag };
      }
    }
    return { ...outbound, tag: `outbound-${outbound.id}` };
  });

  const resolvedTags = await Promise.all(tagsPromises);
  outboundsWithTags.value = resolvedTags as OutboundWithTag[];
  updateSelected(props.modelValue);
};

onMounted(fetchOutboundsWithTags);

const onOutboundCreated = () => {
  fetchOutboundsWithTags();
  showCreateDialog.value = false;
};

const onSelection = (value: any) => {
  emit('update:modelValue', value);
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
    const tags = (Array.isArray(modelValue) ? modelValue : []) as string[];
    selected.value = tags
      .map((tag) => outboundsWithTags.value.find((o) => o.tag === tag)?.tag)
      .filter((tag) => tag) as string[];
  } else {
    const tag = modelValue as string;
    const found = outboundsWithTags.value.find((o) => o.tag === tag);
    selected.value = found ? found.tag : '';
  }
};

watch(
  () => props.modelValue,
  (newValue) => {
    updateSelected(newValue);
  },
  { immediate: true, deep: true }
);

watch(outboundsWithTags, () => {
  updateSelected(props.modelValue);
});
</script>

<style scoped></style>