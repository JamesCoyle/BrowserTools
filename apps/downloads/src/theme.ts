import { settings } from './store'
const { theme } = settings

theme.subscribe((val) => {
	document.body.classList.remove(...document.body.classList)
	document.body.classList.add(`theme-${val}`)
})