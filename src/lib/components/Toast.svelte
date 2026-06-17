<script lang="ts">
	import { getToasts, removeToast } from '$lib/stores/toast.svelte';
	import { IconCheck, IconError, IconInfo, IconX } from '$lib/components/icons';

	const ICONS = {
		success: IconCheck,
		error: IconError,
		info: IconInfo
	} as const;

	const toasts = $derived(getToasts());
</script>

<div
	class="toast-container"
	role="region"
	aria-label="Notifications"
	aria-live="polite"
	aria-atomic="false"
>
	{#each toasts as toast (toast.id)}
		{@const Icon = ICONS[toast.type]}
		<div class="toast toast-{toast.type}" role="status">
			<div class="toast-icon" aria-hidden="true">
				<Icon size={20} strokeWidth={2.5} />
			</div>
			<p class="toast-message">{toast.message}</p>
			<button
				class="toast-close"
				aria-label="Dismiss notification"
				onclick={() => removeToast(toast.id)}
			>
				<IconX size={16} strokeWidth={2.5} />
			</button>
		</div>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		bottom: 24px;
		right: 24px;
		z-index: 1000;
		display: flex;
		flex-direction: column;
		gap: 12px;
		pointer-events: none;
		max-width: 420px;
		width: calc(100vw - 48px);
	}

	.toast {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		border-radius: var(--radius-md);
		box-shadow: var(--elevation-4);
		pointer-events: auto;
		animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}

	.toast-success {
		background: var(--color-success-container);
		color: var(--color-success);
	}

	.toast-error {
		background: var(--color-error-container, #fde0e0);
		color: var(--color-error);
	}

	.toast-info {
		background: var(--color-surface-container);
		color: var(--color-on-surface);
	}

	.toast-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.toast-message {
		flex: 1;
		margin: 0;
		font-size: 14px;
		font-weight: 500;
		line-height: 1.4;
	}

	.toast-close {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 28px;
		height: 28px;
		border: none;
		background: transparent;
		border-radius: var(--radius-full);
		color: inherit;
		opacity: 0.7;
		cursor: pointer;
		transition: opacity var(--transition-fast);
	}

	.toast-close:hover {
		opacity: 1;
	}

	.toast-close:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 2px;
		opacity: 1;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(100%);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.toast {
			animation: none;
		}
	}
</style>
