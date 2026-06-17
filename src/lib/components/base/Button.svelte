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
