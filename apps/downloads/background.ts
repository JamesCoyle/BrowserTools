import { DownloadState, getDownloads } from './src/classes/download'
import Notify from './src/classes/notify'

initialize()

chrome.runtime.onStartup.addListener(() => {
	initialize()
})

// Clean local storage on install.
chrome.runtime.onInstalled.addListener(() => {
	chrome.storage.local.clear()
	initialize()
})

// Perform updates on settings changes.
chrome.storage.sync.onChanged.addListener((changes) => {
	for (const key of Object.keys(changes)) {
		switch (key) {
			case 'darkMode':
			case 'iconColor':
			case 'iconColorDark':
			case 'theme':
				setIcon()
				break

			case 'showShelf':
				setShelf()
				break
		}
	}
})

// Perform updates when download states updated.
chrome.storage.local.onChanged.addListener((changes) => {
	updateBadge()

	for (const [id, state] of Object.entries(changes)) {
		switch (state.newValue) {
			case DownloadState.downloading:
				if (!state.oldValue) Notify.started(id)
				else Notify.resumed(id)
				break

			case DownloadState.paused:
				Notify.paused(id)
				break

			case DownloadState.error:
				Notify.error(id)
				break

			case DownloadState.complete:
				Notify.complete(id)
				break

			case DownloadState.canceled:
				Notify.clear(id)
				break
		}

		if (state.oldValue === DownloadState.complete) Notify.clear(id)
	}
})

// bind notification listeners
Notify.bindListeners()

// listen for updates
chrome.downloads.onChanged.addListener(() => updateDownloads())
chrome.downloads.onErased.addListener(() => updateDownloads())

function initialize() {
	setIcon()
	setShelf()
	updateDownloads()
}

// Stores the download state of all currently active downloads to local storage.
function updateDownloads() {
	chrome.storage.local
		.get()
		.then((states) => Object.keys(states))
		.then((activeKeys) => {
			getDownloads()
				.then((items) =>
					items.filter((item) => {
						// ignore already completed items
						switch (item.state) {
							case DownloadState.complete:
							case DownloadState.canceled:
								if (!activeKeys.includes(item.id.toString())) return false
						}
						return true
					})
				)
				.then((items) => {
					const downloadStates = {}
					for (let item of items) {
						downloadStates[item.id] = item.state
					}
					chrome.storage.local.set(downloadStates)
				})
		})
}

// Updates the action icon to match current theme/icon settings.
function setIcon() {
	chrome.storage.sync.get(['darkMode', 'theme', 'iconColor', 'iconColorDark']).then(({ darkMode, theme, iconColor, iconColorDark }) => {
		const path = new Path2D('M 3 15 H 13 V 13 H 3 M 13 7 H 10 V 2 H 6 V 7 H 3 L 8 12 L 13 7 Z')
		const canvas = new OffscreenCanvas(16, 16)
		const context = canvas.getContext('2d')

		context.clearRect(0, 0, canvas.width, canvas.height)
		context.fillStyle = isIconDark(theme, darkMode) ? iconColorDark : iconColor
		context.fill(path)

		chrome.action.setIcon({ imageData: context.getImageData(0, 0, 16, 16) })
	})
}

function isIconDark(theme: string, darkMode: boolean) {
	if (theme === 'dark') return true
	if (theme === 'auto' && darkMode) return true
	return false
}

// Sets the visibility of the default Chrome downloads shelf.
function setShelf() {
	chrome.storage.sync
		.get({
			showShelf: true,
		})
		.then(({ showShelf }) => {
			try {
				chrome.downloads.setShelfEnabled(showShelf)
			} catch (e) {
				console.warn(e)
			}
		})
}

// Updates the badge shown in the toolbar.
function updateBadge() {
	chrome.storage.local.get().then((downloads) => {
		let states = Object.values(downloads)
		let text = states.length > 0 ? states.length.toString() : ''
		let color: string

		if (states.includes(DownloadState.error)) color = '#FE4134'
		else if (states.includes(DownloadState.downloading)) color = '#3369d7'
		else if (states.includes(DownloadState.paused)) color = '#FFC247'
		else color = '#33993B'

		chrome.action.setBadgeText({ text })
		chrome.action.setBadgeBackgroundColor({ color })
	})
}
