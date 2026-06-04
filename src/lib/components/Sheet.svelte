<script lang="ts">
  import type { Snippet } from 'svelte'
  import { IconX } from '$lib/components/icons'

  interface Props {
    open?: boolean
    title?: string
    size?: 'narrow' | 'default' | 'wide'
    onclose?: () => void
    children: Snippet
  }

  let {
    open = $bindable(false),
    title,
    size = 'default',
    onclose,
    children,
  }: Props = $props()

  let dialog: HTMLDialogElement

  $effect(() => {
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  })

  $effect(() => {
    if (!dialog) return
    const onDialogClose = () => {
      open = false
      onclose?.()
    }
    const onDialogCancel = (e: Event) => {
      e.preventDefault()
      open = false
      onclose?.()
    }
    dialog.addEventListener('close', onDialogClose)
    dialog.addEventListener('cancel', onDialogCancel)
    return () => {
      dialog.removeEventListener('close', onDialogClose)
      dialog.removeEventListener('cancel', onDialogCancel)
    }
  })
</script>

<dialog bind:this={dialog} class="sheet-dialog sheet-{size}">
  {#if title}
    <div class="sheet-header">
      <h3 class="text-lg font-display">{title}</h3>
      <button
        type="button"
        class="close-btn"
        onclick={() => dialog.close()}
        aria-label="Close dialog"
      >
        <IconX size={20} />
      </button>
    </div>
  {/if}
  <div class="sheet-body">
    {@render children()}
  </div>
</dialog>

<style>
  .sheet-dialog {
    position: fixed;
    top: auto;
    right: auto;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    margin: 0;
    width: 100%;
    max-width: 480px;
    border: none;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    padding: 24px;
    background: var(--color-surface-bright);
    z-index: 101;
    animation: slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .sheet-dialog::backdrop {
    background: var(--color-scrim);
    animation: fadeIn 0.3s ease forwards;
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

  @keyframes slideInUp {
    from {
      transform: translateX(-50%) translateY(100%);
    }
    to {
      transform: translateX(-50%) translateY(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .sheet-dialog {
      animation: none;
    }

    .sheet-dialog::backdrop {
      animation: none;
    }
  }
</style>
