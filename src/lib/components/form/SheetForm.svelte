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
</script>

<Sheet bind:open={open} {title} {size}>
  <form
    method="POST"
    {action}
    class="add-participant-form"
    use:enhance={() => async ({ update }) => {
      await update()
      onclose()
    }}
  >
    {@render children()}
    <div class="sheet-actions">
      <Button variant="ghost" onclick={onclose}>Cancel</Button>
      <Button variant="primary" type="submit">{submitLabel}</Button>
    </div>
  </form>
</Sheet>
