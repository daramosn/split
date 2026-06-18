<script lang="ts">
  interface Props {
    name: string
    options: { value: string; label: string }[]
    value: string
    onchange?: (value: string) => void
  }

  let { name, options, value, onchange }: Props = $props()
</script>

<div class="segmented-control">
  {#each options as opt}
    <label class="segment" class:active={value === opt.value}>
      <input
        type="radio"
        {name}
        value={opt.value}
        checked={value === opt.value}
        onchange={() => onchange?.(opt.value)}
      />
      <span>{opt.label}</span>
    </label>
  {/each}
</div>

<style>
  .segmented-control {
    display: flex;
    background: var(--color-surface-container);
    border-radius: var(--radius-lg);
    padding: 4px;
    gap: 4px;
  }

  .segment {
    flex: 1;
    cursor: pointer;
    padding: 10px 16px;
    border-radius: var(--radius-md);
    font-size: 14px;
    font-weight: 600;
    text-align: center;
    transition: all var(--transition-fast);
    color: var(--color-on-surface-variant);
  }

  .segment input {
    display: none;
  }

  .segment:hover {
    color: var(--color-on-surface);
  }

  .segment.active {
    background: var(--color-surface-bright);
    color: var(--color-primary);
    box-shadow: var(--elevation-1);
  }
</style>
