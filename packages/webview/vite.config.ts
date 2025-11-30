import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [vue()],
	build: {
		outDir: 'dist',
		rollupOptions: {
			input: resolve(__dirname, 'index.html'),
		},
	},
});
