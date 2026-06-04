<script lang="ts">
  import type { Component } from 'svelte'
  import type { Snippet } from 'svelte'

  interface Props {
    id: string
    label: string
    name?: string
    type?: 'text' | 'number' | 'date' | 'select'
    placeholder?: string
    required?: boolean
    min?: string | number
    step?: string
    value?: string | number
    options?: { value: string; label: string }[]
    labelIcon?: Component<{ size?: number }>
    oninput?: (e: Event) => void
    onchange?: (e: Event) => void
    class?: string
    children?: Snippet
  }

  let {
    id,
    label,
    name = id,
    type = 'text',
    placeholder = '',
    required = false,
    min,
    step,
    value,
    options,
    labelIcon: Icon,
    oninput,
    onchange,
    class: className = '',
    children,
  }: Props = $props()
</script>

<div class="form-group {className}">
  <label class="label" for={id}>
    {#if Icon}
      <span class="label-icon"><Icon size={16} /></span>
    {/if}
    {label}
    {#if children}
      <span class="optional">{@render children()}</span>
    {/if}
  </label>
  {#if type === 'select' && options}
    <select {id} {name} class="input" {required}>
      {#each options as opt}
        <option value={opt.value} selected={value === opt.value}>{opt.label}</option>
      {/each}
    </select>
  {:else}
    <input
      {type}
      {id}
      {name}
      class="input"
      {required}
      value={value}
      {placeholder}
      {min}
      {step}
      {oninput}
      {onchange}
    />
  {/if}
</div>

<style>
  .label-icon {
    display: flex;
    align-items: center;
    color: var(--color-primary);
  }

  .optional {
    font-weight: 400;
    color: var(--color-on-surface-variant);
    font-size: 13px;
  }
</style>
