<script lang="ts">
  import { IconGoogle } from '$lib/components/icons'
  import Button from './Button.svelte'

  let { size = 'default', onclick }: { size?: 'default' | 'lg'; onclick: () => void } = $props()
</script>

<Button variant="primary" {size} {onclick}>
  <IconGoogle size={20} />
  Sign in with Google
</Button>
