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

export const settings = {
	theme: writable('auto'),
	iconColor: writable(defaultIconColors.light),
	iconColorDark: writable(defaultIconColors.dark),
	showShelf: writable(false),
	notify: writable({ onStart: false, onPause: false, onResume: false, onError: false, onComplete: false }),
}

// Populate stores with values from chrome storage
chrome.storage.sync.get(['darkMode', 'theme', 'iconColor', 'iconColorDark', 'showShelf', 'notify']).then((items) => {
	subscribe(darkMode, 'darkMode', items.darkMode)

	subscribe(settings.theme, 'theme', items.theme)
	subscribe(settings.iconColor, 'iconColor', items.iconColor)
	subscribe(settings.iconColorDark, 'iconColorDark', items.iconColorDark)
	subscribe(settings.showShelf, 'showShelf', items.showShelf)
	subscribe(settings.notify, 'notify', items.notify)
})

chrome.storage.onChanged.addListener((changes) => {
	for (const item in changes) {
		settings[item].set(changes[item].newValue)
	}
})