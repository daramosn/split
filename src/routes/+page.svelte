<script lang="ts">
	import type { PageData } from './$types';

	let { data } = $props();
</script>

<div class="container">
	<section class="hero animate-fade-in-up">
		<div class="hero-content">
			<h1 class="hero-title">
				<span class="title-line">Split expenses</span>
				<span class="title-accent">without the drama</span>
			</h1>
			<p class="hero-subtitle">
				Create a group, add your expenses, and let SplitUp figure out who owes whom. No math, no arguments.
			</p>
		</div>
		<div class="hero-visual">
			<div class="floating-card card-1">
				<div class="fc-avatar">A</div>
				<div class="fc-content">
					<span class="fc-name">Alice</span>
					<span class="fc-amount text-success">+$45.00</span>
				</div>
			</div>
			<div class="floating-card card-2">
				<div class="fc-avatar">B</div>
				<div class="fc-content">
					<span class="fc-name">Bob</span>
					<span class="fc-amount text-danger">-$32.50</span>
				</div>
			</div>
			<div class="floating-card card-3">
				<div class="fc-avatar">C</div>
				<div class="fc-content">
					<span class="fc-name">Carol</span>
					<span class="fc-amount text-success">+$12.00</span>
				</div>
			</div>
			<div class="connection-lines">
				<svg viewBox="0 0 200 120" fill="none">
					<path d="M30 90 Q 100 20, 170 90" stroke="var(--color-primary)" stroke-width="2" stroke-dasharray="4 4" opacity="0.3"/>
					<circle cx="30" cy="90" r="4" fill="var(--color-primary)" opacity="0.5"/>
					<circle cx="170" cy="90" r="4" fill="var(--color-primary)" opacity="0.5"/>
				</svg>
			</div>
		</div>
	</section>

	<div class="actions-bar animate-fade-in-up stagger-2">
		<a href="/create" class="btn btn-primary btn-lg">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
				<line x1="12" y1="5" x2="12" y2="19"/>
				<line x1="5" y1="12" x2="19" y2="12"/>
			</svg>
			Create Group
		</a>
	</div>

	{#if data.groups.length > 0}
		<section class="groups-section animate-fade-in-up stagger-3">
			<h2 class="section-title">Your Groups</h2>
			<div class="groups-grid">
				{#each data.groups as group, i}
					<a href="/group/{group.id}" class="group-card card card-elevated animate-morph-in" style="animation-delay: {0.05 * (i + 1)}s">
						<div class="gc-header">
							<div class="gc-avatar">
								{group.name.charAt(0).toUpperCase()}
							</div>
							<div class="gc-info">
								<h3 class="gc-name">{group.name}</h3>
								{#if group.description}
									<p class="gc-desc text-secondary text-sm">{group.description}</p>
								{/if}
							</div>
						</div>
						<div class="gc-footer">
							<div class="gc-meta">
								<span class="chip">
									<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
										<circle cx="9" cy="7" r="4"/>
										<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
										<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
									</svg>
									{group.participants.length}
								</span>
								<span class="chip">
									<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<line x1="12" y1="1" x2="12" y2="23"/>
										<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
									</svg>
									{group.currency}
								</span>
							</div>
							<div class="gc-arrow">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<polyline points="9 18 15 12 9 6"/>
								</svg>
							</div>
						</div>
						<div class="gc-glow"></div>
					</a>
				{/each}
			</div>
		</section>
	{/if}

	<section class="join-section animate-fade-in-up stagger-4">
		<div class="card filled-tonal">
			<div class="join-content">
				<div class="join-icon">
					<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
						<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
					</svg>
				</div>
				<div class="join-text">
					<h3 class="text-lg font-display">Join a Group</h3>
					<p class="text-secondary text-sm">Have a group ID? Join an existing group to start tracking.</p>
				</div>
				<form action="/api/join" method="POST" class="join-form">
					<input type="text" name="groupId" class="input" placeholder="Paste group ID here" required />
					<button type="submit" class="btn btn-secondary" aria-label="Join group">
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="9 18 15 12 9 6"/>
						</svg>
					</button>
				</form>
			</div>
		</div>
	</section>

	{#if data.groups.length === 0}
		<section class="empty-state animate-fade-in-up stagger-2">
			<div class="empty-illustration">
				<div class="empty-circles">
					<div class="ec-circle ec-1"></div>
					<div class="ec-circle ec-2"></div>
					<div class="ec-circle ec-3"></div>
				</div>
				<div class="empty-icon">
					<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<rect x="2" y="5" width="20" height="14" rx="2"/>
						<line x1="2" y1="10" x2="22" y2="10"/>
						<line x1="6" y1="14" x2="6" y2="14"/>
						<line x1="10" y1="14" x2="10" y2="14"/>
						<line x1="14" y1="14" x2="14" y2="14"/>
						<line x1="18" y1="14" x2="18" y2="14"/>
					</svg>
				</div>
			</div>
			<h2 class="text-2xl font-display">No groups yet</h2>
			<p class="text-secondary mt-2">Create your first group to start splitting expenses<br/>with friends, roommates, or travel buddies.</p>
			<a href="/create" class="btn btn-primary btn-lg mt-6">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<line x1="12" y1="5" x2="12" y2="19"/>
					<line x1="5" y1="12" x2="19" y2="12"/>
				</svg>
				Create your first group
			</a>
		</section>
	{/if}
</div>

<style>
	.hero {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 48px;
		align-items: center;
		padding: 48px 0 64px;
	}

	.hero-title {
		font-family: var(--font-display);
		font-size: 48px;
		font-weight: 800;
		line-height: 1.1;
		letter-spacing: -0.03em;
		margin-bottom: 20px;
	}

	.title-line {
		display: block;
		color: var(--color-on-surface);
	}

	.title-accent {
		display: block;
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-tertiary) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.hero-subtitle {
		font-size: 18px;
		color: var(--color-on-surface-variant);
		line-height: 1.6;
		max-width: 420px;
	}

	.hero-visual {
		position: relative;
		height: 200px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.floating-card {
		position: absolute;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px 20px;
		background: var(--color-surface-bright);
		border-radius: var(--radius-lg);
		box-shadow: var(--elevation-3);
		border: 1px solid var(--color-outline-variant);
	}

	.card-1 {
		left: 10%;
		top: 20%;
		animation: float 4s ease-in-out infinite;
	}

	.card-2 {
		right: 10%;
		top: 30%;
		animation: float 4s ease-in-out infinite 0.5s;
	}

	.card-3 {
		left: 20%;
		bottom: 10%;
		animation: float 4s ease-in-out infinite 1s;
	}

	@keyframes float {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-10px); }
	}

	.fc-avatar {
		width: 44px;
		height: 44px;
		border-radius: var(--radius-full);
		background: var(--color-primary-container);
		color: var(--color-on-primary-container);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 16px;
	}

	.fc-content {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.fc-name {
		font-weight: 600;
		font-size: 15px;
	}

	.fc-amount {
		font-weight: 700;
		font-size: 14px;
	}

	.connection-lines {
		position: absolute;
		width: 100%;
		height: 100%;
		opacity: 0.6;
	}

	.connection-lines svg {
		width: 100%;
		height: 100%;
	}

	.actions-bar {
		display: flex;
		gap: 16px;
		margin-bottom: 48px;
	}

	.section-title {
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: 700;
		margin-bottom: 20px;
		color: var(--color-on-surface);
	}

	.groups-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 20px;
		margin-bottom: 64px;
	}

	.group-card {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 24px;
		text-decoration: none;
		color: inherit;
		position: relative;
		overflow: hidden;
	}

	.group-card:hover {
		text-decoration: none;
		transform: translateY(-4px);
	}

	.group-card:hover .gc-glow {
		opacity: 1;
	}

	.group-card:hover .gc-arrow {
		transform: translateX(4px);
	}

	.gc-glow {
		position: absolute;
		inset: 0;
		background: radial-gradient(circle at top right, rgba(var(--color-primary-rgb), 0.1) 0%, transparent 60%);
		opacity: 0;
		transition: opacity var(--transition-normal);
		pointer-events: none;
	}

	.gc-header {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.gc-avatar {
		width: 56px;
		height: 56px;
		border-radius: var(--radius-lg);
		background: linear-gradient(135deg, var(--color-primary-container) 0%, var(--color-secondary-container) 100%);
		color: var(--color-on-primary-container);
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-display);
		font-size: 24px;
		font-weight: 800;
	}

	.gc-info {
		flex: 1;
	}

	.gc-name {
		font-family: var(--font-display);
		font-size: 18px;
		font-weight: 700;
		margin-bottom: 4px;
	}

	.gc-desc {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.gc-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 16px;
		border-top: 1px solid var(--color-outline-variant);
	}

	.gc-meta {
		display: flex;
		gap: 8px;
	}

	.gc-meta .chip {
		font-size: 12px;
		padding: 6px 12px;
	}

	.gc-meta .chip svg {
		width: 12px;
		height: 12px;
	}

	.gc-arrow {
		color: var(--color-on-surface-variant);
		transition: transform var(--transition-spring);
	}

	.join-section {
		margin-bottom: 48px;
	}

	.join-content {
		display: flex;
		align-items: center;
		gap: 20px;
		flex-wrap: wrap;
	}

	.join-icon {
		width: 56px;
		height: 56px;
		border-radius: var(--radius-lg);
		background: var(--color-primary-container);
		color: var(--color-on-primary-container);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.join-text {
		flex: 1;
		min-width: 200px;
	}

	.join-form {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
	}

	.join-form .input {
		flex: 1;
		min-width: 200px;
	}

	.empty-state {
		text-align: center;
		padding: 80px 24px;
	}

	.empty-illustration {
		position: relative;
		width: 200px;
		height: 160px;
		margin: 0 auto 32px;
	}

	.empty-circles {
		position: absolute;
		inset: 0;
	}

	.ec-circle {
		position: absolute;
		border-radius: 50%;
		border: 2px solid var(--color-outline-variant);
	}

	.ec-1 {
		width: 100px;
		height: 100px;
		top: 0;
		left: 0;
		animation: pulse 3s ease-in-out infinite;
	}

	.ec-2 {
		width: 80px;
		height: 80px;
		top: 40px;
		right: 0;
		animation: pulse 3s ease-in-out infinite 0.3s;
	}

	.ec-3 {
		width: 60px;
		height: 60px;
		bottom: 0;
		left: 30%;
		animation: pulse 3s ease-in-out infinite 0.6s;
	}

	@keyframes pulse {
		0%, 100% { transform: scale(1); opacity: 0.5; }
		50% { transform: scale(1.05); opacity: 0.8; }
	}

	.empty-icon {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: var(--color-primary);
		animation: bounce 2s ease-in-out infinite;
	}

	@keyframes bounce {
		0%, 100% { transform: translate(-50%, -50%); }
		50% { transform: translate(-50%, -60%); }
	}

	.empty-state h2 {
		margin-bottom: 8px;
	}

	.font-display {
		font-family: var(--font-display);
	}

	@media (max-width: 768px) {
		.hero {
			grid-template-columns: 1fr;
			text-align: center;
			padding: 32px 0 48px;
		}

		.hero-subtitle {
			max-width: none;
		}

		.hero-visual {
			display: none;
		}

		.hero-title {
			font-size: 36px;
		}

		.groups-grid {
			grid-template-columns: 1fr;
		}

		.join-content {
			flex-direction: column;
			align-items: flex-start;
		}

		.join-form {
			width: 100%;
		}

		.join-form .input {
			min-width: 0;
			width: 100%;
		}
	}
</style>