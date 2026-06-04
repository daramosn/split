<script lang="ts">
  import { IconLink } from '$lib/components/icons'
  import Button from '$lib/components/base/Button.svelte'
</script>

<div class="join-section animate-fade-in-up stagger-4">
  <div class="card filled-tonal">
    <div class="join-content">
      <div class="join-icon">
        <IconLink size={24} strokeWidth={1.5} />
      </div>
      <div class="join-text">
        <h3 class="text-lg font-display">Join a Group</h3>
        <p class="text-secondary text-sm">Enter an invite code to join an existing group</p>
      </div>
    </div>
    <form class="join-form" method="POST" action="/api/join">
      <input type="text" name="inviteCode" class="input" placeholder="Paste invite code" required />
      <Button variant="secondary" type="submit">Join</Button>
    </form>
  </div>
</div>

<style>
  .join-section {
    margin-bottom: 64px;
  }

  .join-content {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
  }

  .join-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: var(--radius-lg);
    background: var(--color-primary-container);
    color: var(--color-primary);
  }

  .join-text {
    flex: 1;
  }

  .join-form {
    display: flex;
    gap: 12px;
  }

  @media (max-width: 768px) {
    .join-form {
      flex-direction: column;
    }
  }
</style>
