<script lang="ts">
  import type { Participant } from '$lib/types'

  interface Props {
    name?: string
    src?: string
    size?: 'sm' | 'default' | 'lg' | 'xl'
    gradient?: boolean
  }

  let { name, src, size = 'default', gradient = false }: Props = $props()

  let sizeClass = $derived(
    size === 'sm' ? 'avatar-sm' : size === 'lg' ? 'avatar-lg' : size === 'xl' ? 'avatar-xl' : '',
  )
</script>

{#if src}
  <img class="avatar {sizeClass}" src={src} alt={name ?? ''} />
{:else}
  <div class="avatar {sizeClass}" class:avatar-gradient={gradient}>
    {name?.charAt(0).toUpperCase() ?? '?'}
  </div>
{/if}

<style>
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-full);
    background: var(--color-primary-container);
    color: var(--color-on-primary-container);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 16px;
    flex-shrink: 0;
    object-fit: cover;
  }

  .avatar-gradient {
    background: linear-gradient(
      135deg,
      var(--color-primary-container) 0%,
      var(--color-secondary-container) 100%
    );
  }

  .avatar-sm {
    width: 32px;
    height: 32px;
    font-size: 13px;
  }

  .avatar-lg {
    width: 56px;
    height: 56px;
    font-size: 24px;
  }

  .avatar-xl {
    width: 72px;
    height: 72px;
    font-size: 28px;
  }
</style>
