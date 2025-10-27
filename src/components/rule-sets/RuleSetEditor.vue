<script setup lang="ts">
import { ref, watch } from 'vue';
import type { RuleSet } from '../../../schemas/ruleset';

import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import Fieldset from 'primevue/fieldset';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import UsersPicker from '../user/usersPicker.vue';

const props = defineProps<{
  modelValue: RuleSet;
}>();

const emit = defineEmits(['update:modelValue', 'save', 'cancel']);

const localRuleSet = ref(JSON.parse(JSON.stringify(props.modelValue)));

watch(() => props.modelValue, (newValue) => {
  localRuleSet.value = JSON.parse(JSON.stringify(newValue));
}, { deep: true });

watch(localRuleSet, (newValue) => {
  emit('update:modelValue', newValue);
}, { deep: true });

const ruleSetTypes = [
  { label: 'Remote', value: 'remote' },
  { label: 'Inline', value: 'inline' },
];

function save() {
  emit('save', localRuleSet.value);
}

function cancel() {
  emit('cancel');
}
</script>

<template>
  <div class="p-4">
    <Fieldset legend="Basic Info">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="tag">Tag</label>
          <InputText id="tag" v-model="localRuleSet.tag" class="w-full" />
        </div>
        <div>
          <label for="type">Type</label>
          <Dropdown id="type" v-model="localRuleSet.type" :options="ruleSetTypes" optionLabel="label" optionValue="value" class="w-full" />
        </div>
        <div>
          <label for="format">Format</label>
          <InputText id="format" v-model="localRuleSet.format" class="w-full" />
        </div>
        <div>
          <label for="download_detour">Download Detour</label>
          <InputNumber id="download_detour" v-model="localRuleSet.download_detour" class="w-full" />
        </div>
        <div>
          <label for="update_interval">Update Interval</label>
          <InputNumber id="update_interval" v-model="localRuleSet.update_interval" class="w-full" />
        </div>
      </div>
    </Fieldset>

    <Fieldset legend="Content" class="mt-4">
        <Textarea v-model="localRuleSet.content" class="w-full" rows="10" />
    </Fieldset>

    <Fieldset legend="Permissions" :toggleable="true" :collapsed="true" class="mt-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="readableBy">Readable By</label>
          <UsersPicker id="readableBy" v-model="localRuleSet.readableBy" />
        </div>
        <div>
          <label for="writeableBy">Writeable By</label>
          <UsersPicker id="writeableBy" v-model="localRuleSet.writeableBy" />
        </div>
      </div>
    </Fieldset>

    <div class="flex justify-end mt-4">
        <Button label="Cancel" @click="cancel" class="p-button-text" />
        <Button label="Save" @click="save" />
    </div>
  </div>
</template>
