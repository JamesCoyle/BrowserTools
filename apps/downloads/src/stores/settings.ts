import { writable } from 'svelte/store'

function subscribe(store, key, value) {
	if (value !== undefined) store.set(value)
	store.subscribe((val) => {
		chrome.storage.sync.set({ [key]: val })
	})
}

export const defaultIconColors = {
	light: '#5f6368',
	dark: '#f1f3f4',
}

export const darkMode = writable(false)

export const showShelf = writable(false)
export const theme = writable('auto')
export const iconColor = writable(defaultIconColors.light)
export const iconColorDark = writable(defaultIconColors.dark)
export const notify = writable({ onStart: false, onPause: false, onResume: false, onError: false, onComplete: false })

// Populate stores with values from chrome storage
chrome.storage.sync.get(['darkMode', 'theme', 'iconColor', 'iconColorDark', 'showShelf', 'notify']).then((items) => {
	subscribe(darkMode, 'darkMode', items.darkMode)

	subscribe(showShelf, 'showShelf', items.showShelf)
	subscribe(theme, 'theme', items.theme)
	subscribe(iconColor, 'iconColor', items.iconColor)
	subscribe(iconColorDark, 'iconColorDark', items.iconColorDark)
	subscribe(notify, 'notify', items.notify)
})
