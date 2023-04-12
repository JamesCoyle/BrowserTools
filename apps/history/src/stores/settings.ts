import { writable } from 'svelte/store'

function subscribe(store, key, value) {
	if (value !== undefined) store.set(value)
	store.subscribe((val) => {
		chrome.storage.sync.set({ [key]: val })
	})
}

export const theme = writable('auto')
export const iconColor = writable('#3369d7')
export const defaultIconColor = writable('#3369d7')

// Populate stores with values from chrome storage
chrome.storage.sync.get(['theme', 'iconColor', 'defaultIconColor']).then((items) => {
	subscribe(theme, 'theme', items.theme)
	subscribe(iconColor, 'iconColor', items.iconColor)
	subscribe(defaultIconColor, 'defaultIconColor', items.defaultIconColor)
})
