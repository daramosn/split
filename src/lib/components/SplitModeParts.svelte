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
