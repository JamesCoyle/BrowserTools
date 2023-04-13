import "ui/global.css"

import Options from './Options.svelte'
import { darkMode } from './stores/settings'

const app = new Options({
	target: document.getElementById('app'),
})


const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)')

console.log('Dark:', isDarkMode.matches)

darkMode.set(isDarkMode.matches)
isDarkMode.addEventListener('change', (e) => {
	darkMode.set(e.matches)
})

export default app
