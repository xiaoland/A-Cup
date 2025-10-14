<template>
  <v-form @submit.prevent="save">
    <v-text-field v-model="form.name" label="Name"></v-text-field>
    <v-select v-model="form.type" :items="['inline', 'remote']" label="Type"></v-select>
    <v-text-field v-model="form.format" label="Format"></v-text-field>
    <v-textarea v-if="form.type === 'inline'" v-model="form.content" label="Content (JSON)"></v-textarea>
    <v-text-field v-if="form.type === 'remote'" v-model="form.content" label="URL"></v-text-field>
    <v-text-field v-model="form.download_detour" label="Download Detour"></v-text-field>
    <v-text-field v-model="form.update_interval" label="Update Interval"></v-text-field>
    <v-btn type="submit" color="primary">Save</v-btn>
    <v-btn @click="emit('close')">Cancel</v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { api } from '@/api';
import { RuleSetSchema, type RuleSet } from '@/schemas/route';

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

const save = async () => {
  try {
    const validatedData = RuleSetSchema.parse(form.value);
    if (props.ruleSet.id) {
      await api.put(`/rule_sets/${props.ruleSet.id}`, validatedData);
    } else {
      const response = await api.post('/rule_sets', validatedData);
      emit('created', response.data);
    }
    emit('close');
  } catch (error) {
    console.error('Validation error:', error);
  }
};
</script>

<style scoped lang="scss" src="./ruleSetEditor.scss"></style>