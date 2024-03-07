<script lang="ts">
	import SearchHeader from './components/search-header.svelte'
	import DownloadItem from './components/download-item.svelte'
	import BottomButton from './components/bottom-button.svelte'

	import type Download from './classes/download'
	import { DownloadState, getDownloads } from './classes/download'

	import { mdiDownload } from '@mdi/js'

	let downloads: Download[] = []
	let activeDownloadStates: { [id: string]: DownloadState } = {}
	let query = ''

	$: updateDownloads()

	// listen for updates
	chrome.downloads.onChanged.addListener(() => updateDownloads())
	chrome.downloads.onErased.addListener(() => updateDownloads())
	chrome.storage.local.onChanged.addListener(() => updateDownloads())

	function updateDownloads() {
		// fetch downloads
		getDownloads(query).then((items: Download[]) => {
			let ids = []

			// get completed download ids
			for (let item of items) {
				if (item.isState(DownloadState.complete, DownloadState.canceled, DownloadState.deleted)) ids.push(item.id.toString())
			}

			// remove completed downloads from localstorage
			chrome.storage.local.remove(ids)

			// update download list
			downloads = items
		})

		// fetch download states
		chrome.storage.local.get().then((dlStates: { [id: string]: DownloadState }) => {
			activeDownloadStates = dlStates

			// poll for updates if any download is currently downloading
			if (Object.values(activeDownloadStates).includes(DownloadState.downloading)) setTimeout(() => updateDownloads(), 500)
		})
	}

	function openTab() {
		chrome.tabs.create({ url: 'chrome://downloads' })
	}

	// mockup UI data for screenshots
	// todo : update this to work for downloads
	// window.mockup = function () {
	// downloads = [
	// { id: '6321', lastVisitTime: 1665857823386.354, title: 'History Viewer Settings', typedCount: 3, url: 'chrome-extension://nfpokahblifhkfceaanoegmmhmkgjgcc/options.html', visitCount: 9 },
	// { id: '6304', lastVisitTime: 1665857788303.885, title: 'GitHub: Where the world builds software · GitHub', typedCount: 0, url: 'https://github.com/', visitCount: 75 },
	// { id: '8142', lastVisitTime: 1665857639237.5159, title: 'API Reference - Chrome Developers', typedCount: 0, url: 'https://developer.chrome.com/docs/extensions/reference/', visitCount: 1 },
	// { id: '2134', lastVisitTime: 1665857569582.574, title: 'Stack Overflow - Where Developers Learn, Share, &amp; Build Careers', typedCount: 0, url: 'https://stackoverflow.com/', visitCount: 27 },
	// { id: '8141', lastVisitTime: 1665857561294.737, title: 'how to make chrome extensions - Google Search', typedCount: 0, url: 'https://www.google.com/search?q=how+to+make+chrome+extensions&amp;rlz=1C1ONGR_en-GBGB968GB968&amp;oq=how+to+make+chrome+extensions&amp;aqs=chrome..69i57j0i512l3j0i22i30l6.5520j0j9&amp;sourceid=chrome&amp;ie=UTF-8', visitCount: 2 },
	// { id: '8140', lastVisitTime: 1665857538534.3772, title: 'chrome extensions for dummies - Google Search', typedCount: 0, url: 'https://www.google.com/search?q=chrome+extensions+for+dummies&amp;rlz=1C1ONGR_en-GBGB968GB968&amp;oq=chrome+extensions+for+dummies&amp;aqs=chrome..69i57j33i22i29i30l2.5840j0j7&amp;sourceid=chrome&amp;ie=UTF-8', visitCount: 2 },
	// ]
	// }
</script>

<SearchHeader placeholder="Search downloads" bind:query />
<main class="scrollable">
	{#each downloads as item (item.id)}
		<DownloadItem {item} active={!!activeDownloadStates[item.id]} />
	{:else}
		<div class="col justify-content-center align-items-center" style="height: 100%">
			<img width="160" height="160" src="images/no-downloads.svg" alt="" />
			<p style="opacity: .6">Files you download appear here</p>
		</div>
	{/each}
</main>
<BottomButton icon={mdiDownload} action={openTab}>View all downloads</BottomButton>
