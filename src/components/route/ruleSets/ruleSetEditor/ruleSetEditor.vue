<template>
  <Card>
    <template #title>
      <div class="text-2xl font-bold">
        {{ form.id ? `Edit Rule Set: ${form.name}` : 'Create Rule Set' }}
      </div>
    </template>
    <template #content>
      <div class="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="field col-span-1">
          <label for="name">Name</label>
          <InputText id="name" v-model="form.name" />
        </div>
        <div class="field col-span-1">
          <label for="type">Type</label>
          <Select id="type" v-model="form.type" :options="['inline', 'remote']" />
        </div>
        <div class="field col-span-1">
          <label for="format">Format</label>
          <Select
            id="format"
            v-model="form.format"
            :options="['binary', 'source']"
            editable
          />
        </div>
        <div class="field col-span-2">
          <label for="content">{{ form.type === 'remote' ? 'URL' : 'Content (JSON array of headless rules)' }}</label>
          <Textarea
            id="content"
            v-model="form.content"
            rows="10"
            auto-resize
          />
        </div>
        <div class="field col-span-1">
            <label for="download_detour">Download Detour</label>
            <OutboundsSelector v-model="form.download_detour" value-as="id" />
        </div>
        <div class="field col-span-1">
          <label for="update_interval">Update Interval</label>
          <InputText id="update_interval" v-model="form.update_interval" />
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Cancel" severity="secondary" @click="emit('close')" />
        <Button label="Save" @click="save(form)" />
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRuleSetStore } from '@/stores/ruleSet'
import { RuleSetSchema, type RuleSet } from '@/schemas/route'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import OutboundsPicker from '@/components/outbounds/outboundsPicker/outboundsPicker.vue'

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
})

const emit = defineEmits(['close', 'created', 'deleted'])

const form = ref(props.ruleSet)
const ruleSetStore = useRuleSetStore()

const save = async (data: RuleSet) => {
  try {
    const validatedData = RuleSetSchema.parse(data)
    if (props.ruleSet.id) {
      await ruleSetStore.updateRuleSet(props.ruleSet.id, validatedData)
    } else {
      await ruleSetStore.createRuleSet(validatedData)
      emit('created', validatedData)
    }
    emit('close')
  } catch (error) {
    console.error('Validation error:', error)
  }
}
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>