<template>
  <div>
    <!-- TODO: Refactor this component to use PrimeVue -->
  </div>
</template>

<script setup lang="ts">
// import { ref } from 'vue';
// import { useRuleSetStore } from '@/stores/user';
// import { RuleSetSchema, type RuleSet } from '@/schemas/route';
// import OutboundsSelector from '@/components/outbounds/outboundsSelector/outboundsSelector.vue';
// import Editor from '@/components/common/Editor.vue';

// const props = defineProps({
//   ruleSet: {
//     type: Object as () => RuleSet,
//     default: () => ({
//       name: '',
//       type: 'inline',
//       format: 'source',
//       content: '',
//     }),
//   },
// });

// const emit = defineEmits(['close', 'created', 'deleted']);

// const form = ref(props.ruleSet);
// const ruleSetStore = useRuleSetStore();

// const save = async (data: RuleSet) => {
//   try {
//     const validatedData = RuleSetSchema.parse(data);
//     if (props.ruleSet.id) {
//       await ruleSetStore.updateRuleSet(props.ruleSet.id, validatedData);
//     } else {
//       await ruleSetStore.createRuleSet(validatedData);
//       emit('created', validatedData);
//     }
//     emit('close');
//   } catch (error) {
//     console.error('Validation error:', error);
//   }
// };

// const deleteRuleSet = async () => {
//   if (props.ruleSet.id) {
//     await ruleSetStore.deleteRuleSet(props.ruleSet.id);
//     emit('deleted');
//     emit('close');
//   }
// };
</script>

<style scoped lang="scss"></style>