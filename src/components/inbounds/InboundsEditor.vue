<template>
    <MonacoEditor
        language="json"
        :options="{ automaticLayout: true, minimap: { enabled: false } }"
        :value="inboundsJson"
        path="./inbounds.json"
        @change="(value: string) => (model = JSON.parse(value))"
        @mount="onEditorDidMount"
        height="400px"
    />
</template>

<script setup lang="ts">
import MonacoEditor from "@guolao/vue-monaco-editor";
import { computed } from "vue";
import { Inbound } from "@black-duty/sing-box-schema";

const model = defineModel("modelValue", {
    type: Array as () => Inbound[],
    required: true,
});

const inboundsJson = computed(() => JSON.stringify(model.value, null, 2));

const onEditorDidMount = async (editor: any, monaco: any) => {
    const response = await fetch("/inbounds.json");
    const inboundsSchema = await response.json();
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [
            {
                uri: "inbounds-schema.json",
                fileMatch: [editor.getModel().uri.toString()],
                schema: inboundsSchema,
            },
        ],
    });
};
</script>

<style scoped>
/* Add styles if needed */
</style>
