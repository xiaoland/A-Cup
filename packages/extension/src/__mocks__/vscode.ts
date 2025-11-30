// Mock VSCode module for testing
export const commands = {
	registerCommand: (_command: string, _callback: () => void) => ({
		dispose: () => {},
	}),
	getCommands: () => Promise.resolve([]),
};

export const window = {
	showInformationMessage: () => Promise.resolve(),
	showErrorMessage: () => Promise.resolve(),
	showInputBox: () => Promise.resolve(''),
	activeTextEditor: undefined,
};

export const workspace = {
	getConfiguration: () => ({
		get: () => undefined,
	}),
};

export interface ExtensionContext {
	subscriptions: { dispose: () => void }[];
}
