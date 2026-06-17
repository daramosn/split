<script lang="ts">
  import { enhance } from '$app/forms'
  import Sheet from '$lib/components/Sheet.svelte'
  import SheetForm from '$lib/components/form/SheetForm.svelte'
  import AddExpenseForm from '$lib/components/AddExpenseForm.svelte'
  import Button from '$lib/components/base/Button.svelte'
  import type { ExpenseFormState } from '$lib/utils/expense-form.svelte'
  import type { Participant, Group } from '$lib/types'
  import { CURRENCIES } from '$lib/constants'

  interface Props {
    showAddExpense: boolean
    showAddParticipant: boolean
    showEditGroup: boolean
    showDeleteGroup: boolean
    group: Group
    addForm: ExpenseFormState
    participants: Participant[]
    editGroupName: string
    editGroupDescription: string
    editGroupCurrency: string
    formatCurrency: (amount: number) => string
    calculatePartShare: (parts: Record<string, number>, amount: number) => number
    onAddExpenseClose: () => void
    onAddParticipantClose: () => void
    onEditGroupClose: () => void
    onDeleteGroupClose: () => void
  }

  let {
    showAddExpense = $bindable(false),
    showAddParticipant = $bindable(false),
    showEditGroup = $bindable(false),
    showDeleteGroup = $bindable(false),
    group,
    addForm,
    participants,
    editGroupName,
    editGroupDescription,
    editGroupCurrency,
    formatCurrency,
    calculatePartShare,
    onAddExpenseClose,
    onAddParticipantClose,
    onEditGroupClose,
    onDeleteGroupClose,
  }: Props = $props()
</script>

<AddExpenseForm
  bind:open={showAddExpense}
  form={addForm}
  {participants}
  {formatCurrency}
  {calculatePartShare}
  onclose={onAddExpenseClose}
/>

<SheetForm
  title="Add New Member"
  action="?/addParticipant"
  submitLabel="Add Member"
  bind:open={showAddParticipant}
  onclose={onAddParticipantClose}
>
  <input type="text" name="name" class="input" placeholder="Member name" required />
</SheetForm>

<SheetForm
  title="Edit Group"
  action="?/updateGroup"
  submitLabel="Save Changes"
  bind:open={showEditGroup}
  onclose={onEditGroupClose}
>
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
      This will permanently delete <strong>{group.name}</strong> and all
      its expenses, settlements, and members. This action cannot be undone.
    </p>
    <div class="sheet-actions">
      <Button variant="ghost" onclick={onDeleteGroupClose}>Cancel</Button>
      <Button variant="danger" type="submit">Delete Group</Button>
    </div>
  </form>
</Sheet>
