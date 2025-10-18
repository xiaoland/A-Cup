<template>
  <div>
    <!-- TODO: Refactor this component to use PrimeVue -->
  </div>
</template>

<script setup lang="ts">
// import { ref, watch } from 'vue';
// import { type Route, type RouteRule } from '@/schemas/route';
// import Editor from '@/components/common/Editor.vue';
// import RouteRuleEditor from '../routeRuleEditor/routeRuleEditor.vue';
// import RuleSetsSelector from '../ruleSets/ruleSetsSelector.vue';
// import OutboundsSelector from '@/components/outbounds/outboundsSelector/outboundsSelector.vue';

// const props = withDefaults(defineProps<{
//   modelValue: Route;
// }>(), {
//   modelValue: () => ({
//     rules: [],
//     rule_set: [] as number[],
//   }),
// });

// const emit = defineEmits(['update:modelValue']);

// const route = ref(props.modelValue);

// if (!route.value.rules) {
//   route.value.rules = [];
// }

// const addRule = () => {
//   if (!route.value.rules) {
//     route.value.rules = [];
//   }
//   route.value.rules.push({
//     action: 'route',
//     outbound: '',
//   } as RouteRule);
// };

// const removeRule = (index: number) => {
//   if (route.value.rules) {
//     route.value.rules.splice(index, 1);
//   }
// };

// watch(
//   route,
//   (newValue) => {
//     emit('update:modelValue', newValue);
//   },
//   { deep: true }
// );

// const pretty = (v: any) => {
//   try { return JSON.stringify(v ?? {}, null, 2) } catch { return '' }
// }
</script>

<style scoped></style>