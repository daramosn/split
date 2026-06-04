<script lang="ts">
  import GoogleSignInButton from '$lib/components/base/GoogleSignInButton.svelte'
  import { signInWithGoogle } from '$lib/utils/auth'
</script>

<div class="auth-prompt animate-fade-in-up stagger-2">
  <p class="text-secondary">Sign in to create and manage your expense groups</p>
  <GoogleSignInButton onclick={signInWithGoogle} />
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
