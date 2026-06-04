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
