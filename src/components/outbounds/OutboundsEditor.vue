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
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import { computed, ref } from "vue";
import { Outbound } from "@black-duty/sing-box-schema";
import { useUserStore } from "@/stores/user";

const model = defineModel("modelValue", {
    type: Array as () => Outbound[],
    required: true,
});

const outboundsJson = computed(() => JSON.stringify(model.value, null, 2));

const users = ref<{ id: string; username: string }[]>([]);

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

    // Register completion provider for dynamic uuid suggestions
    monaco.languages.registerCompletionItemProvider("json", {
        provideCompletionItems: (model, position) => {
            const lineContent = model.getLineContent(position.lineNumber);
            const textUntilPosition = model.getValueInRange({
                startLineNumber: position.lineNumber,
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
            });
            // Relax condition to trigger when in uuid field
            if (textUntilPosition.includes('"uuid":')) {
                // Determine if cursor is inside the value string
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
                        };
                    }),
                };
            }
            return { suggestions: [] };
        },
    });

    editor.onDidChangeModelContent((e) => {
        const model = editor.getModel();
        const pos = editor.getPosition();
        const line = model.getLineContent(pos.lineNumber);

        // 仅当光标位于 "uuid": "" 的值内时触发补全
        const match = line.match(/"uuid"\s*:\s*""/);
        if (match) {
            const colonIndex = line.indexOf(":");
            const quoteIndex = line.indexOf('"', colonIndex);
            if (pos.column > quoteIndex) {
                setTimeout(() => {
                    editor.trigger("", "editor.action.triggerSuggest", {});
                }, 100);
            }
        }
    });
};
</script>

<style scoped>
/* Add styles if needed */
</style>
