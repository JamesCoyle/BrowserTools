import { resolve } from 'path'
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [svelte()],
	base: '',
	build: {
		rollupOptions: {
			input: [resolve(__dirname, 'popup.html'), resolve(__dirname, 'sidePanel.html'), resolve(__dirname, 'options.html')],
		},
	},
})
