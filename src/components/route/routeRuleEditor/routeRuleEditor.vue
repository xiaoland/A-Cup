<template>
  <Editor
    v-model="rule"
    title="Route Rule"
    :show-delete="true"
    @delete="emit('remove')"
    :start-editable="true"
  >
    <v-form>
      <v-select
        v-model="rule.action"
        :items="['route', 'reject', 'hijack-dns']"
        label="Action"
      ></v-select>
      <outbounds-selector v-if="rule.action === 'route'" v-model="rule.outbound" />
      <v-text-field
        :model-value="rule.domain?.join(', ')"
        label="Domains (comma-separated)"
        @update:model-value="rule.domain = $event.split(', ')"
      ></v-text-field>
      <v-text-field
        :model-value="rule.domain_suffix?.join(', ')"
        label="Domain Suffixes (comma-separated)"
        @update:model-value="rule.domain_suffix = $event.split(', ')"
      ></v-text-field>
      <v-text-field
        :model-value="rule.domain_keyword?.join(', ')"
        label="Domain Keywords (comma-separated)"
        @update:model-value="rule.domain_keyword = $event.split(', ')"
      ></v-text-field>
      <v-text-field
        :model-value="rule.domain_regex?.join(', ')"
        label="Domain Regex (comma-separated)"
        @update:model-value="rule.domain_regex = $event.split(', ')"
      ></v-text-field>
      <rule-sets-selector v-model="rule.rule_set" />
    </v-form>
  </Editor>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { type RouteRule } from '@/schemas/route';
import OutboundsSelector from '@/components/outbounds/outboundsSelector/outboundsSelector.vue';
import RuleSetsSelector from '@/components/route/ruleSets/ruleSetsSelector.vue';
import Editor from '@/components/common/Editor.vue';

const props = defineProps({
  modelValue: {
    type: Object as () => RouteRule,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue', 'remove']);

const rule = ref(props.modelValue);
if (!rule.value.rule_set) {
  rule.value.rule_set = [];
}


watch(
  rule,
  (newValue) => {
    emit('update:modelValue', newValue);
  },
  { deep: true }
);
</script>

<style scoped lang="scss" src="./routeRuleEditor.scss"></style>