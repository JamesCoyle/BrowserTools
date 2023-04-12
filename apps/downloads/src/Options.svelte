<script lang="ts">
	import { darkMode, theme, iconColor, iconColorDark, showShelf, notify, defaultIconColors } from './stores/settings'

	import Icon from './components/icon.svelte'
	import IconButton from './components/icon-button.svelte'

	import { mdiAlertOutline, mdiCheck, mdiCodeBraces, mdiDownload, mdiPlay, mdiPause, mdiRestore } from '@mdi/js'
	import { icoGithub } from './custom-icons'

	$: $notify, updateNotificationPermission()

	function updateIconColor(e) {
		$iconColor = e.target.value
	}

	function updateIconColorDark(e) {
		$iconColorDark = e.target.value
	}

	function updateNotificationPermission() {
		if (Object.values($notify).some((setting) => setting === true)) {
			chrome.permissions.request({ permissions: ['notifications'] }).then((allowed) => {
				if (allowed) return

				// Disable all settings if permission denied.
				for (const [key] of Object.entries($notify)) $notify[key] = false
			})
		} else {
			chrome.permissions.remove({ permissions: ['notifications'] })
		}
	}
</script>

<style>
	main {
		display: flex;
		flex-flow: column nowrap;
		justify-content: flex-start;
		align-items: center;
		padding: var(--spacing);
	}

	.info {
		text-align: center;
	}

	@media screen and (min-width: 60rem) {
		main {
			display: grid;
			grid-template-columns: 1fr 1fr;
			justify-items: center;
			align-items: start;
			gap: var(--spacing);
		}

		.info {
			position: sticky;
			top: var(--spacing);
			text-align: start;
		}
	}

	.settings {
		min-width: 24rem;
		max-width: 30rem;
		flex: 0 0 24rem;
	}

	.setting-item {
		padding: var(--pad, var(--pad-default));
		color: var(--text-color);
		background-color: var(--hover-color);
		border-radius: 0.25rem;
	}

	.setting-name {
		font-weight: bold;
	}

	.setting-theme {
		position: relative;
		width: 100%;

		display: grid;
		place-content: center;

		padding: 0;
		flex: 1 1 auto;
		aspect-ratio: 16/9;
		border-radius: 0.25rem;

		font-weight: bold;
	}

	.setting-theme span {
		color: white;
		mix-blend-mode: difference;
	}

	input:checked + .setting-theme {
		box-shadow: 0 0 0 0.25rem var(--theme-color);
	}

	.setting-theme.auto {
		position: relative;
		background: linear-gradient(0deg, rgba(217, 217, 217, 1) 0%, rgba(215, 222, 226, 1) 35%, rgba(255, 255, 255, 1) 100%);
	}

	.setting-theme.auto::before {
		content: linear-gradient(0deg, rgba(61, 61, 61, 1) 0%, rgba(9, 9, 9, 1) 35%, rgba(52, 52, 52, 1) 100%);
		position: absolute;
		inset: 0px;
		width: 100%;
		height: 100%;
		clip-path: polygon(100% 0, 100% 100%, 0% 100%);
	}

	.setting-theme.light {
		background: linear-gradient(0deg, rgba(217, 217, 217, 1) 0%, rgba(215, 222, 226, 1) 35%, rgba(255, 255, 255, 1) 100%);
	}

	.setting-theme.dark {
		background: linear-gradient(0deg, rgba(61, 61, 61, 1) 0%, rgba(9, 9, 9, 1) 35%, rgba(52, 52, 52, 1) 100%);
	}
</style>

<main class="theme-{$theme}">
	<div class="info col pad" style="--gap: 2rem">
		<h1>Download Manager</h1>
		<p class="fs2">A less intrusive way to access your recent downloads.</p>

		<a href="https://ko-fi.com/J3J83XUWP" target="_blank" style="margin-block: 1rem;">
			<img class="light-only" height="48" style="border:0px;height:48px;" src="https://cdn.ko-fi.com/cdn/kofi1.png?v=3" alt="Buy Me a Coffee at ko-fi.com" />
			<img class="dark-only" height="48" style="border:0px;height:48px;" src="https://cdn.ko-fi.com/cdn/kofi5.png?v=3" alt="Buy Me a Coffee at ko-fi.com" />
		</a>
	</div>
	<div class="settings col pad" style="--gap: 4rem">
		<h1 class="sr-only">Settings</h1>
		<section class="setting-group col align-items-center">
			<h2>Appearance</h2>

			<div class="setting-item col">
				<div class="setting-name">Theme</div>
				<div class="row">
					<input class="display-none" type="radio" name="theme" bind:group={$theme} value="auto" id="setting-theme-auto" />
					<label for="setting-theme-auto" class="setting-theme auto">
						<span>Auto</span>
					</label>

					<input class="display-none" type="radio" name="theme" bind:group={$theme} value="light" id="setting-theme-light" />
					<label for="setting-theme-light" class="setting-theme light">
						<span>Light</span>
					</label>

					<input class="display-none" type="radio" name="theme" bind:group={$theme} value="dark" id="setting-theme-dark" />
					<label for="setting-theme-dark" class="setting-theme dark">
						<span>Dark</span>
					</label>
				</div>
			</div>

			<div class="setting-item row align-items-stretch" style="--gap: .25rem">
				<label class="setting-name flex-auto row align-items-center" for="setting-icon-color">Light mode icon color</label>
				<IconButton description="Reset color to default" icon={mdiRestore} action={() => iconColor.set(defaultIconColors.light)} />
				<input type="color" id="setting-icon-color" value={$iconColor} on:change={updateIconColor} />
			</div>

			<div class="setting-item row align-items-stretch" style="--gap: .25rem">
				<label class="setting-name flex-auto row align-items-center" for="setting-icon-color-dark">Dark mode icon color</label>
				<IconButton description="Reset color to default" icon={mdiRestore} action={() => iconColorDark.set(defaultIconColors.dark)} />
				<input type="color" id="setting-icon-color-dark" value={$iconColorDark} on:change={updateIconColorDark} />
			</div>

			<div class="setting-item row align-items-stretch">
				<label class="setting-name flex-auto row align-items-center" for="setting-shelf" title="Toggle visibility of the default downloads shelf">
					<span class="">Show Chrome download shelf</span>
				</label>
				<input id="setting-shelf" type="checkbox" name="shelf" bind:checked={$showShelf} />
			</div>
		</section>

		<section class="setting-group col align-items-center">
			<h2>Notifications</h2>

			<div class="setting-item row align-items-stretch">
				<Icon path={mdiDownload} />
				<label class="setting-name flex-auto row align-items-center" for="setting-notify-start" title="Enable notifications when a download starts">Started</label>
				<input id="setting-notify-start" type="checkbox" name="notify-start" bind:checked={$notify.onStart} />
			</div>
			<div class="setting-item row align-items-stretch">
				<Icon path={mdiPause} />
				<label class="setting-name flex-auto row align-items-center" for="setting-notify-paused" title="Enable notifications when a download is paused">Paused</label>
				<input id="setting-notify-paused" type="checkbox" name="notify-paused" bind:checked={$notify.onPause} />
			</div>
			<div class="setting-item row align-items-stretch">
				<Icon path={mdiPlay} />
				<label class="setting-name flex-auto row align-items-center" for="setting-notify-resume" title="Enable notifications when a download is resume">Resumed</label>
				<input id="setting-notify-resume" type="checkbox" name="notify-resume" bind:checked={$notify.onResume} />
			</div>
			<div class="setting-item row align-items-stretch">
				<Icon path={mdiAlertOutline} />
				<label class="setting-name flex-auto row align-items-center" for="setting-notify-error" title="Enable notifications when a download error occurs">Error</label>
				<input id="setting-notify-error" type="checkbox" name="notify-error" bind:checked={$notify.onError} />
			</div>
			<div class="setting-item row align-items-stretch">
				<Icon path={mdiCheck} />
				<label class="setting-name flex-auto row align-items-center" for="setting-notify-complet" title="Enable notifications when a download starts">Complete</label>
				<input id="setting-notify-complet" type="checkbox" name="notify-complet" bind:checked={$notify.onComplete} />
			</div>
		</section>

		<section class="setting-group col align-items-center">
			<h2>Links</h2>

			<a class="setting-item row align-items-center" target="_blank" href="https://james-coyle.com/"><Icon path={mdiCodeBraces} /><span>Developed by James Coyle</span></a>
			<a class="setting-item row align-items-center" target="_blank" href="https://github.com/JamesCoyle/HistoryExtension"><Icon path={icoGithub} />View source on GitHub</a>
			<a class="setting-item row align-items-center" target="_blank" href="https://github.com/JamesCoyle/HistoryExtension/issues/new"><Icon path={mdiAlertOutline} />Report an issue</a>
		</section>
	</div>
</main>
