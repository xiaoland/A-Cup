<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { SingBoxOutbound } from "../../../schemas/singbox";
import HybirdOutboundEditor from "../outbounds/hybirdOutboundEditor.vue";
import SpecialOutboundEditor from "../outbounds/specialOutboundEditor/specialOutboundEditor.vue";
import Button from "primevue/button";
import Accordion from "primevue/accordion";
import AccordionPanel from "primevue/accordionpanel";
import AccordionHeader from "primevue/accordionheader";
import AccordionContent from "primevue/accordioncontent";
import { useOutboundStore } from "@/stores/outbound";

const props = defineProps<{
    modelValue: SingBoxOutbound[];
}>();

const emit = defineEmits<{
    "update:modelValue": [value: SingBoxOutbound[]];
    "update:referencedOutbounds": [value: number[]];
}>();

const outboundStore = useOutboundStore();
const normalOutbounds = ref<SingBoxOutbound[]>([]);
const specialOutbounds = ref<SingBoxOutbound[]>([]);

const combinedOutbounds = computed(() => {
    return [...normalOutbounds.value, ...specialOutbounds.value].filter(
        (o) => o !== undefined,
    ) as SingBoxOutbound[];
});

// Extract referenced outbound IDs from outbound tags
const referencedOutbounds = computed<number[]>(() => {
    const referenced: number[] = [];
    for (const outbound of combinedOutbounds.value) {
        const outboundId = parseInt(outbound.tag);
        if (!isNaN(outboundId) && !referenced.includes(outboundId)) {
            referenced.push(outboundId);
        }
    }
    return referenced;
});

// Get display name for outbound accordion header
function getOutboundHeaderText(singBoxOutbound: SingBoxOutbound): string {
    const outboundId = parseInt(singBoxOutbound.tag);
    if (isNaN(outboundId)) {
        return "New Outbound";
    }

    const outbound = outboundStore.outbounds.find((o) => o.id === outboundId);
    if (!outbound) {
        return `Outbound #${outboundId}`;
    }

    const parts: string[] = [];

    if (outbound.name) {
        parts.push(outbound.name);
    }

    if (outbound.region) {
        parts.push(outbound.region);
    }

    if (outbound.provider) {
        parts.push(outbound.provider);
    }

    if (outbound.type) {
        parts.push(`[${outbound.type}]`);
    }

    return parts.length > 0 ? parts.join(" - ") : `Outbound #${outboundId}`;
}

watch(
    combinedOutbounds,
    (newValue) => {
        emit("update:modelValue", newValue);
    },
    { deep: true },
);

watch(
    referencedOutbounds,
    (newValue) => {
        emit("update:referencedOutbounds", newValue);
    },
    { immediate: true },
);

function addNormalOutbound() {
    normalOutbounds.value.push({} as SingBoxOutbound);
}

function addSpecialOutbound() {
    specialOutbounds.value.push({
        tag: `special-outbound.${specialOutbounds.value.length + 1}`,
    } as SingBoxOutbound);
}

function removeNormalOutbound(index: number) {
    normalOutbounds.value.splice(index, 1);
    emit("update:modelValue", combinedOutbounds.value);
}

function removeSpecialOutbound(index: number) {
    specialOutbounds.value.splice(index, 1);
    emit("update:modelValue", combinedOutbounds.value);
}
</script>

<template>
    <div>
        <div class="flex justify-content-end mb-4">
            <Button
                label="Add Outbound"
                icon="pi pi-plus"
                @click="addNormalOutbound"
                class="mr-2"
            />
            <Button
                label="Add Special Outbound"
                icon="pi pi-plus"
                @click="addSpecialOutbound"
            />
        </div>

        <Accordion :multiple="true">
            <AccordionPanel
                v-for="(outbound, index) in normalOutbounds"
                :key="index"
                :value="index.toString()"
            >
                <AccordionHeader>
                    {{ getOutboundHeaderText(outbound) }}
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
            <AccordionPanel
                v-for="(outbound, index) in specialOutbounds"
                :key="index"
                :value="`special-${index}`"
            >
                <AccordionHeader>
                    {{ outbound?.tag || "New Special Outbound" }}
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
