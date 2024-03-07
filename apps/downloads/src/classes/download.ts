import { mdiPause, mdiDelete, mdiDownload, mdiClose, mdiFolderOpen } from '@mdi/js'

export enum DownloadState {
	complete = 'Complete',
	downloading = 'Downloading',
	paused = 'Paused',
	canceled = 'Canceled',
	error = 'Error',
	deleted = 'Deleted',
}

export default class Download {
	id: number
	name: string
	url: string
	progress: number
	progressStr: string
	resumable: boolean
	state: DownloadState

	static async get(id: string) {
		const [dl] = await chrome.downloads.search({ id: parseInt(id) })
		return new Download(dl)
	}

	get actions() {
		return [this.getOpenInFolderAction(), this.getPrimaryAction(), this.getSecondaryAction()]
	}

	constructor(dl: chrome.downloads.DownloadItem) {
		this.id = dl.id
		this.name = dl.filename.split(/[\/\\]/).pop()
		this.url = dl.url
		this.progress = (dl.bytesReceived / dl.totalBytes) * 100
		this.progressStr = getByteProgress(dl.bytesReceived, dl.totalBytes)
		this.resumable = dl.canResume
		this.state = getState(dl)
	}

	// Returns true if the current download state matches any of the given states.
	isState(...states: DownloadState[]) {
		return states.includes(this.state)
	}

	// open the downloaded file
	open(showFolder: any) {
		// future : implement open when done if chrome ever supports it. Currently can't open the download without explicit user interaction.
		if (this.state !== DownloadState.complete) return
		if (showFolder) chrome.downloads.show(this.id)
		else chrome.downloads.open(this.id)
	}

	private getOpenInFolderAction() {
		if (this.state === DownloadState.complete)
			return new Action('Open in folder', mdiFolderOpen, () => {
				chrome.downloads.show(this.id)
			})
	}

	private getPrimaryAction() {
		if (this.resumable)
			return new Action('Resume download', mdiDownload, () => {
				chrome.downloads.resume(this.id)
			})

		switch (this.state) {
			case DownloadState.downloading:
				return new Action('Pause download', mdiPause, () => {
					chrome.downloads.pause(this.id)
				})

			case DownloadState.complete:
				return new Action('Delete file', mdiDelete, () => {
					chrome.downloads.removeFile(this.id)
				})

			case DownloadState.canceled:
			case DownloadState.error:
			case DownloadState.deleted:
				return new Action('Retry download', mdiDownload, () => {
					chrome.downloads.download({ url: this.url })
				})
		}
	}

	private getSecondaryAction() {
		switch (this.state) {
			case DownloadState.downloading:
			case DownloadState.error:
			case DownloadState.paused:
				return new Action('Cancel download', mdiClose, () => {
					chrome.downloads.cancel(this.id)
				})

			case DownloadState.complete:
			case DownloadState.canceled:
			case DownloadState.deleted:
				return new Action('Clear from list', mdiClose, () => {
					chrome.downloads.erase({ id: this.id })
				})
		}
	}
}

class Action {
	description: string
	icon: string
	handler: () => any

	constructor(description: string, icon: string, handler: () => any) {
		this.description = description
		this.icon = icon
		this.handler = handler
	}
}

// Returns a promise which resolves with all current active downloads ordered by their start time.
export async function getDownloads(query = '') {
	const dls = await chrome.downloads
		.search({
			query: [query],
			orderBy: ['-startTime'],
			filenameRegex: '[\\S]+', // ignore downloads with no filename set
		})
	return dls.filter((dl) => dl.id).map((dl_1) => new Download(dl_1))
}

// Determines the current state of the given download.
function getState(dl: chrome.downloads.DownloadItem) {
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
function getByteProgress(received: number, total: number) {
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


