import * as assert from 'node:assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Commands should be registered', async () => {
		const commands = await vscode.commands.getCommands(true);
		assert.ok(commands.includes('a-cup.uploadToOSS'));
		assert.ok(commands.includes('a-cup.downloadFromOSS'));
	});
});
