<script lang="ts">
  import { enhance } from '$app/forms'
  import SplitModeParts from '$lib/components/SplitModeParts.svelte'
  import SplitModeAmounts from '$lib/components/SplitModeAmounts.svelte'
  import SegmentedControl from '$lib/components/form/SegmentedControl.svelte'
  import ChipSelector from '$lib/components/form/ChipSelector.svelte'
  import Button from '$lib/components/base/Button.svelte'
  import type { ExpenseFormState } from '$lib/utils/expense-form.svelte'
  import type { Participant } from '$lib/types'

  interface Props {
    form: ExpenseFormState
    participants: Participant[]
    expense: {
      id: string
      title: string
      amount: number
      paidBy: string
      splitBetween: string[]
      splitMode: string
      splitParts?: Record<string, number>
      splitAmounts?: Record<string, number>
      date: string
    }
    formatCurrency: (amount: number) => string
    calculatePartShare: (parts: Record<string, number>, amount: number) => number
    onsave: () => void
    oncancel: () => void
  }

  let {
    form,
    participants,
    expense,
    formatCurrency,
    calculatePartShare,
    onsave,
    oncancel,
  }: Props = $props()

  let splitTypeOptions = [
    { value: 'all', label: 'Everyone' },
    { value: 'specific', label: 'Specific' },
  ]
  let splitModeOptions = [
    { value: 'equal', label: 'Equal' },
    { value: 'parts', label: 'Parts' },
    { value: 'amount', label: 'Amount' },
  ]

  function handleSplitTypeChange(value: string) {
    form.splitType = value
    if (value === 'all') {
      form.selectedSplitters = participants.map((p) => p.id)
      form.splitMode = 'equal'
      form.splitParts = {}
      form.splitAmounts = {}
    }
  }

  function handleSplitModeChange(value: string) {
    form.splitMode = value as 'equal' | 'parts' | 'amount'
    if (value === 'amount' && form.amount > 0) form.initAmounts(form.amount)
  }
</script>

<form
  method="POST"
  action="?/updateExpense"
  class="edit-expense-form"
  role="region"
  aria-label="Edit expense: {expense.title}"
  use:enhance={() => async ({ update }) => {
    onsave()
    await update()
  }}
>
  <input type="hidden" name="expenseId" value={expense.id} />
  <div class="form-row">
    <input type="text" name="title" class="input" value={expense.title} required />
    <input
      type="number" name="amount" class="input"
      step="0.01" min="0.01" value={expense.amount} required
      oninput={(ev) => {
        const val = parseFloat(ev.currentTarget.value) || 0
        form.setAmount(val)
        if (form.splitMode === 'amount') form.initAmounts(val)
      }}
    />
  </div>
  <div class="form-row">
    <select name="paidBy" class="input" required>
      {#each participants as p}
        <option value={p.id} selected={p.id === expense.paidBy}>{p.name}</option>
      {/each}
    </select>
    <input type="date" name="date" class="input" value={expense.date} required />
  </div>
  <div class="form-group">
    <SegmentedControl
      name="splitType"
      options={splitTypeOptions}
      value={form.splitType}
      onchange={handleSplitTypeChange}
    />
  </div>
  {#if form.splitType === 'specific'}
    <ChipSelector
      items={participants}
      selected={form.selectedSplitters}
      hiddenName="splitBetween"
      onToggle={(id) => {
        if (form.selectedSplitters.includes(id)) {
          form.selectedSplitters = form.selectedSplitters.filter((x) => x !== id)
        } else {
          form.selectedSplitters = [...form.selectedSplitters, id]
        }
      }}
    />
  {/if}
  <div class="form-group">
    <SegmentedControl
      name="splitMode"
      options={splitModeOptions}
      value={form.splitMode}
      onchange={handleSplitModeChange}
    />
  </div>
  {#if form.splitMode === 'parts'}
    <SplitModeParts {form} {formatCurrency} {calculatePartShare} />
  {:else if form.splitMode === 'amount'}
    <SplitModeAmounts {form} />
  {/if}
  <div class="form-actions">
    <Button variant="ghost" size="sm" onclick={oncancel}>Cancel</Button>
    <Button variant="primary" size="sm" type="submit">Save Changes</Button>
  </div>
</form>
