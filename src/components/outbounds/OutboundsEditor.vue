<template>
    <MonacoEditor
        language="json"
        :options="{ automaticLayout: true, minimap: { enabled: false } }"
        :value="outboundsJson"
        path="./outbounds.json"
        @change="(value: string) => (model = JSON.parse(value))"
        @mount="onEditorDidMount"
        height="400px"
    />
</template>

<script setup lang="ts">
import MonacoEditor from "@guolao/vue-monaco-editor";
import { computed } from "vue";
import { Outbound } from "@black-duty/sing-box-schema";

const model = defineModel("modelValue", {
    type: Array as () => Outbound[],
    required: true,
});

const outboundsJson = computed(() => JSON.stringify(model.value, null, 2));

const onEditorDidMount = async (editor: any, monaco: any) => {
    const response = await fetch("/outbounds.json");
    const outboundsSchema = await response.json();
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [
            {
                uri: "outbounds-schema.json",
                fileMatch: [editor.getModel().uri.toString()],
                schema: outboundsSchema,
            },
        ],
    });
};
</script>

<style scoped>
/* Add styles if needed */
</style>
