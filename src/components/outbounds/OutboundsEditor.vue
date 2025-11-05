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
import { computed, ref } from "vue";
import { Outbound } from "@black-duty/sing-box-schema";
import { useUserStore } from "@/stores/user";
import { useValueCompletion } from "@/composables/useMonacaEditor";

const model = defineModel("modelValue", {
    type: Array as () => Outbound[],
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
            model: monacoEditor.editor.ITextModel,
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
            model: monacoEditor.editor.ITextModel,
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
    };

    const { onMount } = useValueCompletion(completionMap);
    onMount(editor, monaco);
};
</script>

<style scoped>
/* Add styles if needed */
</style>
