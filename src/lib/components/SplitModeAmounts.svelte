<script lang="ts">
  import type { ExpenseFormState } from '$lib/utils/expense-form.svelte'

  interface Props {
    form: ExpenseFormState
  }

  let { form }: Props = $props()
</script>

<fieldset class="form-group">
  <legend class="label">Amounts</legend>
  <div class="split-inputs">
    {#each form.activeSplitters as p}
      <div class="split-row">
        <span class="split-name">{p.name}</span>
        <input
          type="number"
          class="input input-sm"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={form.splitAmounts[p.id] ?? 0}
          oninput={(e) =>
            form.onAmountChange(
              p.id,
              parseFloat(e.currentTarget.value) || 0,
            )}
        />
      </div>
    {/each}
  </div>
  <input
    type="hidden"
    name="splitAmounts"
    value={JSON.stringify(form.splitAmounts)}
  />
</fieldset>

<style>
  .split-inputs {
    padding: 16px;
    background: var(--color-surface-container-low);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-outline-variant);
  }

  .split-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .split-row:last-child {
    margin-bottom: 0;
  }

  .split-name {
    font-weight: 500;
    font-size: 14px;
  }

  .split-row :global(.input) {
    width: 80px;
  }
</style>
