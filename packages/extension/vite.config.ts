import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/extension.ts'),
			formats: ['cjs'],
			fileName: () => 'extension.js',
		},
		outDir: 'dist',
		rollupOptions: {
			external: ['vscode'],
			output: {
				globals: {
					vscode: 'vscode',
				},
			},
		},
		sourcemap: true,
		minify: false,
	},
});
