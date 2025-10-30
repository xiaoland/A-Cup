<script setup lang="ts">
import { ref, watch } from "vue";
import { RuleSetSchema, type RuleSet } from "../../../schemas/ruleset";
import ImportRuleSet from "./importRuleSet.vue";

import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Button from "primevue/button";
import Fieldset from "primevue/fieldset";
import Textarea from "primevue/textarea";
import UsersPicker from "../user/usersPicker.vue";

const props = defineProps<{
    modelValue: RuleSet;
}>();

const emit = defineEmits(["update:modelValue", "save", "cancel"]);

// Initialize with schema parsing to ensure defaults
const localRuleSet = ref(
    RuleSetSchema.parse(JSON.parse(JSON.stringify(props.modelValue))),
);
const isImportDialogVisible = ref(false);

watch(
    () => props.modelValue,
    (newValue) => {
        localRuleSet.value = JSON.parse(JSON.stringify(newValue));
    },
    { deep: true },
);

watch(
    localRuleSet,
    (newValue) => {
        emit("update:modelValue", newValue);
    },
    { deep: true },
);

const ruleSetTypes = [
    { label: "Remote", value: "remote" },
    { label: "Inline", value: "inline" },
];

function save() {
    // Validate with schema before saving
    try {
        const validated = RuleSetSchema.parse(localRuleSet.value);
        emit("save", validated);
    } catch (error) {
        console.error("Validation error:", error);
        // You might want to show a toast/notification here
        throw error;
    }
}

function cancel() {
    emit("cancel");
}

function showImportDialog() {
    isImportDialogVisible.value = true;
}

function onParsed(parsedRuleSet: Partial<RuleSet>) {
    // Merge and validate with schema
    try {
        localRuleSet.value = RuleSetSchema.parse({
            ...localRuleSet.value,
            ...parsedRuleSet,
        });
    } catch (error) {
        console.error("Failed to parse imported ruleset:", error);
        // Still merge but without validation in case of error
        localRuleSet.value = { ...localRuleSet.value, ...parsedRuleSet };
    }
}
</script>

<template>
    <div class="p-4">
        <ImportRuleSet
            v-model:visible="isImportDialogVisible"
            @parsed="onParsed"
        />
        <Fieldset legend="Basic Info">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="name">Name</label>
                    <InputText
                        id="name"
                        v-model="localRuleSet.name"
                        class="w-full"
                    />
                </div>
                <div>
                    <label for="type">Type</label>
                    <Select
                        id="type"
                        v-model="localRuleSet.type"
                        :options="ruleSetTypes"
                        optionLabel="label"
                        optionValue="value"
                        class="w-full"
                    />
                </div>
                <div>
                    <label for="format">Format</label>
                    <InputText
                        id="format"
                        v-model="localRuleSet.format"
                        class="w-full"
                    />
                </div>
            </div>
        </Fieldset>

        <Fieldset legend="Content" class="mt-4">
            <Textarea v-model="localRuleSet.content" class="w-full" rows="10" />
        </Fieldset>

        <Fieldset
            legend="Permissions"
            :toggleable="true"
            :collapsed="true"
            class="mt-4"
        >
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="readableBy">Readable By</label>
                    <UsersPicker
                        id="readableBy"
                        v-model="localRuleSet.readableBy"
                    />
                </div>
                <div>
                    <label for="writeableBy">Writeable By</label>
                    <UsersPicker
                        id="writeableBy"
                        v-model="localRuleSet.writeableBy"
                    />
                </div>
            </div>
        </Fieldset>

        <div class="flex justify-between mt-4">
            <Button
                label="Import"
                @click="showImportDialog"
                class="p-button-secondary"
            />
            <div class="flex">
                <Button label="Cancel" @click="cancel" class="p-button-text" />
                <Button label="Save" @click="save" />
            </div>
        </div>
    </div>
</template>
