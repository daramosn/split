<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	let theme = $state<'light' | 'dark'>('dark');

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
	}

	$effect(() => {
		const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
		if (saved) {
			theme = saved;
			document.documentElement.setAttribute('data-theme', saved);
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>SplitUp - Split expenses easily</title>
</svelte:head>

<div class="app">
	<a href="#main-content" class="skip-link">Skip to main content</a>
	<header class="header">
		<div class="header-bg"></div>
		<div class="container header-content">
			<a href="/" class="logo">
				<span class="logo-icon">
					<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="9" cy="9" r="6"/>
						<path d="M15 9a6 6 0 1 1-12 0 6 6 0 0 1 12 0z"/>
						<line x1="9" y1="3" x2="9" y2="6"/>
						<line x1="9" y1="12" x2="9" y2="15"/>
						<line x1="3" y1="9" x2="6" y2="9"/>
						<line x1="12" y1="9" x2="15" y2="9"/>
					</svg>
				</span>
				<span class="logo-text">SplitUp</span>
			</a>
			<div class="header-actions">
				<button class="theme-toggle btn btn-icon btn-ghost" onclick={toggleTheme} aria-label="Toggle theme">
					{#if theme === 'dark'}
						<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<circle cx="12" cy="12" r="5"/>
							<line x1="12" y1="1" x2="12" y2="3"/>
							<line x1="12" y1="21" x2="12" y2="23"/>
							<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
							<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
							<line x1="1" y1="12" x2="3" y2="12"/>
							<line x1="21" y1="12" x2="23" y2="12"/>
							<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
							<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
						</svg>
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
						</svg>
					{/if}
				</button>
			</div>
		</div>
	</header>

	<main id="main-content" class="main">
		{@render children()}
	</main>
</div>

<style>
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.skip-link {
		position: fixed;
		top: -80px;
		left: 50%;
		transform: translateX(-50%);
		background: var(--color-primary-container);
		color: var(--color-on-primary-container);
		padding: 12px 24px;
		border-radius: var(--radius-full);
		z-index: 200;
		font-weight: 600;
		transition: top 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
		box-shadow: var(--elevation-4);
	}

	.skip-link:focus {
		top: 16px;
	}

	.header {
		position: relative;
		padding: 20px 0;
		overflow: hidden;
	}

	.header-bg {
		position: absolute;
		inset: 0;
		background: var(--color-surface-container-low);
		border-bottom: 1px solid var(--color-outline-variant);
	}

	.header-bg::before {
		content: '';
		position: absolute;
		top: -50%;
		right: -10%;
		width: 400px;
		height: 400px;
		background: radial-gradient(circle, rgba(var(--color-primary-rgb), 0.08) 0%, transparent 70%);
		border-radius: 50%;
	}

	.header-content {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 12px;
		text-decoration: none;
		color: var(--color-on-surface);
	}

	.logo:hover {
		text-decoration: none;
	}

	.logo-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		background: var(--color-primary-container);
		color: var(--color-on-primary-container);
		border-radius: var(--radius-lg);
		box-shadow: var(--elevation-2);
		transition: transform var(--transition-spring);
	}

	.logo:hover .logo-icon {
		transform: rotate(-5deg) scale(1.05);
	}

	.logo-text {
		font-family: var(--font-display);
		font-size: 26px;
		font-weight: 800;
		letter-spacing: -0.02em;
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.theme-toggle {
		color: var(--color-on-surface-variant);
	}

	.theme-toggle:hover {
		color: var(--color-on-surface);
	}

	.main {
		flex: 1;
		padding: 40px 0 80px;
	}
</style>