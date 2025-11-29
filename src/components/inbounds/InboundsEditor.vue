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
import type * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import { computed, ref } from "vue";
import type { Inbound } from "~/schemas/inbound";
import { useUserStore } from "@/stores/user";
import { useValueCompletion } from "@/composables/useMonacaEditor";
import { generateKeypair } from "~/utils/wireguard";

const model = defineModel("modelValue", {
    type: Array as () => Inbound[],
    required: true,
});

const inboundsJson = computed(() => JSON.stringify(model.value, null, 2));

const keypairs = ref<
    { id: string; publicKey: string; privateKey: string; createdAt: number }[]
>([]);

const onEditorDidMount = async (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor,
) => {
    const response = await fetch("/inbounds.json");
    const inboundsSchema = await response.json();
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [
            {
                uri: "inbounds-schema.json",
                fileMatch: ["./inbounds.json"],
                schema: inboundsSchema,
            },
        ],
    });

    // Fetch existing keypairs for dynamic Intellisense
    const userStore = useUserStore();
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
        private_key: (
            lineContent: string,
            position: monacoEditor.IPosition,
            model: monacoEditor.editor.ITextModel,
        ) => {
            const colonIndex = lineContent.indexOf(":");
            const quoteStart = lineContent.indexOf('"', colonIndex);

            const suggestions: monacoEditor.languages.CompletionItem[] = [];

            // Add "generate new" option
            suggestions.push({
                label: "$(refresh) Generate new keypair",
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: '""',
                sortText: "0_generate",
                documentation: "Generate a new WireGuard keypair and save it",
                range: monaco.Range.fromPositions(position, position),
                command: {
                    id: "editor.action.triggerSuggest",
                    title: "Trigger Suggest",
                },
                resolveKey: "generate_wg_keypair",
            } as any);

            // Add existing keypairs
            keypairs.value.forEach(
                (keypair: {
                    id: string;
                    publicKey: string;
                    privateKey: string;
                    createdAt: number;
                }) => {
                    let insertText = keypair.privateKey;
                    if (!(position.column === quoteStart + 2)) {
                        insertText = `"${keypair.privateKey}"`;
                    } else if (position.column === colonIndex) {
                        insertText = ` "${keypair.privateKey}"`;
                    }

                    suggestions.push({
                        label: `$(key) ${keypair.id.substring(0, 8)}...`,
                        kind: monaco.languages.CompletionItemKind.Value,
                        insertText,
                        documentation: `Private key created at ${new Date(keypair.createdAt).toLocaleString()}`,
                        range: monaco.Range.fromPositions(position, position),
                        sortText: `1_${keypair.createdAt}`,
                    } as any);
                },
            );

            return {
                suggestions,
            };
        },
    };

    const resolveMap = {
        generate_wg_keypair: async (
            item: monacoEditor.languages.CompletionItem,
        ): Promise<monacoEditor.languages.CompletionItem> => {
            try {
                const keypair = generateKeypair();
                const userStore = useUserStore();

                // Save to backend
                const savedKeypair = await userStore.authorizedRequest<{
                    id: string;
                    publicKey: string;
                    privateKey: string;
                    createdAt: number;
                }>("/api/shared/wg_keypairs", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        publicKey: keypair.publicKey,
                        privateKey: keypair.privateKey,
                    }),
                });

                // Add to local cache
                keypairs.value.push(savedKeypair);

                // Update the completion item with the actual private key
                return {
                    ...item,
                    insertText: `"${keypair.privateKey}"`,
                    label: `$(key) Generated: ${keypair.publicKey.substring(0, 8)}...`,
                    documentation: `Generated keypair - Public: ${keypair.publicKey}`,
                };
            } catch (error) {
                console.error("Failed to generate WireGuard keypair:", error);
                return item;
            }
        },
    };

    const { onMount } = useValueCompletion(completionMap, resolveMap);
    onMount(editor, monaco);
};
</script>

<style scoped>
/* Add styles if needed */
</style>
