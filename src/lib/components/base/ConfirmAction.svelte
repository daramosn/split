<script lang="ts">
  import { enhance } from '$app/forms'
  import Button from './Button.svelte'

  interface Props {
    open: boolean
    action: string
    fieldName: string
    value: string
    message?: string
    onclose: () => void
  }

  let { open = $bindable(false), action, fieldName, value, message = 'Are you sure?', onclose }: Props = $props()
</script>

{#if open}
  <span class="confirm-text">{message}</span>
  <form
    method="POST"
    {action}
    use:enhance={() => async ({ update }) => {
      await update()
      open = false
    }}
  >
    <input type="hidden" name={fieldName} {value} />
    <Button variant="danger" size="xs" type="submit">Yes</Button>
  </form>
  <Button variant="ghost" size="xs" onclick={onclose}>No</Button>
{/if}

<style>
  .confirm-text {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-on-surface);
  }
</style>
