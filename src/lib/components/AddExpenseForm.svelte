<script lang="ts">
  import { enhance } from '$app/forms'
  import Sheet from '$lib/components/Sheet.svelte'
  import SplitModeParts from '$lib/components/SplitModeParts.svelte'
  import SplitModeAmounts from '$lib/components/SplitModeAmounts.svelte'
  import SegmentedControl from '$lib/components/form/SegmentedControl.svelte'
  import ChipSelector from '$lib/components/form/ChipSelector.svelte'
  import Button from '$lib/components/base/Button.svelte'
  import type { ExpenseFormState } from '$lib/utils/expense-form.svelte'
  import type { Participant } from '$lib/types'
  import { IconX } from '$lib/components/icons'

  interface Props {
    open: boolean
    form: ExpenseFormState
    participants: Participant[]
    formatCurrency: (amount: number) => string
    calculatePartShare: (parts: Record<string, number>, amount: number) => number
    onclose: () => void
  }

  let {
    open = $bindable(false),
    form,
    participants,
    formatCurrency,
    calculatePartShare,
    onclose,
  }: Props = $props()

  let splitTypeOptions = [
    { value: 'all', label: 'Everyone' },
    { value: 'specific', label: 'Specific' },
  ]
  let splitModeOptions = [
    { value: 'equal', label: 'Equal' },
    { value: 'parts', label: 'By Parts' },
    { value: 'amount', label: 'By Amount' },
  ]

  let closeSheet = $state(() => {})
  let submitting = $state(false)

  function handleCancel() {
    closeSheet()
    onclose()
  }

  function handleSuccess() {
    form.reset(participants)
    closeSheet()
    onclose()
  }
</script>

<Sheet bind:open={open} onready={(fn) => closeSheet = fn} size="wide">
  <form
    method="POST"
    action="?/addExpense"
    class="expense-form"
    use:enhance={() => {
      submitting = true
      return async ({ result, update }: { result: { type: string }; update: (opts?: { reset?: boolean }) => Promise<void> }) => {
        try {
          await update({ reset: false })
          if (result.type === 'success' || result.type === 'redirect') {
            handleSuccess()
          }
        } finally {
          submitting = false
        }
      }
    }}
  >
    <div class="form-header">
      <h3 class="text-lg font-display">Add Expense</h3>
      <button type="button" class="close-btn" onclick={handleCancel} aria-label="Close dialog">
        <IconX size={20} />
      </button>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="label" for="title">Title</label>
        <input type="text" id="title" name="title" class="input" placeholder="Dinner at Luigi's" required />
      </div>
      <div class="form-group">
        <label class="label" for="amount">Amount</label>
        <input
          type="number" id="amount" name="amount" class="input"
          step="0.01" min="0.01" placeholder="0.00" required
          oninput={(e) => {
            const val = parseFloat(e.currentTarget.value) || 0
            form.setAmount(val)
            if (form.splitMode === 'amount') form.initAmounts(val)
          }}
        />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="label" for="paidBy">Paid by</label>
        <select id="paidBy" name="paidBy" class="input" required>
          {#each participants as p}
            <option value={p.id}>{p.name}</option>
          {/each}
        </select>
      </div>
      <div class="form-group">
        <label class="label" for="date">Date</label>
        <input type="date" id="date" name="date" class="input" value={new Date().toISOString().split('T')[0]} />
      </div>
    </div>

    <fieldset class="form-group">
      <legend class="label">Split Type</legend>
      <SegmentedControl
        name="splitType"
        options={splitTypeOptions}
        value={form.splitType}
        onchange={(v) => form.handleSplitTypeChange(v, participants)}
      />
    </fieldset>

    {#if form.splitType === 'specific'}
      <fieldset class="form-group">
        <legend class="label">Split between</legend>
        <ChipSelector
          items={participants}
          selected={form.selectedSplitters}
          hiddenName="splitBetween"
          onToggle={(id) => form.toggleSplitter(id)}
        />
      </fieldset>
    {/if}

    <fieldset class="form-group">
      <legend class="label">Split Mode</legend>
      <SegmentedControl
        name="splitMode"
        options={splitModeOptions}
        value={form.splitMode}
        onchange={(v) => form.handleSplitModeChange(v as 'equal' | 'parts' | 'amount', form.amount)}
      />
    </fieldset>

    {#if form.splitMode === 'parts'}
      <SplitModeParts {form} {formatCurrency} {calculatePartShare} />
    {:else if form.splitMode === 'amount'}
      <SplitModeAmounts {form} />
    {/if}

    <div class="sheet-actions">
      <Button variant="ghost" onclick={handleCancel} disabled={submitting}>Cancel</Button>
      <Button variant="primary" type="submit" disabled={submitting} aria-busy={submitting}>
        {#if submitting}
          <span class="spinner" aria-hidden="true"></span>
          Adding...
        {:else}
          Add Expense
        {/if}
      </Button>
    </div>
  </form>
</Sheet>
