<script lang="ts">
  import { enhance } from '$app/forms'
  import EditExpenseForm from '$lib/components/EditExpenseForm.svelte'
  import Button from '$lib/components/base/Button.svelte'
  import EmptyState from '$lib/components/base/EmptyState.svelte'
  import { IconListLines, IconEdit, IconTrash, IconReceiptLarge } from '$lib/components/icons'
  import { formatDate } from '$lib/utils/format'
  import type { ExpenseFormState } from '$lib/utils/expense-form.svelte'
  import type { Expense, Participant } from '$lib/types'

  interface Props {
    expenses: Expense[]
    participants: Participant[]
    reversedExpenses: Expense[]
    form: ExpenseFormState
    isOwner: boolean
    editingExpenseId: string | null
    confirmingDeleteExpenseId: string | null
    formatCurrency: (amount: number) => string
    calculatePartShare: (parts: Record<string, number>, amount: number) => number
    onStartEdit: (expense: Expense) => void
    onCancelEdit: () => void
    onSaveEdit: () => void
    onConfirmDelete: (id: string) => void
    onCancelDelete: () => void
    onOpenAddExpense: () => void
    getParticipantName: (id: string) => string
    getSplitDisplay: (e: { splitBetween: string[]; splitMode: string; splitParts?: Record<string, number>; splitAmounts?: Record<string, number>; amount: number }) => string
  }

  let {
    expenses,
    participants,
    reversedExpenses,
    form,
    isOwner,
    editingExpenseId,
    confirmingDeleteExpenseId,
    formatCurrency,
    calculatePartShare,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onConfirmDelete,
    onCancelDelete,
    onOpenAddExpense,
    getParticipantName,
    getSplitDisplay,
  }: Props = $props()
</script>

<section class="expenses-section animate-fade-in-up stagger-4">
  <h2 class="section-title">Expense History</h2>
  {#if expenses.length === 0}
    <EmptyState icon={IconReceiptLarge} message="No expenses recorded yet." ctaLabel="Add First Expense" oncta={onOpenAddExpense} />
  {:else}
    <div class="expenses-list">
      {#each reversedExpenses as e, i}
        <div
          class="expense-card card card-elevated animate-morph-in"
          style="animation-delay: {0.03 * i}s"
        >
          {#if editingExpenseId === e.id}
            <EditExpenseForm
              form={form}
              {participants}
              expense={e}
              {formatCurrency}
              {calculatePartShare}
              onsave={onSaveEdit}
              oncancel={onCancelEdit}
            />
          {:else}
            <div class="expense-main">
              <div class="expense-header">
                <div class="expense-payer">
                  <div class="payer-avatar">
                    {getParticipantName(e.paidBy).charAt(0)}
                  </div>
                  <div class="payer-info">
                    <span class="payer-name"
                      >{getParticipantName(e.paidBy)}</span
                    >
                    <span class="expense-date text-sm text-secondary"
                      >{formatDate(e.date)}</span
                    >
                  </div>
                </div>
                <div class="expense-title-amount">
                  <span class="expense-title">{e.title}</span>
                  <span class="expense-amount text-xl font-display"
                    >{formatCurrency(e.amount)}</span
                  >
                </div>
              </div>
              <div class="expense-split text-sm text-secondary">
                <IconListLines size={16} class="inline-icon" />
                {getSplitDisplay(e)}
              </div>
            </div>
            <div class="expense-actions">
              {#if isOwner}
                <Button variant="ghost" size="sm" onclick={() => onStartEdit(e)} ariaLabel="Edit expense">
                  <IconEdit size={16} />
                </Button>
                {#if confirmingDeleteExpenseId === e.id}
                  <span class="confirm-delete-label">Delete?</span>
                  <form
                    method="POST"
                    action="?/deleteExpense"
                    use:enhance={() =>
                      async ({ update }: { update: (opts?: { reset?: boolean }) => Promise<void> }) => {
                        await update()
                        onCancelDelete()
                      }}
                  >
                    <input type="hidden" name="expenseId" value={e.id} />
                    <Button variant="danger" size="sm" type="submit">Yes</Button>
                  </form>
                  <Button variant="ghost" size="sm" onclick={onCancelDelete}>No</Button>
                {:else}
                  <Button variant="ghost" size="sm" class="text-danger" onclick={() => onConfirmDelete(e.id)} ariaLabel="Delete expense">
                    <IconTrash size={16} />
                  </Button>
                {/if}
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</section>

<style>
  .expenses-section {
    margin-bottom: 40px;
  }

  .section-title {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 20px;
    color: var(--color-on-surface);
  }

  .expenses-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .expense-card {
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    transition: all var(--transition-fast);
  }

  .expense-card:hover {
    transform: translateY(-1px);
    box-shadow: var(--elevation-3);
  }

  .expense-main {
    flex: 1;
  }

  .expense-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 10px;
  }

  .expense-payer {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .payer-avatar {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-full);
    background: var(--color-primary-container);
    color: var(--color-on-primary-container);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    flex-shrink: 0;
  }

  .payer-name {
    font-weight: 600;
    font-size: 14px;
  }

  .expense-title-amount {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }

  .expense-title {
    font-weight: 500;
    font-size: 15px;
  }

  .expense-amount {
    font-weight: 700;
    color: var(--color-primary);
  }

  .expense-split {
    display: flex;
    align-items: center;
    gap: 6px;
    padding-top: 8px;
    border-top: 1px solid var(--color-outline-variant);
  }

  .expense-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  .confirm-delete-label {
    font-size: 13px;
    color: var(--color-danger);
    font-weight: 500;
  }

  .inline-icon {
    flex-shrink: 0;
  }

  @media (max-width: 600px) {
    .expense-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .expense-title-amount {
      align-items: flex-start;
    }

    .expense-actions {
      align-self: flex-end;
    }
  }
</style>
