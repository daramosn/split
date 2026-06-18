<script lang="ts">
  import type { Component } from 'svelte'
  import type { Snippet } from 'svelte'

  interface Props {
    icon?: Component<{ size?: number }>
    filled?: boolean
    children?: Snippet
  }

  let { icon: Icon, filled = false, children }: Props = $props()
</script>

<span class="chip" class:chip-filled={filled}>
  {#if Icon}
    <Icon size={14} />
  {/if}
  {#if children}
    {@render children()}
  {/if}
</span>

<style>
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: var(--radius-full);
    font-size: 13px;
    font-weight: 600;
    background: var(--color-surface-container);
    color: var(--color-on-surface);
    border: 1px solid var(--color-outline-variant);
    transition: all var(--transition-fast);
  }

  .chip:hover {
    background: var(--color-surface-container-high);
  }

  .chip-filled {
    background: var(--color-primary-container);
    color: var(--color-on-primary-container);
    border-color: transparent;
  }

  .chip-filled:hover {
    background: var(--color-primary-container-hover);
  }
</style>
