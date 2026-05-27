<script lang="ts">
	import { IconLink, IconArrowRight } from '$lib/components/icons';
</script>

<section class="join-section animate-fade-in-up stagger-4">
	<div class="card filled-tonal">
		<div class="join-content">
			<div class="join-icon">
				<IconLink size={28} />
			</div>
			<div class="join-text">
				<h3 class="text-lg font-display">Join a Group</h3>
				<p class="text-secondary text-sm">Have an invite code? Enter it below to view the group.</p>
			</div>
			<form action="/api/join" method="POST" class="join-form">
				<input type="text" name="inviteCode" class="input" placeholder="Paste invite code here" required />
				<button type="submit" class="btn btn-secondary" aria-label="Join group">
					<IconArrowRight size={18} strokeWidth={2.5} />
				</button>
			</form>
		</div>
	</div>
</section>

<style>
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

	@media (max-width: 768px) {
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