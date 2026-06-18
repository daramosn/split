<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLButtonAttributes } from 'svelte/elements'

  interface Props extends HTMLButtonAttributes {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'xs' | 'sm' | 'default' | 'lg'
    iconOnly?: boolean
    type?: 'button' | 'submit'
    disabled?: boolean
    ariaLabel?: string
    class?: string
    children: Snippet
  }

  let {
    variant = 'primary',
    size = 'default',
    iconOnly = false,
    class: className = '',
    children,
    ...rest
  }: Props = $props()
</script>

<button
  class="btn btn-{variant}{size !== 'default' ? ' btn-' + size : ''}{iconOnly
    ? ' btn-icon'
    : ''} {className}"
  {...rest}
>
  {@render children()}
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 24px;
    border-radius: var(--radius-full);
    font-weight: 600;
    font-size: 14px;
    font-family: var(--font-body);
    letter-spacing: 0.02em;
    text-transform: none;
    transition: all var(--transition-fast);
    white-space: nowrap;
    position: relative;
    overflow: hidden;
  }

  .btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: currentColor;
    opacity: 0;
    transition: opacity var(--transition-fast);
  }

  .btn:hover::before {
    opacity: 0.08;
  }

  .btn:active {
    transform: scale(0.98);
  }

  .btn-primary {
    background: var(--color-primary-container);
    color: var(--color-on-primary-container);
    box-shadow: var(--elevation-1);
  }

  .btn-primary:hover {
    background: var(--color-primary-container-hover);
  }

  .btn-secondary {
    background: var(--color-surface-container-high);
    color: var(--color-primary);
    box-shadow: var(--elevation-1);
  }

  .btn-secondary:hover {
    background: var(--color-surface-container-highest);
  }

  .btn-danger {
    background: var(--color-danger-container);
    color: var(--color-on-danger-container);
    box-shadow: var(--elevation-1);
  }

  .btn-danger:hover {
    filter: brightness(0.95);
  }

  .btn-ghost {
    color: var(--color-on-surface-variant);
    background: transparent;
  }

  .btn-ghost:hover {
    background: var(--color-surface-container-high);
  }

  .btn-sm {
    padding: 8px 16px;
    font-size: 13px;
  }

  .btn-xs {
    padding: 4px 10px;
    font-size: 12px;
  }

  .btn-lg {
    padding: 16px 32px;
    font-size: 16px;
  }

  .btn-icon {
    width: 48px;
    height: 48px;
    padding: 0;
    border-radius: var(--radius-lg);
  }

  .btn-icon.btn-sm {
    width: 40px;
    height: 40px;
  }

  .btn:disabled,
  .btn.disabled {
    opacity: 0.6;
    pointer-events: none;
    cursor: not-allowed;
  }
</style>
