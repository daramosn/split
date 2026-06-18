<script lang="ts">
  interface Props {
    items: { id: string; name: string }[]
    selected: string[]
    hiddenName: string
    onToggle: (id: string) => void
  }

  let { items, selected, hiddenName, onToggle }: Props = $props()
</script>

<div class="splitter-chips">
  {#each items as item}
    <label class="chip" class:chip-filled={selected.includes(item.id)}>
      <input
        type="checkbox"
        checked={selected.includes(item.id)}
        onchange={() => onToggle(item.id)}
      />
      {item.name}
    </label>
  {/each}
</div>
<input type="hidden" name={hiddenName} value={selected.join(',')} />

<style>
  .splitter-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .splitter-chips :global(.chip) {
    cursor: pointer;
  }

  .splitter-chips :global(.chip input) {
    display: none;
  }
</style>
