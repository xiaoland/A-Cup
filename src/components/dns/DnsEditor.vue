<template>
    <MonacoEditor
        language="json"
        :options="{ automaticLayout: true, minimap: { enabled: false } }"
        :value="dnsJson"
        path="./dns.json"
        @change="(value: string) => (model = JSON.parse(value))"
        @mount="onEditorDidMount"
        height="400px"
    />
</template>

<script setup lang="ts">
import MonacoEditor from "@guolao/vue-monaco-editor";
import { computed } from "vue";
import { DNSOptions } from "@black-duty/sing-box-schema";

const model = defineModel("modelValue", {
    type: Object as () => DNSOptions,
    required: true,
});

const dnsJson = computed(() => JSON.stringify(model.value, null, 2));

const onEditorDidMount = async (editor: any, monaco: any) => {
    const response = await fetch("/dns.json");
    const dnsSchema = await response.json();
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [
            {
                uri: "dns-schema.json",
                fileMatch: [editor.getModel().uri.toString()],
                schema: dnsSchema,
            },
        ],
    });
};
</script>

<style scoped>
/* Add styles if needed */
</style>
