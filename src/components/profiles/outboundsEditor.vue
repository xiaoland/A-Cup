<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { SingBoxOutbound } from '../../../schemas/singbox';
import HybirdOutboundEditor from '../outbounds/hybirdOutboundEditor.vue';
import SpecialOutboundEditor from '../outbounds/specialOutboundEditor.vue';
import Button from 'primevue/button';
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';

const props = defineProps<{
  modelValue: SingBoxOutbound[];
}>();

const emit = defineEmits(['update:modelValue']);

const normalOutbounds = ref<(SingBoxOutbound)[]>([]);
const specialOutbounds = ref<(SingBoxOutbound)[]>([]);

const combinedOutbounds = computed(() => {
    return [...normalOutbounds.value, ...specialOutbounds.value].filter(o => o !== undefined) as SingBoxOutbound[];
});

watch(combinedOutbounds, (newValue) => {
    emit('update:modelValue', newValue);
}, { deep: true });


function addNormalOutbound() {
  normalOutbounds.value.push({} as SingBoxOutbound);
}

function addSpecialOutbound() {
  specialOutbounds.value.push({} as SingBoxOutbound);
}

function removeNormalOutbound(index: number) {
    normalOutbounds.value.splice(index, 1);
    emit('update:modelValue', combinedOutbounds.value);
}

function removeSpecialOutbound(index: number) {
    specialOutbounds.value.splice(index, 1);
    emit('update:modelValue', combinedOutbounds.value);
}

</script>

<template>
  <div>
    <div class="flex justify-content-end mb-4">
      <Button label="Add Outbound" icon="pi pi-plus" @click="addNormalOutbound" class="mr-2" />
      <Button label="Add Special Outbound" icon="pi pi-plus" @click="addSpecialOutbound" />
    </div>

    <Accordion :multiple="true">
      <AccordionPanel v-for="(outbound, index) in normalOutbounds" :key="index" :value="index.toString()">
        <AccordionHeader>
          {{ outbound?.tag || 'New Outbound' }}
        </AccordionHeader>
        <AccordionContent>
          <div class="flex justify-end mb-3">
            <Button 
              icon="pi pi-trash" 
              severity="danger" 
              size="small"
              text
              @click="removeNormalOutbound(index)" 
              label="Remove"
            />
          </div>
          <HybirdOutboundEditor v-model="normalOutbounds[index]" />
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

    <Accordion :multiple="true" class="mt-4">
        <AccordionPanel v-for="(outbound, index) in specialOutbounds" :key="index" :value="`special-${index}`">
          <AccordionHeader>
            {{ outbound?.tag || 'New Special Outbound' }}
          </AccordionHeader>
          <AccordionContent>
            <div class="flex justify-end mb-3">
              <Button 
                icon="pi pi-trash" 
                severity="danger" 
                size="small"
                text
                @click="removeSpecialOutbound(index)" 
                label="Remove"
              />
            </div>
            <SpecialOutboundEditor v-model="specialOutbounds[index]" />
          </AccordionContent>
        </AccordionPanel>
    </Accordion>
  </div>
</template>
