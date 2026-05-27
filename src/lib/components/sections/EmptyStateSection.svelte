<script lang="ts">
	import { createClient } from '$lib/supabase/client';
	import { IconSearch, IconGroup } from '$lib/components/icons';

	const supabase = createClient();

	async function signInWithGoogle() {
		document.cookie = `auth_redirect=/; path=/; max-age=300; SameSite=Lax`;
		await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${window.location.origin}/auth/callback`
			}
		});
	}
</script>

<section class="empty-state animate-fade-in-up stagger-2">
	<div class="empty-illustration">
		<div class="empty-circles">
			<div class="ec-circle ec-1"></div>
			<div class="ec-circle ec-2"></div>
			<div class="ec-circle ec-3"></div>
		</div>
		<div class="empty-icon">
			<IconGroup size={48} strokeWidth={1.5} />
		</div>
	</div>
	<h2 class="text-2xl font-display">Get started with SplitUp</h2>
	<p class="text-secondary mt-2">Sign in with Google to create your first group<br/>and start splitting expenses with friends.</p>
	<button class="btn btn-primary btn-lg mt-6" onclick={signInWithGoogle}>
		<IconSearch size={20} />
		Sign in with Google
	</button>
</section>

<style>
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
</style>