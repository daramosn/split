<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'xs' | 'sm' | 'default' | 'lg'
    iconOnly?: boolean
    type?: 'button' | 'submit'
    disabled?: boolean
    ariaLabel?: string
    class?: string
    onclick?: (e: MouseEvent) => void
    children: Snippet
  }

  let {
    variant = 'primary',
    size = 'default',
    iconOnly = false,
    type = 'button',
    disabled = false,
    ariaLabel,
    class: className = '',
    onclick,
    children,
  }: Props = $props()
</script>

<button
  {type}
  class="btn btn-{variant}{size !== 'default' ? ' btn-' + size : ''}{iconOnly ? ' btn-icon' : ''} {className}"
  {disabled}
  aria-label={ariaLabel}
  {onclick}
>
  {@render children()}
</button>
