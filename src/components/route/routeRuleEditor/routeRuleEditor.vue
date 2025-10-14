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
        v-if="isFieldVisible('domain')"
        :model-value="rule.domain?.join(', ')"
        label="Domains (comma-separated)"
        @update:model-value="updateField('domain', $event)"
      ></v-text-field>
      <v-text-field
        v-if="isFieldVisible('domain_suffix')"
        :model-value="rule.domain_suffix?.join(', ')"
        label="Domain Suffixes (comma-separated)"
        @update:model-value="updateField('domain_suffix', $event)"
      ></v-text-field>
      <v-text-field
        v-if="isFieldVisible('domain_keyword')"
        :model-value="rule.domain_keyword?.join(', ')"
        label="Domain Keywords (comma-separated)"
        @update:model-value="updateField('domain_keyword', $event)"
      ></v-text-field>
      <v-text-field
        v-if="isFieldVisible('domain_regex')"
        :model-value="rule.domain_regex?.join(', ')"
        label="Domain Regex (comma-separated)"
        @update:model-value="updateField('domain_regex', $event)"
      ></v-text-field>
      <rule-sets-selector v-model="rule.rule_set" />

      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props">Add Condition</v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="condition in availableConditions"
            :key="condition.value"
            @click="showField(condition.value)"
          >
            <v-list-item-title>{{ condition.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-form>
  </Editor>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
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

const visibleFields = ref<Array<keyof RouteRule>>([]);

const allConditions = [
  { title: 'Domains', value: 'domain' },
  { title: 'Domain Suffixes', value: 'domain_suffix' },
  { title: 'Domain Keywords', value: 'domain_keyword' },
  { title: 'Domain Regex', value: 'domain_regex' },
];

const availableConditions = computed(() => {
  return allConditions.filter(
    (condition) => !visibleFields.value.includes(condition.value as keyof RouteRule)
  );
});

const isFieldVisible = (field: keyof RouteRule) => {
  return visibleFields.value.includes(field);
};

const showField = (field: keyof RouteRule) => {
  if (!visibleFields.value.includes(field)) {
    visibleFields.value.push(field);
  }
};

const updateField = (field: keyof RouteRule, value: string) => {
  const newRule = { ...rule.value };
  if (value) {
    (newRule[field] as string[]) = value.split(',').map((s) => s.trim());
  } else {
    (newRule[field] as string[]) = [];
  }
  rule.value = newRule;
};


watch(
  rule,
  (newValue) => {
    emit('update:modelValue', newValue);
  },
  { deep: true }
);
</script>

<style scoped lang="scss" src="./routeRuleEditor.scss"></style>