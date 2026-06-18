<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    variant?: 'success' | 'danger' | 'warning'
    children: Snippet
  }

  let { variant, children }: Props = $props()
</script>

<span class="badge" class:badge-success={variant === 'success'} class:badge-danger={variant === 'danger'} class:badge-warning={variant === 'warning'}>
  {@render children()}
</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    border-radius: var(--radius-full);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .badge-success {
    background: var(--color-success-container);
    color: var(--color-on-success-container);
  }

  .badge-danger {
    background: var(--color-danger-container);
    color: var(--color-on-danger-container);
  }

  .badge-warning {
    background: var(--color-warning-container);
    color: var(--color-on-warning-container);
  }
</style>
