<template>
  <v-form @submit.prevent="save">
    <v-text-field v-model="form.name" label="Name"></v-text-field>
    <v-select v-model="form.type" :items="['inline', 'remote']" label="Type"></v-select>
    <v-combobox
      v-model="form.format"
      :items="['binary', 'source']"
      label="Format"
      hint="Select a format or type a custom one"
      persistent-hint
    ></v-combobox>
    <v-textarea
      v-if="form.type === 'inline'"
      v-model="form.content"
      label="Content (JSON array of headless rules)"
    ></v-textarea>
    <v-text-field v-if="form.type === 'remote'" v-model="form.content" label="URL"></v-text-field>
    <outbounds-selector v-model="form.download_detour" />
    <v-text-field v-model="form.update_interval" label="Update Interval"></v-text-field>
    <v-btn type="submit" color="primary">Save</v-btn>
    <v-btn @click="emit('close')">Cancel</v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRuleSetStore } from '@/stores/ruleSet';
import { RuleSetSchema, type RuleSet } from '@/schemas/route';
import OutboundsSelector from '@/components/outbounds/outboundsSelector/outboundsSelector.vue';

const props = defineProps({
  ruleSet: {
    type: Object as () => RuleSet,
    default: () => ({
      name: '',
      type: 'inline',
      format: 'source',
      content: '',
    }),
  },
});

const emit = defineEmits(['close', 'created']);

const form = ref(props.ruleSet);
const ruleSetStore = useRuleSetStore();

const save = async () => {
  try {
    const validatedData = RuleSetSchema.parse(form.value);
    if (props.ruleSet.id) {
      await ruleSetStore.updateRuleSet(props.ruleSet.id, validatedData);
    } else {
      await ruleSetStore.createRuleSet(validatedData);
      emit('created', validatedData);
    }
    emit('close');
  } catch (error) {
    console.error('Validation error:', error);
  }
};
</script>

<style scoped lang="scss" src="./ruleSetEditor.scss"></style>