<script lang="ts">
  import { createExpenseFormState } from '$lib/utils/expense-form.svelte'
  import { formatCurrency } from '$lib/utils/format'
  import { calculatePartShare } from '$lib/utils/display'
  import EmptyState from '$lib/components/base/EmptyState.svelte'
  import { IconUserAdd } from '$lib/components/icons'
  import GroupHero from '$lib/components/group/GroupHero.svelte'
  import GroupSheets from '$lib/components/group/GroupSheets.svelte'
  import GroupDashboard from '$lib/components/group/GroupDashboard.svelte'
  import GroupExpenseList from '$lib/components/group/GroupExpenseList.svelte'
  import GroupMembersGrid from '$lib/components/group/GroupMembersGrid.svelte'

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

<svelte:head>
	<title>{data.group.name} - SplitUp</title>
	<meta name="description" content="Manage expenses for {data.group.name}. Track balances, add expenses, and settle up with your group." />
</svelte:head>

<div class="container">
  <GroupHero
    group={data.group}
    participantCount={participants.length}
    isOwner={data.isOwner}
    onAddMember={() => (showAddParticipant = true)}
    onAddExpense={openAddExpense}
    onEditGroup={openEditGroup}
    onDeleteGroup={() => (showDeleteGroup = true)}
  />

  {#if participants.length === 0}
    <EmptyState
      icon={IconUserAdd}
      message="Add at least 2 members to start tracking expenses."
      ctaLabel="Add Members"
      oncta={() => (showAddParticipant = true)}
    />
  {/if}

  <GroupSheets
    bind:showAddExpense
    bind:showAddParticipant
    bind:showEditGroup
    bind:showDeleteGroup
    group={data.group}
    {addForm}
    {participants}
    {editGroupName}
    {editGroupDescription}
    {editGroupCurrency}
    formatCurrency={fmt}
    {calculatePartShare}
    onAddExpenseClose={() => (showAddExpense = false)}
    onAddParticipantClose={() => (showAddParticipant = false)}
    onEditGroupClose={() => (showEditGroup = false)}
    onDeleteGroupClose={() => (showDeleteGroup = false)}
  />

  <GroupDashboard
    summary={data.summary}
    {settlements}
    currency={data.currency}
    formatCurrency={fmt}
    {getParticipantName}
  />

  <GroupExpenseList
    {expenses}
    {participants}
    {reversedExpenses}
    form={editForm}
    isOwner={data.isOwner}
    {editingExpenseId}
    {confirmingDeleteExpenseId}
    formatCurrency={fmt}
    {calculatePartShare}
    onStartEdit={(e) => startEdit(e)}
    onCancelEdit={cancelEdit}
    onSaveEdit={() => (editingExpenseId = null)}
    onConfirmDelete={(id) => (confirmingDeleteExpenseId = id)}
    onCancelDelete={() => (confirmingDeleteExpenseId = null)}
    onOpenAddExpense={openAddExpense}
    {getParticipantName}
    {getSplitDisplay}
  />

  <GroupMembersGrid
    {participants}
    isOwner={data.isOwner}
  />
</div>

<style>
  .container {
    max-width: 960px;
    margin: 0 auto;
    padding: 0 16px;
  }
</style>
