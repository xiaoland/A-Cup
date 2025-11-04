a-cup\src\components\route\RouteEditor.vue
<template>
    <MonacoEditor
        language="json"
        :options="{ automaticLayout: true, minimap: { enabled: false } }"
        :value="routeJson"
        path="./route.json"
        @change="(value: string) => (model = JSON.parse(value))"
        @mount="onEditorDidMount"
        height="400px"
    />
</template>

<script setup lang="ts">
import MonacoEditor from "@guolao/vue-monaco-editor";
import { computed } from "vue";
import type { Route } from "~/schemas/route";

const model = defineModel("modelValue", {
    type: Object as () => Route,
    required: true,
});

const routeJson = computed(() => JSON.stringify(model.value, null, 2));

const onEditorDidMount = async (editor: any, monaco: any) => {
    const response = await fetch("/route.json");
    const routeSchema = await response.json();
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [
            {
                uri: "route-schema.json",
                fileMatch: [editor.getModel().uri.toString()],
                schema: routeSchema,
            },
        ],
    });
};
</script>

<style scoped>
/* Add styles if needed */
</style>
