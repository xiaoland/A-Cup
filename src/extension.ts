import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('A-Cup extension is now active');

	// Register upload command
	const uploadToOSSCommand = vscode.commands.registerCommand('a-cup.uploadToOSS', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor');
			return;
		}

		const config = vscode.workspace.getConfiguration('a-cup.oss');
		const endpoint = config.get<string>('endpoint');
		const accessKeyId = config.get<string>('accessKeyId');
		const accessKeySecret = config.get<string>('accessKeySecret');
		const bucket = config.get<string>('bucket');

		if (!endpoint || !accessKeyId || !accessKeySecret || !bucket) {
			vscode.window.showErrorMessage('Please configure OSS settings in extension settings');
			return;
		}

		const content = editor.document.getText();
		const fileName = editor.document.fileName.split('/').pop() || 'profile.json';

		// TODO: Implement actual OSS upload logic
		vscode.window.showInformationMessage(`Upload to OSS: ${fileName} (${content.length} bytes)`);
	});

	// Register download command
	const downloadFromOSSCommand = vscode.commands.registerCommand('a-cup.downloadFromOSS', async () => {
		const config = vscode.workspace.getConfiguration('a-cup.oss');
		const endpoint = config.get<string>('endpoint');
		const accessKeyId = config.get<string>('accessKeyId');
		const accessKeySecret = config.get<string>('accessKeySecret');
		const bucket = config.get<string>('bucket');

		if (!endpoint || !accessKeyId || !accessKeySecret || !bucket) {
			vscode.window.showErrorMessage('Please configure OSS settings in extension settings');
			return;
		}

		const fileName = await vscode.window.showInputBox({
			prompt: 'Enter the file name to download from OSS',
			placeHolder: 'profile.json'
		});

		if (!fileName) {
			return;
		}

		// TODO: Implement actual OSS download logic
		vscode.window.showInformationMessage(`Download from OSS: ${fileName}`);
	});

	context.subscriptions.push(uploadToOSSCommand, downloadFromOSSCommand);
}

export function deactivate() {}
