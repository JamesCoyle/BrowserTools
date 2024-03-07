import 'ui/global.css'
import "./theme"

import Options from './Options.svelte'
import { darkMode } from './store'

const app = new Options({
	target: document.getElementById('app'),
})

const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)')

darkMode.set(isDarkMode.matches)
isDarkMode.addEventListener('change', (e) => {
	darkMode.set(e.matches)
})

export default app
