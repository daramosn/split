<script lang="ts">
  import type { ExpenseFormState } from '$lib/utils/expense-form.svelte'

  interface Props {
    form: ExpenseFormState
    formatCurrency: (amount: number) => string
    calculatePartShare: (parts: Record<string, number>, amount: number) => number
  }

  let { form, formatCurrency, calculatePartShare }: Props = $props()
</script>

<fieldset class="form-group">
  <legend class="label">Parts</legend>
  <div class="split-inputs">
    {#each form.activeSplitters as p}
      <div class="split-row">
        <span class="split-name">{p.name}</span>
        <div class="split-parts-input">
          <input
            type="number"
            class="input input-sm"
            min="1"
            value={form.splitParts[p.id] ?? 1}
            onchange={(e) =>
              (form.splitParts[p.id] =
                parseInt(e.currentTarget.value) || 1)}
          />
          <span class="split-calc"
            >= {formatCurrency(
              calculatePartShare(form.splitParts, form.amount) *
                (form.splitParts[p.id] ?? 1),
            )}</span
          >
        </div>
      </div>
    {/each}
  </div>
  <input
    type="hidden"
    name="splitParts"
    value={JSON.stringify(form.splitParts)}
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

  .split-parts-input {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .split-parts-input :global(.input) {
    width: 60px;
  }

  .split-calc {
    font-size: 12px;
    color: var(--color-on-surface-variant);
    min-width: 80px;
  }
</style>
