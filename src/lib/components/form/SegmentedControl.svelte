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
