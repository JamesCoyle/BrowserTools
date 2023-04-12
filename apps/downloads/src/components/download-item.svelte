<script>
	import { DownloadState } from '../classes/download'

	export let item
	export let active

	let icon

	// get icon
	chrome.downloads.getFileIcon(item.id, (i) => {
		icon = i
	})

	function handleFileClick(e) {
		item.open(e.ctrlKey)
	}
</script>

<style>
	@keyframes complete {
		0%,
		50%,
		100% {
			background-color: transparent;
		}
		25%,
		75% {
			background-color: #33993b;
		}
	}

	.download {
		position: relative;
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
		width: 100%;
		height: 40px;
		z-index: 1;
	}

	.download::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		display: block;
		width: 100%;
		height: 100%;
		background-color: transparent;
		transform: translateX(var(--progress));
		transition: transform 500ms linear, background-color 100ms ease-out;
		opacity: 0.5;
		z-index: -1;
	}

	.download.downloading::before {
		background-color: #3369d7;
	}

	.download.paused::before {
		background-color: #ffc247;
	}

	.download.error::before {
		background-color: #fe4134;
	}

	.download.active.complete::before {
		animation: complete 1s;
	}

	.file {
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
		flex: 1 1 auto;
		height: 100%;
		padding: 0 1rem;
		overflow: hidden;
	}

	.icon {
		width: 1rem;
		height: 1rem;
		margin-right: 1rem;
		vertical-align: middle;
	}

	.file-info {
		overflow: hidden;
	}

	.filename {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.download.deleted .filename {
		text-decoration: line-through;
	}

	.state {
		opacity: 0.6;
		font-size: 0.8em;
		text-transform: capitalize;
	}

	.button {
		display: flex;
		justify-content: center;
		align-items: center;
		flex: 0 0 40px;
		height: 40px;
		opacity: 0.8;
	}
</style>

<div class="download {item.state}" class:active style="--progress: {item.progress}%">
	<button class="file" title={item.name} on:click={handleFileClick}>
		<img class="icon" src={icon} alt="" />
		<div class="file-info">
			<div class="filename">{item.name}</div>
			<div class="state">
				{#if item.state === DownloadState.downloading}
					{item.progressStr}
				{:else if item.state !== DownloadState.complete}
					{item.state}
				{/if}
			</div>
		</div>
	</button>

	{#each item.actions as action}
		{#if action}
			<button class="button" title={action.description} on:click={action.handler}>
				<svg width="20" height="20" viewBox="0 0 24 24">
					<path d={action.icon} fill="currentColor" />
				</svg>
			</button>
		{/if}
	{/each}
</div>
