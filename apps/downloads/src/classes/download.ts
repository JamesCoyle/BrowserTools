import { mdiPause, mdiDelete, mdiDownload, mdiClose } from '@mdi/js'

export enum DownloadState {
	complete,
	downloading,
	paused,
	canceled,
	error,
	deleted,
}

export default class Download {
	id: number
	name: string
	url: string
	progress: number
	progressStr: string
	resumable: boolean
	state: DownloadState

	static get(id) {
		return chrome.downloads.search({ id: parseInt(id) }).then(([dl]) => new Download(dl))
	}

	get actions() {
		return [getPrimaryAction(this), getSecondaryAction(this)]
	}

	constructor(dl) {
		this.id = dl.id
		this.name = dl.filename.split(/[\/\\]/).pop()
		this.url = dl.url
		this.progress = (dl.bytesReceived / dl.totalBytes) * 100
		this.progressStr = getByteProgress(dl.bytesReceived, dl.totalBytes)
		this.resumable = dl.canResume
		this.state = getState(dl)
	}

	// Returns true if the current download state matches any of the given states.
	isState(...states) {
		return states.includes(this.state)
	}

	// open the downloaded file
	open(showFolder) {
		// future : implement open when done if chrome ever supports it. Currently can't open the download without explicit user interaction.
		if (this.state !== DownloadState.complete) return
		if (showFolder) chrome.downloads.show(this.id)
		else chrome.downloads.open(this.id)
	}
}

class Action {
	description: string
	icon: string
	handler: () => void

	constructor(description, icon, handler) {
		this.description = description
		this.icon = icon
		this.handler = handler
	}
}

// Returns a promise which resolves with all current active downloads ordered by their start time.
export function getDownloads(query = '') {
	return chrome.downloads
		.search({
			query: [query],
			orderBy: ['-startTime'],
			filenameRegex: '[\\S]+', // ignore downloads with no filename set
		})
		.then((dls) => dls.filter((dl) => dl.id).map((dl) => new Download(dl)))
}

// Determines the current state of the given download.
function getState(dl) {
	if (!dl.exists) return DownloadState.deleted

	if (dl.error) {
		if (dl.error === 'USER_CANCELED') return DownloadState.canceled
		return DownloadState.error
	}

	if (dl.endTime) return DownloadState.complete

	if (dl.paused) return DownloadState.paused

	return DownloadState.downloading
}

// Returns the byte progress of the download as a scaled string value.
function getByteProgress(received, total) {
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
	const k = 1024
	let i: number = 0
	let r: string
	let t: string

	if (total !== 0) {
		i = Math.floor(Math.log(total) / Math.log(k))
		r = (received / Math.pow(k, i)).toFixed(1)
		t = (total / Math.pow(k, i)).toFixed(1)
	}

	return r + '/' + t + ' ' + sizes[i]
}

function getPrimaryAction(dl) {
	if (dl.resumable)
		return new Action('Resume', mdiDownload, () => {
			chrome.downloads.resume(dl.id)
		})

	switch (dl.state) {
		case DownloadState.downloading:
			return new Action('Pause', mdiPause, () => {
				chrome.downloads.pause(dl.id)
			})

		case DownloadState.complete:
			return new Action('Delete', mdiDelete, () => {
				chrome.downloads.removeFile(dl.id)
			})

		case DownloadState.canceled:
		case DownloadState.error:
		case DownloadState.deleted:
			return new Action('Retry', mdiDownload, () => {
				chrome.downloads.download({ url: dl.url })
			})
	}
}

function getSecondaryAction(dl) {
	switch (dl.state) {
		case DownloadState.downloading:
		case DownloadState.error:
		case DownloadState.paused:
			return new Action('Cancel', mdiClose, () => {
				chrome.downloads.cancel(dl.id)
			})

		case DownloadState.complete:
		case DownloadState.canceled:
		case DownloadState.deleted:
			return new Action('Clear', mdiClose, () => {
				chrome.downloads.erase({ id: dl.id })
			})
	}
}
