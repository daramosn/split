<script lang="ts">
  import Chip from '$lib/components/base/Chip.svelte'
  import Button from '$lib/components/base/Button.svelte'
  import { IconUsers, IconCurrency, IconUserAdd, IconPlus, IconUser, IconEdit, IconTrash } from '$lib/components/icons'
  import type { Group } from '$lib/types'

  interface Props {
    group: Group
    participantCount: number
    isOwner: boolean
    onAddMember: () => void
    onAddExpense: () => void
    onEditGroup: () => void
    onDeleteGroup: () => void
  }

  let {
    group,
    participantCount,
    isOwner,
    onAddMember,
    onAddExpense,
    onEditGroup,
    onDeleteGroup,
  }: Props = $props()
</script>

<section class="group-hero animate-fade-in-up">
  <div class="group-hero-content">
    <div class="hero-badge">
      <Chip icon={IconUsers}>{participantCount} members</Chip>
      <Chip icon={IconCurrency}>{group.currency}</Chip>
    </div>
    <h1 class="text-3xl font-display">{group.name}</h1>
    {#if group.description}
      <p class="text-lg text-secondary mt-2">{group.description}</p>
    {/if}
  </div>
  <div class="hero-actions">
    {#if isOwner}
      <Button variant="secondary" onclick={onAddMember}>
        <IconUserAdd size={18} strokeWidth={2.5} />
        Add Member
      </Button>
      <Button variant="primary" onclick={onAddExpense}>
        <IconPlus size={18} strokeWidth={2.5} />
        Add Expense
      </Button>
    {:else}
      <div class="guest-badge">
        <IconUser size={16} />
        View only (guest access)
      </div>
    {/if}
  </div>
  {#if isOwner}
    <div class="hero-bottom-actions">
      <Button variant="ghost" size="sm" onclick={onEditGroup} ariaLabel="Edit group">
        <IconEdit size={16} />
        Edit
      </Button>
      <Button variant="ghost" size="sm" class="hero-delete-btn" onclick={onDeleteGroup} ariaLabel="Delete group">
        <IconTrash size={16} />
        Delete
      </Button>
    </div>
  {/if}
</section>

<style>
  .group-hero {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 40px;
    padding: 32px;
    background: var(--color-surface-container-low);
    border-radius: var(--radius-xl);
    position: relative;
    overflow: hidden;
  }

  .group-hero::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 500px;
    height: 500px;
    background: radial-gradient(
      circle,
      rgba(var(--color-primary-rgb), 0.08) 0%,
      transparent 70%
    );
    border-radius: 50%;
    pointer-events: none;
  }

  .hero-badge {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .hero-actions {
    display: flex;
    gap: 12px;
    flex-shrink: 0;
    align-items: center;
  }

  .hero-bottom-actions {
    position: absolute;
    bottom: 16px;
    right: 20px;
    display: flex;
    gap: 4px;
    opacity: 0.6;
    transition: opacity var(--transition-fast);
  }

  .group-hero:hover .hero-bottom-actions {
    opacity: 1;
  }

  .guest-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: var(--color-surface-container);
    border-radius: var(--radius-full);
    font-size: 13px;
    font-weight: 500;
    color: var(--color-on-surface-variant);
  }
</style>
