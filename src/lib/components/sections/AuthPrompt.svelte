<script lang="ts">
	import { createClient } from '$lib/supabase/client';
	import { IconSearch } from '$lib/components/icons';

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

<div class="auth-prompt animate-fade-in-up stagger-2">
	<p class="text-secondary">Sign in to create and manage your expense groups</p>
	<button class="btn btn-primary btn-lg" onclick={signInWithGoogle}>
		<IconSearch size={20} />
		Sign in with Google
	</button>
</div>

<style>
	.auth-prompt {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		margin-bottom: 48px;
		padding: 32px;
		background: var(--color-surface-container);
		border-radius: var(--radius-xl);
		text-align: center;
	}

	@media (max-width: 768px) {
		.auth-prompt {
			padding: 24px;
		}
	}
</style>