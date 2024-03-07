import Download from './download'

export default class Notify {
	static type = {
		started: 'onStart',
		paused: 'onPause',
		resumed: 'onResume',
		error: 'onError',
		complete: 'onComplete',
	}

	static started(id: string) {
		showNotification(Notify.type.started, id, {
			message: 'Download started.',
		})
	}

	static paused(id: string) {
		showNotification(Notify.type.paused, id, {
			message: 'Download paused.',
			requireInteraction: true,
		})
	}

	static resumed(id: string) {
		showNotification(Notify.type.resumed, id, {
			message: 'Download has resumed.',
		})
	}

	static error(id: string) {
		showNotification(Notify.type.error, id, {
			message: 'An error occured while downloading.',
			requireInteraction: true,
		})
	}

	static complete(id: string) {
		showNotification(Notify.type.complete, id, {
			message: 'Download completed.',
		})
	}

	static async clear(id: string) {
		if (!await permissionGranted()) return
		chrome.notifications.clear(id.toString())
	}

	static async bindListeners() {
		if (!await permissionGranted()) return

		// future : have notification click show popup when chrome implements it
		// chrome.notifications.onClicked.addListener(() => {
		// 	chrome.action.openPopup()
		// })
		chrome.notifications.onButtonClicked.addListener((id, index) => {
			Download.get(id).then((download) => {
				download.actions[index].handler()
			})
		})

	}
}

async function showNotification(type: string, id: string, options = {}) {
	if (!await permissionGranted()) return
	if (!await settingEnabled(type)) return

	Download.get(id).then((download) => {
		chrome.notifications.create(id.toString(), {
			type: 'basic',
			title: download.name,
			message: '',
			contextMessage: download.progressStr.split('/').pop(),
			iconUrl: '../icon.png',
			buttons: download.actions.map((action) => {
				return { title: action.description }
			}),

			...options,
		})
	})

}

// Checks if the user has granted the notification permission.
function permissionGranted() {
	return chrome.permissions.contains({ permissions: ['notifications'] })
}

// Checks if notifications are enabled for the given type.
async function settingEnabled(type: string) {
	const { notify } = await chrome.storage.sync.get('notify')
	return notify[type]
}
