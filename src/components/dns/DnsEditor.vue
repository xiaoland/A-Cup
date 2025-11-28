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
import type * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import { computed, toRefs } from "vue";
import type { Dns } from "~/schemas/dns";
import { useValueCompletion } from "@/composables/useMonacaEditor";

const props = defineProps<{
    inboundTags?: string[];
    outboundTags?: string[];
}>();

const { inboundTags, outboundTags } = toRefs(props);

const model = defineModel("modelValue", {
    type: Object as () => Dns,
    required: true,
});

const dnsJson = computed(() => JSON.stringify(model.value, null, 2));

// Computed property to get DNS server tags from current model
const dnsServerTags = computed(() => {
    return (model.value?.servers || [])
        .map((server: { tag?: string }) => server.tag)
        .filter((tag): tag is string => !!tag);
});

const onEditorDidMount = async (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor,
) => {
    const response = await fetch("/dns.json");
    const dnsSchema = await response.json();
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [
            {
                uri: "dns-schema.json",
                fileMatch: [editor.getModel()!.uri.toString()],
                schema: dnsSchema,
            },
        ],
    });

    // Build completion map for dynamic fields
    const completionMap = {
        // server field in DNS rules - suggest available DNS server tags
        server: (
            lineContent: string,
            position: monacoEditor.IPosition,
            _model: monacoEditor.editor.ITextModel,
        ) => {
            const colonIndex = lineContent.indexOf(":");
            const quoteStart = lineContent.indexOf('"', colonIndex);

            const tags = dnsServerTags.value;
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
        // inbound field in DNS rules - suggest available inbound tags
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
        // final field in DNS - suggest available DNS server tags
        final: (
            lineContent: string,
            position: monacoEditor.IPosition,
            _model: monacoEditor.editor.ITextModel,
        ) => {
            const colonIndex = lineContent.indexOf(":");
            const quoteStart = lineContent.indexOf('"', colonIndex);

            const tags = dnsServerTags.value;
            return {
                suggestions: tags.map((tag) => {
                    let insertText = tag;
                    if (!(position.column === quoteStart + 2)) {
                        insertText = `"${tag}"`;
                    } else if (position.column === colonIndex) {
                        insertText = ` "${tag}"`;
                    }

                    return {
                        label: `Default server: ${tag}`,
                        kind: monaco.languages.CompletionItemKind.Reference,
                        insertText,
                        documentation: `Set default DNS server to "${tag}"`,
                        range: monaco.Range.fromPositions(position, position),
                    };
                }),
            };
        },
        // detour field in DNS servers - suggest available outbound tags
        detour: (
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
                        label: `Detour via: ${tag}`,
                        kind: monaco.languages.CompletionItemKind.Reference,
                        insertText,
                        documentation: `Use outbound "${tag}" as upstream detour`,
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
