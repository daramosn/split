<script lang="ts">
	import type { Group } from '$lib/types';
	import { IconUsers, IconCurrency, IconArrowRight } from '$lib/components/icons';

	interface Props {
		groups: Group[];
	}

	let { groups }: Props = $props();
</script>

<section class="groups-section animate-fade-in-up stagger-3">
	<h2 class="section-title">Your Groups</h2>
	<div class="groups-grid">
		{#each groups as group, i}
			<a href="/group/{group.inviteCode}" class="group-card card card-elevated animate-morph-in" style="animation-delay: {0.05 * (i + 1)}s">
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
							<IconUsers size={14} />
							{group.participants.length}
						</span>
						<span class="chip">
							<IconCurrency size={14} />
							{group.currency}
						</span>
					</div>
					<div class="gc-arrow">
						<IconArrowRight size={20} />
					</div>
				</div>
				<div class="gc-glow"></div>
			</a>
		{/each}
	</div>
</section>

<style>
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

	.gc-arrow {
		color: var(--color-on-surface-variant);
		transition: transform var(--transition-spring);
	}

	@media (max-width: 768px) {
		.groups-grid {
			grid-template-columns: 1fr;
		}
	}
</style>