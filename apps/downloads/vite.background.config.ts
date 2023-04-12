import { resolve } from 'path'
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [svelte()],
	base: '',
	build: {
		emptyOutDir: false,
		rollupOptions: {
			input: resolve(__dirname, 'background.ts'),
			output: {
				entryFileNames: "[name].js"
			}
		},
	}
})
