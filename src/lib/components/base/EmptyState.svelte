<script lang="ts">
  import type { Component } from 'svelte'
  import Button from './Button.svelte'

  interface Props {
    icon: Component<{ size?: number; strokeWidth?: number }>
    message: string
    ctaLabel?: string
    oncta?: () => void
  }

  let { icon: Icon, message, ctaLabel, oncta }: Props = $props()
</script>

<div class="card filled-tonal text-center py-12">
  <div class="ep-icon">
    <Icon size={40} strokeWidth={1.5} />
  </div>
  <p class="text-secondary">{message}</p>
  {#if ctaLabel && oncta}
    <Button variant="primary" class="mt-4" onclick={oncta}>+ {ctaLabel}</Button>
  {/if}
</div>

<style>
  .ep-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    border-radius: var(--radius-full);
    background: var(--color-surface-container);
    color: var(--color-primary);
    margin-bottom: 16px;
  }
</style>
