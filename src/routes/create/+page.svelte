<script lang="ts">
	import type { ActionData } from './$types';
	import { IconArrowLeft, IconUsers, IconList, IconCurrency, IconCheck, IconInfo, IconError } from '$lib/components/icons';
	import { CURRENCIES } from '$lib/constants';

	let { form } = $props();
</script>

<div class="container">
	<div class="create-page animate-fade-in-up">
		<div class="page-header">
			<a href="/" class="back-link" aria-label="Go back">
				<IconArrowLeft size={20} strokeWidth={2.5} />
			</a>
			<h1 class="text-2xl font-display">Create Group</h1>
		</div>

		<div class="create-card card card-elevated">
			<form method="POST" class="create-form">
				<div class="form-section">
					<h3 class="form-section-title">Group Details</h3>

					<div class="form-group">
						<label class="label" for="name">
							<span class="label-icon">
								<IconUsers size={16} />
							</span>
							Group Name
						</label>
						<input type="text" id="name" name="name" class="input" placeholder="Weekend Trip" required />
					</div>

					<div class="form-group">
						<label class="label" for="description">
							<span class="label-icon">
								<IconList size={16} />
							</span>
							Description <span class="optional">(optional)</span>
						</label>
						<input type="text" id="description" name="description" class="input" placeholder="July 2024 vacation" />
					</div>

					<div class="form-group">
						<label class="label" for="currency">
							<span class="label-icon">
								<IconCurrency size={16} />
							</span>
							Currency
						</label>
						<select id="currency" name="currency" class="input">
							{#each CURRENCIES as c}
								<option value={c.value}>{c.label}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="divider"></div>

				{#if form?.error}
					<div class="error-card card danger">
						<div class="error-icon">
							<IconError size={20} />
						</div>
						<span>{form.error}</span>
					</div>
				{/if}

				<div class="form-actions">
					<a href="/" class="btn btn-ghost">Cancel</a>
					<button type="submit" class="btn btn-primary">
						<IconCheck size={18} strokeWidth={2.5} />
						Create Group
					</button>
				</div>
			</form>
		</div>

		<div class="tips-card card filled-tonal animate-fade-in-up stagger-2">
			<div class="tips-header">
				<span class="tips-icon">
					<IconInfo size={18} />
				</span>
				<span class="tips-title">Pro Tips</span>
			</div>
			<ul class="tips-list">
				<li>You can add participants after creating the group</li>
				<li>Split expenses equally or with custom amounts</li>
				<li>The app calculates optimal settlements automatically</li>
			</ul>
		</div>
	</div>
</div>

<style>
	.create-page {
		max-width: 560px;
		margin: 0 auto;
	}

	.page-header {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 32px;
	}

	.back-link {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: var(--radius-full);
		background: var(--color-surface-container);
		color: var(--color-on-surface-variant);
		transition: all var(--transition-fast);
	}

	.back-link:hover {
		background: var(--color-surface-container-high);
		color: var(--color-on-surface);
		text-decoration: none;
	}

	.create-card {
		padding: 32px;
	}

	.create-form {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.form-section-title {
		font-family: var(--font-display);
		font-size: 16px;
		font-weight: 700;
		color: var(--color-primary);
		margin-bottom: 20px;
		padding-bottom: 12px;
		border-bottom: 2px solid var(--color-primary-container);
	}

	.form-group {
		margin-bottom: 20px;
	}

	.form-group:last-child {
		margin-bottom: 0;
	}

	.label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-weight: 600;
		margin-bottom: 10px;
	}

	.label-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-primary);
	}

	.optional {
		font-weight: 400;
		color: var(--color-on-surface-variant);
		font-size: 13px;
	}

	.error-card {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
		background: var(--color-danger-container);
		color: var(--color-on-danger-container);
		border-radius: var(--radius-lg);
	}

	.error-icon {
		flex-shrink: 0;
	}

	.form-actions {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
		padding-top: 8px;
	}

	.tips-card {
		margin-top: 24px;
	}

	.tips-header {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 16px;
	}

	.tips-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-primary);
	}

	.tips-title {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 15px;
	}

	.tips-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.tips-list li {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		font-size: 14px;
		color: var(--color-on-surface-variant);
	}

	.tips-list li::before {
		content: '→';
		color: var(--color-primary);
		font-weight: 600;
	}

	.font-display {
		font-family: var(--font-display);
	}
</style>