<template>
  <div>
    <!-- TODO: Refactor this component to use PrimeVue -->
  </div>
</template>

<script setup lang="ts">
// import { ref, watch, computed } from 'vue';
// import { type RouteRule } from '@/schemas/route';
// import OutboundsSelector from '@/components/outbounds/outboundsSelector/outboundsSelector.vue';
// import RuleSetsSelector from '@/components/route/ruleSets/ruleSetsSelector.vue';
// import Editor from '@/components/common/Editor.vue';

// const props = defineProps({
//   modelValue: {
//     type: Object as () => RouteRule,
//     required: true,
//   },
// });

// const emit = defineEmits(['update:modelValue', 'remove']);

// const rule = ref(props.modelValue);

// const allConditions = [
//   { title: 'Domains', value: 'domain' },
//   { title: 'Domain Suffixes', value: 'domain_suffix' },
//   { title: 'Domain Keywords', value: 'domain_keyword' },
//   { title: 'Domain Regex', value: 'domain_regex' },
//   { title: 'Rule Sets', value: 'rule_set' },
// ];

// const visibleFields = ref<Array<keyof RouteRule>>(([] as Array<keyof RouteRule>).concat(
//   Object.keys(props.modelValue).filter(k => allConditions.some(c => c.value === k)) as Array<keyof RouteRule>
// ));

// const availableConditions = computed(() => {
//   return allConditions.filter(
//     (condition) => !visibleFields.value.includes(condition.value as keyof RouteRule)
//   );
// });

// const isFieldVisible = (field: keyof RouteRule) => {
//   return visibleFields.value.includes(field);
// };

// const showField = (condition: { value: string }) => {
//   const field = condition.value as keyof RouteRule;
//   if (!visibleFields.value.includes(field)) {
//     visibleFields.value.push(field);
//   }
// };

// const hideField = (field: keyof RouteRule) => {
//   visibleFields.value = visibleFields.value.filter((f) => f !== field);
//   if (field in rule.value) {
//     delete rule.value[field];
//   }
// };

// const updateField = (field: keyof RouteRule, value: string) => {
//   const arrayFields: (keyof RouteRule)[] = ['domain', 'domain_suffix', 'domain_keyword', 'domain_regex', 'rule_set'];
//   if (arrayFields.includes(field)) {
//     if (value) {
//       (rule.value[field] as string[]) = value.split(',').map((s) => s.trim());
//     } else {
//       (rule.value[field] as string[] | undefined) = undefined;
//     }
//   }
// };


// watch(
//   rule,
//   (newValue) => {
//     emit('update:modelValue', newValue);
//   },
//   { deep: true }
// );
</script>

<style scoped lang="scss"></style>