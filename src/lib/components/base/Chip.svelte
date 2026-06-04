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
