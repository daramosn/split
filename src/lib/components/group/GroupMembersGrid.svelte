<script lang="ts">
  import { enhance } from '$app/forms'
  import Button from '$lib/components/base/Button.svelte'
  import { IconX } from '$lib/components/icons'
  import type { Participant } from '$lib/types'

  interface Props {
    participants: Participant[]
    isOwner: boolean
  }

  let { participants, isOwner }: Props = $props()
</script>

<section class="members-section animate-fade-in-up stagger-5">
  <h2 class="section-title">Members</h2>
  <div class="members-grid">
    {#each participants as p}
      <div class="member-card card">
        <div class="member-avatar">
          {p.name.charAt(0).toUpperCase()}
        </div>
        <span class="member-name">{p.name}</span>
        {#if isOwner}
          <form
            method="POST"
            action="?/removeParticipant"
            class="member-action"
            use:enhance
          >
            <input type="hidden" name="participantId" value={p.id} />
            <Button variant="ghost" size="sm" class="text-danger" type="submit" ariaLabel="Remove member">
              <IconX size={16} />
            </Button>
          </form>
        {/if}
      </div>
    {/each}
  </div>
</section>

<style>
  .members-section {
    margin-bottom: 40px;
  }

  .members-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
  }

  .member-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-radius: var(--radius-lg);
    transition: all var(--transition-fast);
  }

  .member-card:hover {
    transform: translateY(-1px);
    box-shadow: var(--elevation-2);
  }

  .member-avatar {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-full);
    background: var(--color-primary-container);
    color: var(--color-on-primary-container);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    flex-shrink: 0;
  }

  .member-name {
    flex: 1;
    font-weight: 500;
    font-size: 14px;
  }

  .member-action {
    margin-left: auto;
  }

  .section-title {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 20px;
    color: var(--color-on-surface);
  }

  @media (max-width: 600px) {
    .members-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
