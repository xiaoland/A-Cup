<script setup lang="ts">
import { inject, computed } from "vue";
import MultiSelect from "primevue/multiselect";
import type { ComputedRef } from "vue";

const props = defineProps<{
    modelValue?: string[];
    ignores?: string[];
}>();

const emit = defineEmits<{
    "update:modelValue": [value: string[] | undefined];
}>();

// Inject profileRuleSets from profileEditor/routeEditor
const profileRuleSets =
    inject<ComputedRef<Array<{ tag: string; name: string }>>>(
        "profileRuleSets",
    );

const ruleSetOptions = computed(() => {
    if (!profileRuleSets?.value) {
        return [];
    }

    let ruleSets = profileRuleSets.value;

    // Filter out ignored tags
    if (props.ignores && props.ignores.length > 0) {
        ruleSets = ruleSets.filter(
            (ruleSet) => !props.ignores!.includes(ruleSet.tag),
        );
    }

    return ruleSets;
});

const selectedTags = computed({
    get: () => props.modelValue,
    set: (tags: string[] | undefined) => {
        emit("update:modelValue", tags);
    },
});
</script>

<template>
    <MultiSelect
        v-model="selectedTags"
        :options="ruleSetOptions"
        optionLabel="name"
        optionValue="tag"
        placeholder="Select Rule Sets"
        class="w-full"
        showClear
    />
</template>
