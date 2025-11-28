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
import type * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import { computed, ref, toRefs } from "vue";
import type { SingBoxOutbound } from "~/schemas/singbox";
import { useUserStore } from "@/stores/user";
import { useValueCompletion } from "@/composables/useMonacaEditor";

const props = defineProps<{
    outboundTags?: string[];
}>();

const { outboundTags } = toRefs(props);

const model = defineModel("modelValue", {
    type: Array as () => SingBoxOutbound[],
    required: true,
});

const outboundsJson = computed(() => JSON.stringify(model.value, null, 2));

const users = ref<{ id: string; username: string }[]>([]);

const keypairs = ref<
    { id: string; publicKey: string; privateKey: string; createdAt: number }[]
>([]);

const onEditorDidMount = async (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor,
) => {
    const response = await fetch("/outbounds.json");
    const outboundsSchema = await response.json();
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [
            {
                uri: "outbounds-schema.json",
                fileMatch: ["./outbounds.json"],
                schema: outboundsSchema,
            },
        ],
    });

    // Fetch users for dynamic Intellisense
    const userStore = useUserStore();
    try {
        users.value =
            await userStore.authorizedRequest<
                { id: string; username: string }[]
            >("/api/users");
    } catch (error) {
        console.error("Failed to fetch users for Intellisense:", error);
    }

    // Fetch existing keypairs for dynamic Intellisense
    try {
        keypairs.value = await userStore.authorizedRequest<
            {
                id: string;
                publicKey: string;
                privateKey: string;
                createdAt: number;
            }[]
        >("/api/shared/wg_keypairs");
    } catch (error) {
        console.error(
            "Failed to fetch WireGuard keypairs for Intellisense:",
            error,
        );
    }

    const completionMap = {
        uuid: (
            lineContent: string,
            position: monacoEditor.IPosition,
            _model: monacoEditor.editor.ITextModel,
        ) => {
            const colonIndex = lineContent.indexOf(":");
            const quoteStart = lineContent.indexOf('"', colonIndex);

            return {
                suggestions: users.value.map((user) => {
                    let insertText = user.id;
                    if (!(position.column === quoteStart + 2)) {
                        insertText = `"${user.id}"`;
                    } else if (position.column === colonIndex) {
                        insertText = ` "${user.id}"`;
                    }

                    return {
                        label: `User: ${user.username}`,
                        kind: monaco.languages.CompletionItemKind.Value,
                        insertText,
                        documentation: `UUID of user ${user.username}`,
                        range: monaco.Range.fromPositions(position, position),
                    };
                }),
            };
        },
        public_key: (
            lineContent: string,
            position: monacoEditor.IPosition,
            _model: monacoEditor.editor.ITextModel,
        ) => {
            const colonIndex = lineContent.indexOf(":");
            const quoteStart = lineContent.indexOf('"', colonIndex);

            const suggestions: monacoEditor.languages.CompletionItem[] = [];

            // Add existing keypairs
            keypairs.value.forEach(
                (keypair: {
                    id: string;
                    publicKey: string;
                    privateKey: string;
                    createdAt: number;
                }) => {
                    let insertText = keypair.publicKey;
                    if (!(position.column === quoteStart + 2)) {
                        insertText = `"${keypair.publicKey}"`;
                    } else if (position.column === colonIndex) {
                        insertText = ` "${keypair.publicKey}"`;
                    }

                    suggestions.push({
                        label: `$(key) ${keypair.id.substring(0, 8)}...`,
                        kind: monaco.languages.CompletionItemKind.Value,
                        insertText,
                        documentation: `Public key created at ${new Date(keypair.createdAt).toLocaleString()}`,
                        range: monaco.Range.fromPositions(position, position),
                        sortText: `1_${keypair.createdAt}`,
                    } as any);
                },
            );

            return {
                suggestions,
            };
        },
        // outbounds field in selector/urltest - suggest available outbound tags
        outbounds: (
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
        // default field in selector - suggest available outbound tags
        default: (
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
                        label: `Default: ${tag}`,
                        kind: monaco.languages.CompletionItemKind.Reference,
                        insertText,
                        documentation: `Set default outbound to "${tag}"`,
                        range: monaco.Range.fromPositions(position, position),
                    };
                }),
            };
        },
        // detour field in outbounds - suggest available outbound tags
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
