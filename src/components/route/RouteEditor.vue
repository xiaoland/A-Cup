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
import type * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import { computed, toRefs } from "vue";
import type { Route } from "~/schemas/route";
import { useValueCompletion } from "@/composables/useMonacaEditor";

const props = defineProps<{
    outboundTags?: string[];
    inboundTags?: string[];
    dnsServerTags?: string[];
}>();

const { outboundTags, inboundTags, dnsServerTags } = toRefs(props);

const model = defineModel("modelValue", {
    type: Object as () => Route,
    required: true,
});

const routeJson = computed(() => JSON.stringify(model.value, null, 2));

const onEditorDidMount = async (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor,
) => {
    const response = await fetch("/route.json");
    const routeSchema = await response.json();
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [
            {
                uri: "route-schema.json",
                fileMatch: [editor.getModel()!.uri.toString()],
                schema: routeSchema,
            },
        ],
    });

    // Build completion map for dynamic fields
    const completionMap = {
        // outbound field in route rules - suggest available outbound tags
        outbound: (
            lineContent: string,
            position: monacoEditor.IPosition,
            _model: monacoEditor.editor.ITextModel,
        ) => {
            const colonIndex = lineContent.indexOf(":");
            const quoteStart = lineContent.indexOf('"', colonIndex);

            const tags = outboundTags?.value || [];
            return {
                suggestions: tags.map((tag) => {
                    let insertText = tag;
                    if (!(position.column === quoteStart + 2)) {
                        insertText = `"${tag}"`;
                    } else if (position.column === colonIndex) {
                        insertText = ` "${tag}"`;
                    }

                    return {
                        label: `Outbound: ${tag}`,
                        kind: monaco.languages.CompletionItemKind.Reference,
                        insertText,
                        documentation: `Reference to outbound with tag "${tag}"`,
                        range: monaco.Range.fromPositions(position, position),
                    };
                }),
            };
        },
        // inbound field in route rules - suggest available inbound tags
        inbound: (
            lineContent: string,
            position: monacoEditor.IPosition,
            _model: monacoEditor.editor.ITextModel,
        ) => {
            const colonIndex = lineContent.indexOf(":");
            const quoteStart = lineContent.indexOf('"', colonIndex);

            const tags = inboundTags?.value || [];
            return {
                suggestions: tags.map((tag) => {
                    let insertText = tag;
                    if (!(position.column === quoteStart + 2)) {
                        insertText = `"${tag}"`;
                    } else if (position.column === colonIndex) {
                        insertText = ` "${tag}"`;
                    }

                    return {
                        label: `Inbound: ${tag}`,
                        kind: monaco.languages.CompletionItemKind.Reference,
                        insertText,
                        documentation: `Reference to inbound with tag "${tag}"`,
                        range: monaco.Range.fromPositions(position, position),
                    };
                }),
            };
        },
        // final field in route - suggest available outbound tags
        final: (
            lineContent: string,
            position: monacoEditor.IPosition,
            _model: monacoEditor.editor.ITextModel,
        ) => {
            const colonIndex = lineContent.indexOf(":");
            const quoteStart = lineContent.indexOf('"', colonIndex);

            const tags = outboundTags?.value || [];
            return {
                suggestions: tags.map((tag) => {
                    let insertText = tag;
                    if (!(position.column === quoteStart + 2)) {
                        insertText = `"${tag}"`;
                    } else if (position.column === colonIndex) {
                        insertText = ` "${tag}"`;
                    }

                    return {
                        label: `Default outbound: ${tag}`,
                        kind: monaco.languages.CompletionItemKind.Reference,
                        insertText,
                        documentation: `Set default outbound to "${tag}"`,
                        range: monaco.Range.fromPositions(position, position),
                    };
                }),
            };
        },
        // server field in route rules (for resolve action) - suggest available DNS server tags
        server: (
            lineContent: string,
            position: monacoEditor.IPosition,
            _model: monacoEditor.editor.ITextModel,
        ) => {
            const colonIndex = lineContent.indexOf(":");
            const quoteStart = lineContent.indexOf('"', colonIndex);

            const tags = dnsServerTags?.value || [];
            return {
                suggestions: tags.map((tag) => {
                    let insertText = tag;
                    if (!(position.column === quoteStart + 2)) {
                        insertText = `"${tag}"`;
                    } else if (position.column === colonIndex) {
                        insertText = ` "${tag}"`;
                    }

                    return {
                        label: `DNS Server: ${tag}`,
                        kind: monaco.languages.CompletionItemKind.Reference,
                        insertText,
                        documentation: `Reference to DNS server with tag "${tag}"`,
                        range: monaco.Range.fromPositions(position, position),
                    };
                }),
            };
        },
        // download_detour field in rule-set - suggest available outbound tags
        download_detour: (
            lineContent: string,
            position: monacoEditor.IPosition,
            _model: monacoEditor.editor.ITextModel,
        ) => {
            const colonIndex = lineContent.indexOf(":");
            const quoteStart = lineContent.indexOf('"', colonIndex);

            const tags = outboundTags?.value || [];
            return {
                suggestions: tags.map((tag) => {
                    let insertText = tag;
                    if (!(position.column === quoteStart + 2)) {
                        insertText = `"${tag}"`;
                    } else if (position.column === colonIndex) {
                        insertText = ` "${tag}"`;
                    }

                    return {
                        label: `Download via: ${tag}`,
                        kind: monaco.languages.CompletionItemKind.Reference,
                        insertText,
                        documentation: `Use outbound "${tag}" to download rule-set`,
                        range: monaco.Range.fromPositions(position, position),
                    };
                }),
            };
        },
    };

    const { onMount } = useValueCompletion(completionMap);
    onMount(editor, monaco);
};
</script>

<style scoped>
/* Add styles if needed */
</style>
