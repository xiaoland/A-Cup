<script setup lang="ts">
import { inject, computed } from "vue";
import Select from "primevue/select";
import type { SingBoxOutbound } from "../../../schemas/singbox";
import type { ComputedRef } from "vue";

const props = defineProps<{
    modelValue?: string;
    ignores?: string[];
}>();

const emit = defineEmits<{
    "update:modelValue": [value: string | undefined];
}>();

// Inject profileOutbounds from profileEditor
const profileOutbounds = inject<
    ComputedRef<
        Array<{
            type: "common" | "special";
            tag: string;
            nickname?: string;
            outbound: SingBoxOutbound;
        }>
    >
>("profileOutbounds");

const outboundOptions = computed(() => {
    if (!profileOutbounds?.value) {
        return [];
    }

    let outbounds = profileOutbounds.value;

    // Filter out ignored tags
    if (props.ignores && props.ignores.length > 0) {
        outbounds = outbounds.filter(
            (outbound) => !props.ignores!.includes(outbound.tag),
        );
    }

    // Map to options with display label (nickname for common, tag for special)
    return outbounds.map((outbound) => ({
        tag: outbound.tag,
        label:
            outbound.type === "common" && outbound.nickname
                ? outbound.nickname
                : outbound.tag,
    }));
});

const selectedTag = computed({
    get: () => props.modelValue,
    set: (tag: string | undefined) => {
        if (!tag) {
            emit("update:modelValue", undefined);
        } else {
            emit("update:modelValue", tag);
        }
    },
});
</script>

<template>
    <Select
        v-model="selectedTag"
        :options="outboundOptions"
        optionLabel="label"
        optionValue="tag"
        placeholder="Select an Outbound"
        class="w-full"
        showClear
    />
</template>
