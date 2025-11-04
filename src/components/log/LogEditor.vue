<template>
    <MonacoEditor
        language="json"
        :options="{ automaticLayout: true, minimap: { enabled: false } }"
        :value="logJson"
        path="./log.json"
        @change="(value: string) => (model = JSON.parse(value))"
        @mount="onEditorDidMount"
        height="400px"
    />
</template>

<script setup lang="ts">
import MonacoEditor from "@guolao/vue-monaco-editor";
import { computed } from "vue";
import type { Log } from "~/schemas/log";

const model = defineModel("modelValue", {
    type: Object as () => Log | undefined,
    required: true,
});

const logJson = computed(() => JSON.stringify(model.value || {}, null, 2));

const onEditorDidMount = async (editor: any, monaco: any) => {
    const response = await fetch("/log.json");
    const logSchema = await response.json();
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [
            {
                uri: "log-schema.json",
                fileMatch: [editor.getModel().uri.toString()],
                schema: logSchema,
            },
        ],
    });
};
</script>

<style scoped>
/* Add styles if needed */
</style>
