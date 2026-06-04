<script lang="ts">
  import { enhance } from '$app/forms'
  import Sheet from '$lib/components/Sheet.svelte'
  import AddExpenseForm from '$lib/components/AddExpenseForm.svelte'
  import EditExpenseForm from '$lib/components/EditExpenseForm.svelte'
  import SheetForm from '$lib/components/form/SheetForm.svelte'
  import Button from '$lib/components/base/Button.svelte'
  import Avatar from '$lib/components/base/Avatar.svelte'
  import Chip from '$lib/components/base/Chip.svelte'
  import EmptyState from '$lib/components/base/EmptyState.svelte'
  import ConfirmAction from '$lib/components/base/ConfirmAction.svelte'
  import { createExpenseFormState } from '$lib/utils/expense-form.svelte'
  import { formatCurrency, formatDate } from '$lib/utils/format'
  import { getBalanceColor, getBalanceBg, getBalanceLabel, calculatePartShare } from '$lib/utils/display'
  import { CURRENCIES } from '$lib/constants'
  import {
    IconArrowFlow,
    IconArrowRightShort,
    IconCheckSmall,
    IconCurrency,
    IconEdit,
    IconListLines,
    IconPlus,
    IconReceiptLarge,
    IconTrash,
    IconUser,
    IconUserAdd,
    IconUsers,
    IconX,
  } from '$lib/components/icons'

  let { data } = $props()

  let participants = $state(data.group.participants)
  let expenses = $state(data.group.expenses)
  let settlements = $state(data.group.settlements)

  $effect(() => {
    participants = data.group.participants
    expenses = data.group.expenses
    settlements = data.group.settlements
  })

  let participantNames = $derived(
    new Map(participants.map((p) => [p.id, p.name])),
  )
  let reversedExpenses = $derived(expenses.slice().reverse())

  let showAddExpense = $state(false)
  let showAddParticipant = $state(false)
  let showEditGroup = $state(false)
  let showDeleteGroup = $state(false)

  let editGroupName = $state('')
  let editGroupDescription = $state('')
  let editGroupCurrency = $state('USD')

  let addForm = createExpenseFormState(() => participants)
  let editForm = createExpenseFormState(() => participants)

  let editingExpenseId = $state<string | null>(null)
  let confirmingDeleteExpenseId = $state<string | null>(null)

  function openAddExpense() {
    addForm.reset(participants)
    showAddExpense = true
  }

  function openEditGroup() {
    editGroupName = data.group.name
    editGroupDescription = data.group.description
    editGroupCurrency = data.group.currency
    showEditGroup = true
  }

  function getParticipantName(id: string): string {
    return participants.find((p) => p.id === id)?.name ?? 'Unknown'
  }

  function fmt(amount: number): string {
    return formatCurrency(amount, data.currency)
  }

  function getSplitDisplay(e: {
    splitBetween: string[]
    splitMode: string
    splitParts?: Record<string, number>
    splitAmounts?: Record<string, number>
    amount: number
  }): string {
    const parts = e.splitParts
    const amounts = e.splitAmounts
    if (e.splitMode === 'parts' && parts) {
      const totalParts = Object.values(parts).reduce((sum, p) => sum + p, 0)
      return e.splitBetween
        .map((id) => {
          const p = parts?.[id] ?? 1
          const share = (p / totalParts) * e.amount
          return `${getParticipantName(id)}: ${p} part${p > 1 ? 's' : ''} (${fmt(share)})`
        })
        .join(', ')
    }
    if (e.splitMode === 'amount' && amounts) {
      return e.splitBetween
        .map((id) => `${getParticipantName(id)}: ${fmt(amounts[id] ?? 0)}`)
        .join(', ')
    }
    const perPerson = e.amount / e.splitBetween.length
    return `${e.splitBetween.map((id) => getParticipantName(id)).join(', ')} (${fmt(perPerson)} each)`
  }

  function startEdit(expense: {
    id: string
    title: string
    amount: number
    paidBy: string
    splitBetween: string[]
    splitMode: string
    splitParts?: Record<string, number>
    splitAmounts?: Record<string, number>
    date: string
  }) {
    editingExpenseId = expense.id
    editForm.setAmount(expense.amount)
    editForm.splitType =
      expense.splitBetween.length === participants.length ? 'all' : 'specific'
    editForm.selectedSplitters = [...expense.splitBetween]
    editForm.splitMode =
      (expense.splitMode as 'equal' | 'parts' | 'amount') || 'equal'
    editForm.splitParts = expense.splitParts ? { ...expense.splitParts } : {}
    editForm.splitAmounts = expense.splitAmounts
      ? { ...expense.splitAmounts }
      : {}
    editForm.splitAmountsTouched = new Set()
    if (
      editForm.splitMode === 'amount' &&
      (!expense.splitAmounts || Object.keys(expense.splitAmounts).length === 0)
    ) {
      editForm.initAmounts(expense.amount)
    }
  }

  function cancelEdit() {
    editingExpenseId = null
    editForm.splitMode = 'equal'
    editForm.splitParts = {}
    editForm.splitAmounts = {}
    editForm.splitAmountsTouched = new Set()
  }
</script>

<div class="container">
  <section class="group-hero animate-fade-in-up">
    <div class="group-hero-content">
      <div class="hero-badge">
        <Chip icon={IconUsers}>{participants.length} members</Chip>
        <Chip icon={IconCurrency}>{data.group.currency}</Chip>
      </div>
      <h1 class="text-3xl font-display">{data.group.name}</h1>
      {#if data.group.description}
        <p class="text-lg text-secondary mt-2">{data.group.description}</p>
      {/if}
    </div>
    <div class="hero-actions">
      {#if data.isOwner}
        <Button variant="secondary" onclick={() => (showAddParticipant = !showAddParticipant)}>
          <IconUserAdd size={18} strokeWidth={2.5} />
          Add Member
        </Button>
        <Button variant="primary" onclick={openAddExpense}>
          <IconPlus size={18} strokeWidth={2.5} />
          Add Expense
        </Button>
      {:else}
        <div class="guest-badge">
          <IconUser size={16} />
          View only (guest access)
        </div>
      {/if}
    </div>
    {#if data.isOwner}
      <div class="hero-bottom-actions">
        <Button variant="ghost" size="sm" onclick={openEditGroup} ariaLabel="Edit group">
          <IconEdit size={16} />
          Edit
        </Button>
        <Button variant="ghost" size="sm" class="hero-delete-btn" onclick={() => (showDeleteGroup = true)} ariaLabel="Delete group">
          <IconTrash size={16} />
          Delete
        </Button>
      </div>
    {/if}
  </section>

  {#if participants.length === 0}
    <EmptyState icon={IconUserAdd} message="Add at least 2 members to start tracking expenses." ctaLabel="Add Members" oncta={() => (showAddParticipant = true)} />
  {/if}

  <SheetForm title="Add New Member" action="?/addParticipant" submitLabel="Add Member" bind:open={showAddParticipant} onclose={() => showAddParticipant = false}>
    <input type="text" name="name" class="input" placeholder="Member name" required />
  </SheetForm>

  <SheetForm title="Edit Group" action="?/updateGroup" submitLabel="Save Changes" bind:open={showEditGroup} onclose={() => showEditGroup = false}>
    <div class="form-group">
      <label class="label" for="edit-name">Group Name</label>
      <input type="text" id="edit-name" name="name" class="input" bind:value={editGroupName} required />
    </div>
    <div class="form-group">
      <label class="label" for="edit-description">Description</label>
      <input type="text" id="edit-description" name="description" class="input" bind:value={editGroupDescription} />
    </div>
    <div class="form-group">
      <label class="label" for="edit-currency">Currency</label>
      <select id="edit-currency" name="currency" class="input" bind:value={editGroupCurrency}>
        {#each CURRENCIES as c}
          <option value={c.value}>{c.label}</option>
        {/each}
      </select>
    </div>
  </SheetForm>

  <Sheet bind:open={showDeleteGroup} size="narrow">
    <form method="POST" action="?/deleteGroup" use:enhance>
      <h3 class="text-lg font-display mb-2">Delete Group</h3>
      <p class="text-secondary mb-6">
        This will permanently delete <strong>{data.group.name}</strong> and all
        its expenses, settlements, and members. This action cannot be undone.
      </p>
      <div class="sheet-actions">
        <Button variant="ghost" onclick={() => (showDeleteGroup = false)}>Cancel</Button>
        <Button variant="danger" type="submit">Delete Group</Button>
      </div>
    </form>
  </Sheet>

  <AddExpenseForm
    bind:open={showAddExpense}
    form={addForm}
    {participants}
    formatCurrency={fmt}
    {calculatePartShare}
    onclose={() => (showAddExpense = false)}
  />

  <section class="dashboard-grid animate-fade-in-up stagger-2">
    <div class="stat-card card card-elevated">
      <div class="stat-header">
        <span class="stat-icon text-success">
          <IconCurrency size={24} />
        </span>
        <span class="stat-label">Total Expenses</span>
      </div>
      <div class="stat-value text-2xl font-display text-success">
        {fmt(data.total)}
      </div>
    </div>

    <div class="balances-card card card-elevated">
      <h3 class="text-base font-display mb-4">Balances</h3>
      <div class="balances-list">
        {#each data.balances as b}
          <div
            class="balance-item"
            style="--balance-color: {getBalanceColor(
              b.balance,
            )}; --balance-bg: {getBalanceBg(b.balance)}"
          >
            <Avatar name={b.participantName} />
            <div class="balance-info">
              <span class="balance-name">{b.participantName}</span>
              <span class="balance-label">{getBalanceLabel(b.balance)}</span>
              <span class="balance-detail text-sm text-secondary">
                Paid {fmt(b.totalPaid)} · Owes {fmt(b.totalOwed)}
              </span>
            </div>
            <div
              class="balance-amount"
              style="color: {getBalanceColor(
                b.balance,
              )}; background: {getBalanceBg(b.balance)}"
            >
              {b.balance > 0 ? '+' : ''}{fmt(b.balance)}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  {#if data.transactions.length > 0}
    <section class="settlements-section animate-fade-in-up stagger-3">
      <h2 class="section-title">Suggested Settlements</h2>
      <p class="text-secondary text-sm mb-4">
        Minimum transactions to settle all debts
      </p>
      <div class="transactions-list">
        {#each data.transactions as t}
          <div class="transaction-card card">
            <div class="transaction-flow">
              <div class="tf-avatar from">
                {getParticipantName(t.from).charAt(0)}
              </div>
              <div class="tf-arrow">
                <IconArrowFlow size={20} />
              </div>
              <div class="tf-avatar to">
                {getParticipantName(t.to).charAt(0)}
              </div>
            </div>
            <div class="transaction-details">
              <span class="tf-names">
                <strong>{getParticipantName(t.from)}</strong> owes
                <strong>{getParticipantName(t.to)}</strong>
              </span>
              <span class="tf-amount text-xl font-display">{fmt(t.amount)}</span
              >
            </div>
            <form
              method="POST"
              action="?/settleUp"
              class="settle-form"
              use:enhance
            >
              <input type="hidden" name="fromId" value={t.from} />
              <input type="hidden" name="toId" value={t.to} />
              <input type="hidden" name="amount" value={t.amount} />
              <Button variant="primary" size="sm" type="submit">Settle Up</Button>
            </form>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  {#if settlements.length > 0}
    <section class="settled-section animate-fade-in-up stagger-4">
      <h2 class="section-title">Settled Debts</h2>
      <div class="settled-list">
        {#each settlements as s}
          <div class="settled-card card" class:paid={s.paid}>
            <div class="settled-flow">
              <span class="settled-name">{getParticipantName(s.fromId)}</span>
              <IconArrowRightShort size={16} />
              <span class="settled-name">{getParticipantName(s.toId)}</span>
            </div>
            <span class="settled-amount font-display">{fmt(s.amount)}</span>
            <div class="settled-actions">
              {#if s.paid}
                <span class="badge badge-success">
                  <IconCheckSmall size={12} strokeWidth={3} />
                  Paid
                </span>
              {:else}
                <form method="POST" action="?/markPaid" use:enhance>
                  <input type="hidden" name="settlementId" value={s.id} />
                  <Button variant="secondary" size="sm" type="submit">Mark Paid</Button>
                </form>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <section class="expenses-section animate-fade-in-up stagger-4">
    <h2 class="section-title">Expense History</h2>
    {#if expenses.length === 0}
      <EmptyState icon={IconReceiptLarge} message="No expenses recorded yet." ctaLabel="Add First Expense" oncta={openAddExpense} />
    {:else}
      <div class="expenses-list">
        {#each reversedExpenses as e, i}
          <div
            class="expense-card card card-elevated animate-morph-in"
            style="animation-delay: {0.03 * i}s"
          >
            {#if editingExpenseId === e.id}
              <EditExpenseForm
                form={editForm}
                {participants}
                expense={e}
                formatCurrency={fmt}
                {calculatePartShare}
                onsave={() => (editingExpenseId = null)}
                oncancel={cancelEdit}
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
                      >{fmt(e.amount)}</span
                    >
                  </div>
                </div>
                <div class="expense-split text-sm text-secondary">
                  <IconListLines size={16} class="inline-icon" />
                  {getSplitDisplay(e)}
                </div>
              </div>
              <div class="expense-actions">
                {#if data.isOwner}
                  <Button variant="ghost" size="sm" onclick={() => startEdit(e)} ariaLabel="Edit expense">
                    <IconEdit size={16} />
                  </Button>
                  {#if confirmingDeleteExpenseId === e.id}
                    <span>Delete?</span>
                    <form
                      method="POST"
                      action="?/deleteExpense"
                      use:enhance={() =>
                        async ({ update }) => {
                          await update()
                          confirmingDeleteExpenseId = null
                        }}
                    >
                      <input type="hidden" name="expenseId" value={e.id} />
                      <Button variant="danger" size="sm" type="submit">Yes</Button>
                    </form>
                    <Button variant="ghost" size="sm" onclick={() => (confirmingDeleteExpenseId = null)}>No</Button>
                  {:else}
                    <Button variant="ghost" size="sm" class="text-danger" onclick={() => (confirmingDeleteExpenseId = e.id)} ariaLabel="Delete expense">
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

  <section class="members-section animate-fade-in-up stagger-5">
    <h2 class="section-title">Members</h2>
    <div class="members-grid">
      {#each participants as p}
        <div class="member-card card">
          <div class="member-avatar">
            {p.name.charAt(0).toUpperCase()}
          </div>
          <span class="member-name">{p.name}</span>
          {#if data.isOwner}
            <form
              method="POST"
              action="?/removeParticipant"
              class="member-action"
              use:enhance
            >
              <input type="hidden" name="participantId" value={p.id} />
              <Button variant="ghost" size="sm" class="text-danger" type="submit" ariaLabel="Remove member">
                <IconX size={16} />
              </Button>
            </form>
          {/if}
        </div>
      {/each}
    </div>
  </section>
</div>

<style>
  .group-hero {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 40px;
    padding: 32px;
    background: var(--color-surface-container-low);
    border-radius: var(--radius-xl);
    position: relative;
    overflow: hidden;
  }

  .group-hero::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 500px;
    height: 500px;
    background: radial-gradient(
      circle,
      rgba(var(--color-primary-rgb), 0.08) 0%,
      transparent 70%
    );
    border-radius: 50%;
    pointer-events: none;
  }

  .hero-badge {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .hero-actions {
    display: flex;
    gap: 12px;
    flex-shrink: 0;
    align-items: center;
  }

  .hero-bottom-actions {
    position: absolute;
    bottom: 16px;
    right: 20px;
    display: flex;
    gap: 4px;
    opacity: 0.6;
    transition: opacity var(--transition-fast);
  }

  .group-hero:hover .hero-bottom-actions {
    opacity: 1;
  }

  .guest-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: var(--color-surface-container);
    border-radius: var(--radius-full);
    font-size: 13px;
    font-weight: 500;
    color: var(--color-on-surface-variant);
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 20px;
    margin-bottom: 40px;
  }

  .stat-card {
    padding: 24px;
    min-width: 220px;
  }

  .stat-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: var(--radius-lg);
    background: var(--color-success-container);
  }

  .stat-label {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-on-surface-variant);
  }

  .stat-value {
    font-weight: 800;
  }

  .balances-card {
    padding: 24px;
  }

  .balances-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .balance-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--color-surface-container-low);
    border-radius: var(--radius-lg);
    transition: all var(--transition-fast);
  }

  .balance-item:hover {
    background: var(--color-surface-container);
  }

  .balance-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .balance-name {
    font-weight: 600;
    font-size: 15px;
  }

  .balance-label {
    font-size: 12px;
    color: var(--color-on-surface-variant);
  }

  .balance-amount {
    padding: 4px 10px;
    border-radius: var(--radius-full);
    font-weight: 700;
    font-size: 13px;
  }

  .section-title {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 16px;
    color: var(--color-on-surface);
  }

  .settlements-section {
    margin-bottom: 40px;
  }

  .transactions-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  .transaction-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
  }

  .transaction-flow {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tf-avatar {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-full);
    background: var(--color-primary-container);
    color: var(--color-on-primary-container);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 13px;
  }

  .tf-arrow {
    color: var(--color-outline);
  }

  .transaction-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .tf-names {
    font-size: 13px;
    color: var(--color-on-surface-variant);
  }

  .tf-amount {
    font-weight: 700;
  }

  .settle-form {
    flex-shrink: 0;
  }

  .settled-section {
    margin-bottom: 40px;
  }

  .settled-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .settled-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
  }

  .settled-card.paid {
    opacity: 0.7;
  }

  .settled-flow {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  .settled-name {
    font-weight: 600;
    font-size: 14px;
  }

  .settled-amount {
    font-weight: 700;
    font-size: 16px;
  }

  .settled-actions {
    flex-shrink: 0;
  }

  .expenses-section {
    margin-bottom: 40px;
  }

  .expenses-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .expense-card {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 20px;
  }

  .expense-main {
    flex: 1;
  }

  .expense-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;
  }

  .expense-payer {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .payer-avatar {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-full);
    background: linear-gradient(
      135deg,
      var(--color-primary-container) 0%,
      var(--color-secondary-container) 100%
    );
    color: var(--color-on-primary-container);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 16px;
  }

  .payer-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .payer-name {
    font-weight: 600;
  }

  .expense-title-amount {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }

  .expense-title {
    font-weight: 600;
    font-size: 16px;
  }

  .expense-amount {
    font-weight: 700;
  }

  .expense-split {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: var(--color-surface-container-low);
    border-radius: var(--radius-md);
  }

  .expense-actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }

  .members-section {
    margin-bottom: 40px;
  }

  .members-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }

  .member-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
  }

  .member-avatar {
    width: 40px;
    height: 40px;
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

  .member-name {
    flex: 1;
    font-weight: 600;
    font-size: 14px;
  }

  .member-action {
    flex-shrink: 0;
  }

  .font-display {
    font-family: var(--font-display);
  }

  @media (max-width: 768px) {
    .group-hero {
      flex-direction: column;
      gap: 24px;
    }

    .hero-actions {
      width: 100%;
    }

    .hero-actions :global(.btn) {
      flex: 1;
    }

    .dashboard-grid {
      grid-template-columns: 1fr;
    }

    .stat-card {
      min-width: 0;
    }

    .expense-card {
      flex-direction: column;
      gap: 16px;
    }

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

  @media (prefers-reduced-motion: reduce) {
    .animate-fade-in-up,
    .animate-morph-in {
      animation: none !important;
    }
  }
</style>
