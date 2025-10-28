<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { SingBoxOutbound } from '../../../schemas/singbox';
import HybirdOutboundEditor from '../outbounds/hybirdOutboundEditor.vue';
import SpecialOutboundEditor from '../outbounds/specialOutboundEditor.vue';
import Button from 'primevue/button';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';

const props = defineProps<{
  modelValue: SingBoxOutbound[];
}>();

const emit = defineEmits(['update:modelValue']);

const normalOutbounds = ref<(SingBoxOutbound | undefined)[]>([]);
const specialOutbounds = ref<(SingBoxOutbound | undefined)[]>([]);

const combinedOutbounds = computed(() => {
    return [...normalOutbounds.value, ...specialOutbounds.value].filter(o => o !== undefined) as SingBoxOutbound[];
});

watch(combinedOutbounds, (newValue) => {
    emit('update:modelValue', newValue);
}, { deep: true });


function addNormalOutbound() {
  normalOutbounds.value.push(undefined);
}

function addSpecialOutbound() {
  specialOutbounds.value.push(undefined);
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
      <AccordionTab v-for="(outbound, index) in normalOutbounds" :key="index" :header="outbound?.tag || 'New Outbound'">
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
      </AccordionTab>
    </Accordion>

    <Accordion :multiple="true" class="mt-4">
        <AccordionTab v-for="(outbound, index) in specialOutbounds" :key="index" :header="outbound?.tag || 'New Special Outbound'">
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
        </AccordionTab>
    </Accordion>
  </div>
</template>
