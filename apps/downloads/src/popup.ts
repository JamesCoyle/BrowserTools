import 'ui/global.css'
import "./theme"

import Popup from './Popup.svelte'
import { darkMode } from './store'

const app = new Popup({
	target: document.getElementById('app'),
})

const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)')

console.log({ isDarkMode })

darkMode.set(isDarkMode.matches)
isDarkMode.addEventListener('change', (e) => {
	darkMode.set(e.matches)
})

export default app
