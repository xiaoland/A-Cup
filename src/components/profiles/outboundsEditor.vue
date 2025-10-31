<script setup lang="ts">
import { watch, computed } from "vue";
import type { SingBoxOutbound } from "../../../schemas/singbox";
import { isSpecialOutbound } from "../../../schemas/singbox";
import HybirdOutboundEditor from "../outbounds/hybirdOutboundEditor.vue";
import SpecialOutboundEditor from "../outbounds/specialOutboundEditor/specialOutboundEditor.vue";
import Button from "primevue/button";
import Accordion from "primevue/accordion";
import AccordionPanel from "primevue/accordionpanel";
import AccordionHeader from "primevue/accordionheader";
import AccordionContent from "primevue/accordioncontent";
import { useOutboundStore } from "@/stores/outbound";
import { getOutboundNickname } from "../../../schemas/outbound";

const props = defineProps<{
    modelValue: SingBoxOutbound[];
}>();

const emit = defineEmits<{
    "update:modelValue": [value: SingBoxOutbound[]];
    "update:referencedOutbounds": [value: number[]];
}>();

const outboundStore = useOutboundStore();

const normalOutbounds = computed(() => {
    return props.modelValue.filter(
        (outbound) => !isSpecialOutbound(outbound.type),
    );
});

const specialOutbounds = computed(() => {
    return props.modelValue.filter((outbound) =>
        isSpecialOutbound(outbound.type),
    );
});

// Extract referenced outbound IDs from outbound tags
const referencedOutbounds = computed<number[]>(() => {
    const referenced: number[] = [];
    for (const outbound of props.modelValue) {
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

    return getOutboundNickname(outbound);
}

watch(
    referencedOutbounds,
    (newValue) => {
        emit("update:referencedOutbounds", newValue);
    },
    { immediate: true },
);

function addNormalOutbound() {
    const newOutbounds = [
        ...props.modelValue,
        {
            tag: "",
            type: "direct",
        } as SingBoxOutbound,
    ];
    emit("update:modelValue", newOutbounds);
}

function addSpecialOutbound() {
    const newOutbounds = [
        ...props.modelValue,
        {
            tag: `special-outbound.${specialOutbounds.value.length + 1}`,
            type: "direct",
        } as SingBoxOutbound,
    ];
    emit("update:modelValue", newOutbounds);
}

function removeNormalOutbound(index: number) {
    const normalIndex = props.modelValue.findIndex(
        (outbound) =>
            !isSpecialOutbound(outbound.type) &&
            props.modelValue
                .filter((o) => !isSpecialOutbound(o.type))
                .indexOf(outbound) === index,
    );
    if (normalIndex !== -1) {
        const newOutbounds = props.modelValue.filter(
            (_, i) => i !== normalIndex,
        );
        emit("update:modelValue", newOutbounds);
    }
}

function removeSpecialOutbound(index: number) {
    const specialIndex = props.modelValue.findIndex(
        (outbound) =>
            isSpecialOutbound(outbound.type) &&
            props.modelValue
                .filter((o) => isSpecialOutbound(o.type))
                .indexOf(outbound) === index,
    );
    if (specialIndex !== -1) {
        const newOutbounds = props.modelValue.filter(
            (_, i) => i !== specialIndex,
        );
        emit("update:modelValue", newOutbounds);
    }
}

function updateNormalOutbound(index: number, value: SingBoxOutbound) {
    const normalOutboundsList = normalOutbounds.value;
    const targetOutbound = normalOutboundsList[index];
    const actualIndex = props.modelValue.indexOf(targetOutbound);

    if (actualIndex !== -1) {
        const newOutbounds = [...props.modelValue];
        newOutbounds[actualIndex] = value;
        emit("update:modelValue", newOutbounds);
    }
}

function updateSpecialOutbound(index: number, value: SingBoxOutbound) {
    const specialOutboundsList = specialOutbounds.value;
    const targetOutbound = specialOutboundsList[index];
    const actualIndex = props.modelValue.indexOf(targetOutbound);

    if (actualIndex !== -1) {
        const newOutbounds = [...props.modelValue];
        newOutbounds[actualIndex] = value;
        emit("update:modelValue", newOutbounds);
    }
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
                    <HybirdOutboundEditor
                        :model-value="normalOutbounds[index]"
                        @update:model-value="
                            (value) => updateNormalOutbound(index, value)
                        "
                    />
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
                    <SpecialOutboundEditor
                        :model-value="specialOutbounds[index]"
                        @update:model-value="
                            (value) => updateSpecialOutbound(index, value)
                        "
                    />
                </AccordionContent>
            </AccordionPanel>
        </Accordion>
    </div>
</template>
