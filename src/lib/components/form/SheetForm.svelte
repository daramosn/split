<script lang="ts">
  import { enhance } from '$app/forms'
  import type { Snippet } from 'svelte'
  import Sheet from '../Sheet.svelte'
  import Button from '../base/Button.svelte'

  interface Props {
    open: boolean
    title: string
    action: string
    submitLabel: string
    size?: 'narrow' | 'default' | 'wide'
    children: Snippet
    onclose: () => void
  }

  let {
    open = $bindable(false),
    title,
    action,
    submitLabel,
    size = 'default',
    children,
    onclose,
  }: Props = $props()

  let closeSheet = $state(() => {})
  let submitting = $state(false)

  function handleCancel() {
    closeSheet()
    onclose()
  }

  function handleSuccess() {
    closeSheet()
    onclose()
  }
</script>

<Sheet bind:open={open} onready={(fn) => closeSheet = fn} {title} {size}>
  <form
    method="POST"
    {action}
    class="add-participant-form"
    use:enhance={() => {
      submitting = true
      return async ({ result, update }: { result: { type: string }; update: (opts?: { reset?: boolean }) => Promise<void> }) => {
        try {
          await update({ reset: false })
          if (result.type === 'success' || result.type === 'redirect') {
            handleSuccess()
          }
        } finally {
          submitting = false
        }
      }
    }}
  >
    {@render children()}
    <div class="sheet-actions">
      <Button variant="ghost" onclick={handleCancel} disabled={submitting}>Cancel</Button>
      <Button variant="primary" type="submit" disabled={submitting} aria-busy={submitting}>
        {#if submitting}
          <span class="spinner" aria-hidden="true"></span>
          Saving...
        {:else}
          {submitLabel}
        {/if}
      </Button>
    </div>
  </form>
</Sheet>

<style>
  .add-participant-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .sheet-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 24px;
  }
</style>
