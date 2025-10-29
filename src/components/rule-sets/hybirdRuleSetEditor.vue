<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { SingBoxRuleSet } from '../../../schemas/route';
import type { RuleSet } from '../../../schemas/ruleset';
import { exportRuleSetToSingBox } from '../../../schemas/ruleset';
import RuleSetPicker from './ruleSetPicker.vue';
import singBoxOutboundPicker from '../outbounds/singBoxOutboundPicker.vue';
import InputText from 'primevue/inputtext';
import { useRuleSetStore } from '@/stores/ruleset';

const props = withDefaults(defineProps<{
  modelValue: SingBoxRuleSet;
}>(), {
  modelValue: () => ({} as SingBoxRuleSet),
});

const emit = defineEmits(['update:modelValue']);
const ruleSetStore = useRuleSetStore();
const selectedRuleSetId = ref<number | undefined>(props.modelValue?.tag ? parseInt(props.modelValue.tag) : undefined);

const localRuleSet = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const downloadDetour = computed({
  get: () => (localRuleSet.value.type === 'remote' ? localRuleSet.value.download_detour : undefined),
  set: (value) => {
    if (localRuleSet.value.type === 'remote') {
      emit('update:modelValue', { ...localRuleSet.value, download_detour: value });
    }
  },
});

const updateInterval = computed({
  get: () => (localRuleSet.value.type === 'remote' ? localRuleSet.value.update_interval : undefined),
  set: (value) => {
    if (localRuleSet.value.type === 'remote') {
      emit('update:modelValue', { ...localRuleSet.value, update_interval: value });
    }
  },
});


watch(selectedRuleSetId, (newId) => {
  if (!newId) {
    emit("update:modelValue", {} as SingBoxRuleSet);
  }
  else {
    const ruleSet = ruleSetStore.ruleSets.find(rs => rs.id === newId);
    if (ruleSet) {
      const newRuleSet = exportRuleSetToSingBox(ruleSet);
      if (newRuleSet.type === 'remote' && localRuleSet.value.type === 'remote') {
        newRuleSet.download_detour = localRuleSet.value.download_detour;
        newRuleSet.update_interval = localRuleSet.value.update_interval;
      }
      emit("update:modelValue", newRuleSet);
    }
  }
});

watch(() => props.modelValue, (newValue) => {
  const newId = newValue?.tag ? parseInt(newValue.tag) : undefined;
  if (selectedRuleSetId.value !== newId) {
    selectedRuleSetId.value = newId;
  }
}, { deep: true });

const selectedRuleSet = computed(() => {
  return ruleSetStore.ruleSets.find(rs => rs.id === selectedRuleSetId.value);
});

</script>

<template>
  <div>
    <RuleSetPicker v-model="selectedRuleSetId" />

    <div v-if="selectedRuleSet && selectedRuleSet.type === 'remote'" class="grid grid-cols-2 gap-4 mt-4">
      <div>
        <label for="download_detour">Download Detour</label>
        <singBoxOutboundPicker id="download_detour" v-model="downloadDetour" />
      </div>
      <div>
        <label for="update_interval">Update Interval</label>
        <InputText id="update_interval" v-model="updateInterval" class="w-full" />
      </div>
    </div>
  </div>
</template>
