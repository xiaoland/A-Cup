import {
	createConnection,
	type InitializeParams,
	type InitializeResult,
	ProposedFeatures,
	TextDocumentSyncKind,
	TextDocuments,
} from 'vscode-languageserver/node.js';
import { TextDocument } from 'vscode-languageserver-textdocument';

// Create a connection for the server
const connection = createConnection(ProposedFeatures.all);

// Create a text document manager
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize((_params: InitializeParams): InitializeResult => {
	return {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			// Add more capabilities as needed
			completionProvider: {
				resolveProvider: true,
			},
		},
	};
});

connection.onInitialized(() => {
	connection.console.log('Sing-box Language Server initialized');
});

// Listen on the connection
documents.listen(connection);
connection.listen();

export { connection, documents };
