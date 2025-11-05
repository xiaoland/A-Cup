import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";

export function useValueCompletion(
  completionMap: {
    [key: string]: (
      lineContent: string,
      position: monacoEditor.IPosition,
      model: monacoEditor.editor.ITextModel,
    ) => { suggestions: monacoEditor.languages.CompletionItem[] };
  },
  resolveMap?: {
    [key: string]: (
      item: monacoEditor.languages.CompletionItem,
    ) => Promise<monacoEditor.languages.CompletionItem>;
  },
) {
  const onMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor,
  ) => {
    // Register completion provider
    monaco.languages.registerCompletionItemProvider("json", {
      provideCompletionItems: (model, position) => {
        const lineContent = model.getLineContent(position.lineNumber);
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        for (const key in completionMap) {
          if (textUntilPosition.includes(`"${key}":`)) {
            return completionMap[key](lineContent, position, model);
          }
        }

        return { suggestions: [] };
      },
      resolveCompletionItem: async (item) => {
        // Check if this item has a resolveKey metadata
        if (
          (item as any).resolveKey &&
          resolveMap &&
          (item as any).resolveKey in resolveMap
        ) {
          const resolveKey = (item as any).resolveKey;
          return await resolveMap[resolveKey](item);
        }
        return item;
      },
    });

    // Add trigger logic for each key
    editor.onDidChangeModelContent((e) => {
      const model = editor.getModel();
      const pos = editor.getPosition();
      if (model && pos) {
        const line = model.getLineContent(pos.lineNumber);

        for (const key in completionMap) {
          const match = line.match(new RegExp(`"${key}"\\s*:\\s*""`));
          if (match) {
            const colonIndex = line.indexOf(":");
            const quoteIndex = line.indexOf('"', colonIndex);
            if (pos.column > quoteIndex) {
              setTimeout(() => {
                editor.trigger("", "editor.action.triggerSuggest", {});
              }, 100);
            }
          }
        }
      }
    });
  };

  return { onMount };
}
