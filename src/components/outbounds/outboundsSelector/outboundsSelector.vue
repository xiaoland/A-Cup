<template>
  <div class="d-flex align-center">
    <v-select
      v-model="selected"
      :items="outboundsWithTags"
      :multiple="multiple"
      item-title="name"
      item-value="tag"
      label="Outbound"
      @update:modelValue="onSelection"
      class="flex-grow-1"
    ></v-select>
    <v-btn @click="showCreateDialog = true" icon="mdi-plus" variant="text" class="ml-2"></v-btn>
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
    type: [String, Array] as import('vue').PropType<string | string[]>,
    default: '',
  },
  multiple: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const outboundStore = useOutboundStore();
const userStore = useUserStore();
const outboundsWithTags = ref<OutboundWithTag[]>([]);
const selected = ref(props.modelValue);
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
    return null;
  });

  const resolvedTags = await Promise.all(tagsPromises);
  outboundsWithTags.value = resolvedTags.filter((o) => o !== null) as OutboundWithTag[];
};

onMounted(fetchOutboundsWithTags);

const onOutboundCreated = () => {
  fetchOutboundsWithTags();
  showCreateDialog.value = false;
};

const onSelection = (value: string | string[]) => {
  emit('update:modelValue', value);
};

watch(
  () => props.modelValue,
  (newValue) => {
    selected.value = newValue;
  }
);
</script>

<style scoped></style>