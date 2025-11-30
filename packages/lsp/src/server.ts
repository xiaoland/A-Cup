import {
	createConnection,
	type InitializeParams,
	type InitializeResult,
	ProposedFeatures,
	TextDocumentSyncKind,
	TextDocuments,
} from 'vscode-languageserver/node.js';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { getCompletions, resolveCompletionItem } from './completion.js';

// Create a connection for the server
const connection = createConnection(ProposedFeatures.all);

// Create a text document manager
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize((_params: InitializeParams): InitializeResult => {
	return {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			completionProvider: {
				resolveProvider: true,
				triggerCharacters: ['"', ':'],
			},
		},
	};
});

connection.onInitialized(() => {
	connection.console.log('Sing-box Language Server initialized');
});

// Handle completion requests
connection.onCompletion((params) => {
	const document = documents.get(params.textDocument.uri);
	if (!document) {
		return [];
	}
	return getCompletions(document, params.position);
});

// Handle completion item resolve
connection.onCompletionResolve((item) => {
	return resolveCompletionItem(item);
});

// Listen on the connection
documents.listen(connection);
connection.listen();

export { connection, documents };
