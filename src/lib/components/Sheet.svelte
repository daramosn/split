<script lang="ts">
  import type { Snippet } from 'svelte'
  import { IconX } from '$lib/components/icons'

  interface Props {
    open?: boolean
    title?: string
    size?: 'narrow' | 'default' | 'wide'
    onclose?: () => void
    onready?: (close: () => void) => void
    children: Snippet
  }

  let {
    open = $bindable(false),
    title,
    size = 'default',
    onclose,
    onready,
    children,
  }: Props = $props()

  let popoverEle: HTMLDivElement

  function close() {
    if (popoverEle?.matches(':popover-open')) {
      popoverEle.hidePopover()
    }
    open = false
    onclose?.()
  }

  $effect(() => {
    onready?.(close)
  })

  // Popover → parent (backdrop click, Escape key)
  $effect(() => {
    if (!popoverEle) return
    const onToggle = (e: ToggleEvent) => {
      if (e.newState === 'closed') {
        open = false
        onclose?.()
      }
    }
    popoverEle.addEventListener('toggle', onToggle)
    return () => popoverEle.removeEventListener('toggle', onToggle)
  })

  // Parent → popover (open direction only)
  $effect(() => {
    if (!popoverEle) return
    if (open && !popoverEle.matches(':popover-open')) {
      popoverEle.showPopover()
    }
  })
</script>

<div bind:this={popoverEle} popover="auto" class="sheet-popover sheet-{size}">
  {#if title}
    <div class="sheet-header">
      <h3 class="text-lg font-display">{title}</h3>
      <button
        type="button"
        class="close-btn"
        onclick={close}
        aria-label="Close"
      >
        <IconX size={20} />
      </button>
    </div>
  {/if}
  <div class="sheet-body">
    {@render children()}
  </div>
</div>

<style>
  .sheet-popover {
    transition:
      transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
      display 0.4s allow-discrete,
      overlay 0.4s allow-discrete;
    transform: translateX(-50%) translateY(100%);
    position: fixed;
    top: auto;
    bottom: 0;
    left: 50%;
    width: 100%;
    max-width: 480px;
    margin: 0;
    padding: 24px;
    border: none;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    background: var(--color-surface-bright);
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
    overflow: hidden;
  }

  .sheet-popover:popover-open {
    display: flex;
    flex-direction: column;
    transform: translateX(-50%) translateY(0);
  }

  @starting-style {
    .sheet-popover:popover-open {
      transform: translateX(-50%) translateY(100%);
    }
  }

  .sheet-popover::backdrop {
    background: var(--color-scrim);
    opacity: 0;
    transition:
      opacity 0.3s ease,
      display 0.3s allow-discrete,
      overlay 0.3s allow-discrete;
  }

  .sheet-popover:popover-open::backdrop {
    opacity: 1;
  }

  @starting-style {
    .sheet-popover:popover-open::backdrop {
      opacity: 0;
    }
  }

  .sheet-narrow {
    max-width: 400px;
  }

  .sheet-wide {
    max-width: 560px;
  }

  .sheet-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .sheet-body {
    flex: 1;
    overflow-y: auto;
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-full);
    color: var(--color-on-surface-variant);
    background: none;
    border: none;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .close-btn:hover {
    background: var(--color-surface-container);
    color: var(--color-on-surface);
  }

  @media (prefers-reduced-motion: reduce) {
    .sheet-popover,
    .sheet-popover::backdrop {
      transition: none !important;
    }
  }
</style>
