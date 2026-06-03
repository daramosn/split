<script lang="ts">
	import type { Group } from '$lib/types';
	import { IconUsers, IconCurrency, IconArrowRight, IconDotsVertical, IconEdit, IconTrash } from '$lib/components/icons';

	interface Props {
		groups: Group[];
		userId?: string | null;
	}

	let { groups, userId = null }: Props = $props();

	let openMenuId = $state<string | null>(null);
	let confirmingDeleteId = $state<string | null>(null);

	function toggleMenu(groupId: string) {
		if (openMenuId === groupId) {
			openMenuId = null;
		} else {
			openMenuId = groupId;
			confirmingDeleteId = null;
		}
	}

	function closeMenus() {
		openMenuId = null;
		confirmingDeleteId = null;
	}
</script>

<svelte:window onclick={closeMenus} />

<section class="groups-section animate-fade-in-up stagger-3">
	<h2 class="section-title">Your Groups</h2>
	<div class="groups-grid">
		{#each groups as group, i}
			<div class="group-card-wrapper animate-morph-in" style="animation-delay: {0.05 * (i + 1)}s">
				<a href="/group/{group.inviteCode}" class="group-card card card-elevated">
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
				{#if userId && group.ownerId === userId}
					<div class="gc-menu-wrapper">
						<button
							type="button"
							class="gc-menu-btn"
							onclick={(e) => { e.stopPropagation(); toggleMenu(group.id); }}
							aria-label="Group options"
						>
							<IconDotsVertical size={18} />
						</button>
						{#if openMenuId === group.id}
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div class="gc-menu" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
								<a href="/group/{group.inviteCode}" class="gc-menu-item">
									<IconEdit size={16} />
									Edit
								</a>
								{#if confirmingDeleteId === group.id}
									<div class="gc-menu-delete-confirm">
										<span>Delete?</span>
										<form method="POST" action="?/deleteGroup">
											<input type="hidden" name="groupId" value={group.id} />
											<button type="submit" class="btn btn-danger btn-xs">Yes</button>
										</form>
										<button
											type="button"
											class="btn btn-ghost btn-xs"
											onclick={(e) => { e.stopPropagation(); confirmingDeleteId = null; }}
										>No</button>
									</div>
								{:else}
									<button
										type="button"
										class="gc-menu-item gc-menu-item-danger"
										onclick={(e) => { e.stopPropagation(); confirmingDeleteId = group.id; }}
									>
										<IconTrash size={16} />
										Delete
									</button>
								{/if}
							</div>
						{/if}
					</div>
				{/if}
			</div>
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

	.group-card-wrapper {
		position: relative;
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

	.gc-menu-wrapper {
		position: absolute;
		top: 12px;
		right: 12px;
		z-index: 5;
	}

	.gc-menu-btn {
		width: 36px;
		height: 36px;
		border-radius: var(--radius-full);
		background: var(--color-surface-container);
		color: var(--color-on-surface-variant);
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		cursor: pointer;
		opacity: 0;
		transition: all var(--transition-fast);
	}

	.group-card-wrapper:hover .gc-menu-btn {
		opacity: 1;
	}

	.gc-menu-btn:hover {
		background: var(--color-surface-container-high);
		color: var(--color-on-surface);
	}

	.gc-menu {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 4px;
		min-width: 160px;
		background: var(--color-surface-bright);
		border-radius: var(--radius-lg);
		box-shadow: var(--elevation-2);
		padding: 4px;
		z-index: 10;
		animation: fadeIn 0.15s ease forwards;
	}

	.gc-menu-item {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 10px 14px;
		border-radius: var(--radius-md);
		font-size: 14px;
		font-weight: 500;
		color: var(--color-on-surface);
		text-decoration: none;
		border: none;
		background: none;
		cursor: pointer;
		transition: background var(--transition-fast);
	}

	.gc-menu-item:hover {
		background: var(--color-surface-container);
		text-decoration: none;
	}

	.gc-menu-item-danger {
		color: var(--color-danger);
	}

	.gc-menu-item-danger:hover {
		background: var(--color-danger-container);
	}

	.gc-menu-delete-confirm {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 14px;
		font-size: 14px;
		font-weight: 600;
		color: var(--color-on-surface);
	}

	.btn-xs {
		padding: 4px 10px;
		font-size: 12px;
	}

	.btn-danger {
		background: var(--color-danger);
		color: var(--color-on-danger);
	}

	.btn-danger:hover {
		opacity: 0.9;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 768px) {
		.groups-grid {
			grid-template-columns: 1fr;
		}

		.gc-menu-btn {
			opacity: 0.7;
		}
	}
</style>
