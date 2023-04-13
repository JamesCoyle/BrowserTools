var k = Object.defineProperty
var H = (t, e, r) => (e in t ? k(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : (t[e] = r))
var n = (t, e, r) => (H(t, typeof e != 'symbol' ? e + '' : e, r), r)
var w = 'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z',
	B = 'M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z',
	L = 'M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z',
	C = 'M14,19H18V5H14M6,19H10V5H6V19Z',
	a = ((t) => ((t[(t.complete = 0)] = 'complete'), (t[(t.downloading = 1)] = 'downloading'), (t[(t.paused = 2)] = 'paused'), (t[(t.canceled = 3)] = 'canceled'), (t[(t.error = 4)] = 'error'), (t[(t.deleted = 5)] = 'deleted'), t))(a || {})
class m {
	constructor(e) {
		n(this, 'id')
		n(this, 'name')
		n(this, 'url')
		n(this, 'progress')
		n(this, 'progressStr')
		n(this, 'resumable')
		n(this, 'state')
		;(this.id = e.id), (this.name = e.filename.split(/[\/\\]/).pop()), (this.url = e.url), (this.progress = (e.bytesReceived / e.totalBytes) * 100), (this.progressStr = v(e.bytesReceived, e.totalBytes)), (this.resumable = e.canResume), (this.state = V(e))
	}
	static get(e) {
		return chrome.downloads.search({ id: parseInt(e) }).then(([r]) => new m(r))
	}
	get actions() {
		return [E(this), x(this)]
	}
	isState(...e) {
		return e.includes(this.state)
	}
	open(e) {
		this.state === 0 && (e ? chrome.downloads.show(this.id) : chrome.downloads.open(this.id))
	}
}
class u {
	constructor(e, r, s) {
		n(this, 'description')
		n(this, 'icon')
		n(this, 'handler')
		;(this.description = e), (this.icon = r), (this.handler = s)
	}
}
function M(t = '') {
	return chrome.downloads.search({ query: [t], orderBy: ['-startTime'], filenameRegex: '[\\S]+' }).then((e) => e.filter((r) => r.id).map((r) => new m(r)))
}
function V(t) {
	return t.exists ? (t.error ? (t.error === 'USER_CANCELED' ? 3 : 4) : t.endTime ? 0 : t.paused ? 2 : 1) : 5
}
function v(t, e) {
	const r = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
	let c = 0,
		l,
		i
	return e !== 0 && ((c = Math.floor(Math.log(e) / Math.log(1024))), (l = (t / Math.pow(1024, c)).toFixed(1)), (i = (e / Math.pow(1024, c)).toFixed(1))), l + '/' + i + ' ' + r[c]
}
function E(t) {
	if (t.resumable)
		return new u('Resume', L, () => {
			chrome.downloads.resume(t.id)
		})
	switch (t.state) {
		case 1:
			return new u('Pause', C, () => {
				chrome.downloads.pause(t.id)
			})
		case 0:
			return new u('Delete', B, () => {
				chrome.downloads.removeFile(t.id)
			})
		case 3:
		case 4:
		case 5:
			return new u('Retry', L, () => {
				chrome.downloads.download({ url: t.url })
			})
	}
}
function x(t) {
	switch (t.state) {
		case 1:
		case 4:
		case 2:
			return new u('Cancel', w, () => {
				chrome.downloads.cancel(t.id)
			})
		case 0:
		case 3:
		case 5:
			return new u('Clear', w, () => {
				chrome.downloads.erase({ id: t.id })
			})
	}
}
const d = class {
	static started(e) {
		h(d.type.started, e, { message: 'Download started.' })
	}
	static paused(e) {
		h(d.type.paused, e, { message: 'Download paused.', requireInteraction: !0 })
	}
	static resumed(e) {
		h(d.type.resumed, e, { message: 'Download has resumed.' })
	}
	static error(e) {
		h(d.type.error, e, { message: 'An error occured while downloading.', requireInteraction: !0 })
	}
	static complete(e) {
		h(d.type.complete, e, { message: 'Download completed.' })
	}
	static clear(e) {
		g().then(() => {
			chrome.notifications.clear(e.toString())
		})
	}
	static bindListeners() {
		g()
			.then(() => {
				chrome.notifications.onButtonClicked.addListener((e, r) => {
					m.get(e).then((s) => {
						s.actions[r].handler()
					})
				})
			})
			.catch(() => {})
	}
}
let o = d
n(o, 'type', { started: 'onStart', paused: 'onPause', resumed: 'onResume', error: 'onError', complete: 'onComplete' })
function h(t, e, r = {}) {
	Promise.all([g(), R(t, e)])
		.then(() => {
			m.get(e).then((s) => {
				chrome.notifications.create(e.toString(), { type: 'basic', title: s.name, message: '', contextMessage: s.progressStr.split('/').pop(), iconUrl: '../icon.png', buttons: s.actions.map((c) => ({ title: c.description })), ...r })
			})
		})
		.catch(() => {})
}
function g() {
	return chrome.permissions.contains({ permissions: ['notifications'] }).then((t) => {
		if (!t) throw new Error('Notification permission not granted')
	})
}
function R(t, e) {
	return chrome.storage.sync.get('notify').then(({ notify: r }) => {
		if (r[t] !== !0) throw (o.clear(e), new Error('Notification type not enabled (' + t + ')'))
	})
}
f()
chrome.runtime.onStartup.addListener(() => {
	f()
})
chrome.runtime.onInstalled.addListener(() => {
	chrome.storage.local.clear(), f()
})
chrome.storage.sync.onChanged.addListener((t) => {
	for (const e of Object.keys(t))
		switch (e) {
			case 'darkMode':
			case 'iconColor':
			case 'iconColorDark':
			case 'theme':
				y()
				break
			case 'showShelf':
				b()
				break
		}
})
chrome.storage.local.onChanged.addListener((t) => {
	P()
	for (const [e, r] of Object.entries(t)) {
		switch (r.newValue) {
			case a.downloading:
				r.oldValue ? o.resumed(e) : o.started(e)
				break
			case a.paused:
				o.paused(e)
				break
			case a.error:
				o.error(e)
				break
			case a.complete:
				o.complete(e)
				break
			case a.canceled:
				o.clear(e)
				break
		}
		r.oldValue === a.complete && o.clear(e)
	}
})
o.bindListeners()
chrome.downloads.onChanged.addListener(() => p())
chrome.downloads.onErased.addListener(() => p())
function f() {
	y(), b(), p()
}
function p() {
	chrome.storage.local
		.get()
		.then((t) => Object.keys(t))
		.then((t) => {
			M()
				.then((e) =>
					e.filter((r) => {
						switch (r.state) {
							case a.complete:
							case a.canceled:
								if (!t.includes(r.id.toString())) return !1
						}
						return !0
					})
				)
				.then((e) => {
					const r = {}
					for (let s of e) r[s.id] = s.state
					chrome.storage.local.set(r)
				})
		})
}
function y() {
	chrome.storage.sync.get(['darkMode', 'theme', 'iconColor', 'iconColorDark']).then(({ darkMode: t, theme: e, iconColor: r, iconColorDark: s }) => {
		const c = new Path2D('M 3 15 H 13 V 13 H 3 M 13 7 H 10 V 2 H 6 V 7 H 3 L 8 12 L 13 7 Z'),
			l = new OffscreenCanvas(16, 16),
			i = l.getContext('2d')
		i.clearRect(0, 0, l.width, l.height), (i.fillStyle = I(e, t) ? s : r), i.fill(c), chrome.action.setIcon({ imageData: i.getImageData(0, 0, 16, 16) })
	})
}
function I(t, e) {
	return !!(t === 'dark' || (t === 'auto' && e))
}
function b() {
	chrome.storage.sync.get({ showShelf: !0 }).then(({ showShelf: t }) => {
		try {
			chrome.downloads.setShelfEnabled(t), console.info('Shelf set', { showShelf: t })
		} catch (e) {
			console.warn(e)
		}
	})
}
function P() {
	chrome.storage.local.get().then((t) => {
		let e = Object.values(t),
			r = e.length > 0 ? e.length.toString() : '',
			s
		e.includes(a.error) ? (s = '#FE4134') : e.includes(a.downloading) ? (s = '#3369d7') : e.includes(a.paused) ? (s = '#FFC247') : (s = '#33993B'), chrome.action.setBadgeText({ text: r }), chrome.action.setBadgeBackgroundColor({ color: s })
	})
}
