import Download from './download'

export default class Notify {
	static type = {
		started: 'onStart',
		paused: 'onPause',
		resumed: 'onResume',
		error: 'onError',
		complete: 'onComplete',
	}

	static started(id) {
		showNotification(Notify.type.started, id, {
			message: 'Download started.',
		})
	}

	static paused(id) {
		showNotification(Notify.type.paused, id, {
			message: 'Download paused.',
			requireInteraction: true,
		})
	}

	static resumed(id) {
		showNotification(Notify.type.resumed, id, {
			message: 'Download has resumed.',
		})
	}

	static error(id) {
		showNotification(Notify.type.error, id, {
			message: 'An error occured while downloading.',
			requireInteraction: true,
		})
	}

	static complete(id) {
		showNotification(Notify.type.complete, id, {
			message: 'Download completed.',
		})
	}

	static clear(id) {
		permissionGranted().then(() => {
			chrome.notifications.clear(id.toString())
		})
	}

	static bindListeners() {
		permissionGranted()
			.then(() => {
				// future : have notification click show popup when chrome implements it
				// chrome.notifications.onClicked.addListener(() => {
				// 	chrome.action.openPopup()
				// })
				chrome.notifications.onButtonClicked.addListener((id, index) => {
					Download.get(id).then((download) => {
						download.actions[index].handler()
					})
				})
			})
			.catch(() => {})
	}
}

function showNotification(type, id, options = {}) {
	Promise.all([permissionGranted(), settingEnabled(type, id)])
		.then(() => {
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
		})
		.catch(() => {})
}

// Checks if the user has granted the notification permission.
function permissionGranted() {
	return chrome.permissions.contains({ permissions: ['notifications'] }).then((allowed) => {
		if (!allowed) throw new Error('Notification permission not granted')
	})
}

// Checks if notifications are enabled for the given type.
function settingEnabled(type, id) {
	return chrome.storage.sync.get('notify').then(({ notify }) => {
		if (notify[type] === true) return

		// Clear notification if current style not enabled.
		Notify.clear(id)

		throw new Error('Notification type not enabled (' + type + ')')
	})
}
