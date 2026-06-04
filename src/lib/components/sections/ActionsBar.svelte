<script lang="ts">
  import { IconPlus } from '$lib/components/icons'
  import Button from '$lib/components/base/Button.svelte'
</script>

<div class="actions-bar animate-fade-in-up stagger-2">
  <a href="/create">
    <Button variant="primary" size="lg">
      <IconPlus size={20} strokeWidth={2.5} />
      Create Group
    </Button>
  </a>
</div>

<style>
  .actions-bar {
    display: flex;
    gap: 16px;
    margin-bottom: 48px;
  }
</style>
