import type { Participant } from '$lib/types'

export interface ExpenseFormState {
  splitType: string
  selectedSplitters: string[]
  splitMode: 'equal' | 'parts' | 'amount'
  splitParts: Record<string, number>
  splitAmounts: Record<string, number>
  splitAmountsTouched: Set<string>
  amount: number
  activeSplitters: Participant[]
  initAmounts(amount: number): void
  onAmountChange(pId: string, value: number): void
  handleSplitTypeChange(type: string, allParticipants: Participant[]): void
  handleSplitModeChange(mode: 'equal' | 'parts' | 'amount', amount: number): void
  toggleSplitter(id: string): void
  reset(allParticipants: Participant[]): void
  setAmount(value: number): void
}

export function createExpenseFormState(
  getParticipants: () => Participant[],
): ExpenseFormState {
  let splitType = $state('all')
  let selectedSplitters = $state<string[]>(
    getParticipants().map((p) => p.id),
  )
  let splitMode = $state<'equal' | 'parts' | 'amount'>('equal')
  let splitParts = $state<Record<string, number>>({})
  let splitAmounts = $state<Record<string, number>>({})
  let splitAmountsTouched = $state<Set<string>>(new Set())
  let amount = $state(0)

  function getActiveSplitters() {
    const allParticipants = getParticipants()
    return splitType === 'specific'
      ? allParticipants.filter((p) => selectedSplitters.includes(p.id))
      : allParticipants
  }

  function initAmounts(amt: number) {
    const splitters = getActiveSplitters()
    if (splitters.length === 0) return
    const equalAmount = amt / splitters.length
    const newAmounts: Record<string, number> = {}
    splitters.forEach((p) => {
      newAmounts[p.id] = Math.round(equalAmount * 100) / 100
    })
    splitAmounts = newAmounts
    splitAmountsTouched = new Set()
  }

  function onAmountChange(pId: string, value: number) {
    const splitters = getActiveSplitters()
    splitAmountsTouched = new Set([...splitAmountsTouched, pId])
    splitAmounts[pId] = value

    const touchedTotal = splitters.reduce(
      (sum, p) =>
        sum +
        (splitAmountsTouched.has(p.id) ? (splitAmounts[p.id] ?? 0) : 0),
      0,
    )
    const untouched = splitters.filter((p) => !splitAmountsTouched.has(p.id))
    if (untouched.length > 0 && amount > touchedTotal) {
      const remaining = amount - touchedTotal
      const perPerson = Math.round((remaining / untouched.length) * 100) / 100
      untouched.forEach((p) => {
        splitAmounts[p.id] = perPerson
      })
    }
  }

  function handleSplitTypeChange(type: string, allParticipants: Participant[]) {
    splitType = type
    if (type === 'all') {
      selectedSplitters = allParticipants.map((p) => p.id)
    }
    if (splitMode === 'amount' && amount > 0) {
      initAmounts(amount)
    }
  }

  function handleSplitModeChange(
    mode: 'equal' | 'parts' | 'amount',
    amt: number,
  ) {
    splitMode = mode
    if (mode === 'amount' && amt > 0) {
      initAmounts(amt)
    }
  }

  function toggleSplitter(id: string) {
    if (selectedSplitters.includes(id)) {
      selectedSplitters = selectedSplitters.filter((x) => x !== id)
    } else {
      selectedSplitters = [...selectedSplitters, id]
    }
    if (splitMode === 'amount' && amount > 0) {
      initAmounts(amount)
    }
  }

  function reset(allParticipants: Participant[]) {
    splitType = 'all'
    splitMode = 'equal'
    selectedSplitters = allParticipants.map((p) => p.id)
    splitParts = {}
    splitAmounts = {}
    splitAmountsTouched = new Set()
    amount = 0
  }

  function setAmount(value: number) {
    amount = value
  }

  return {
    get splitType() {
      return splitType
    },
    set splitType(v: string) {
      splitType = v
    },
    get selectedSplitters() {
      return selectedSplitters
    },
    set selectedSplitters(v: string[]) {
      selectedSplitters = v
    },
    get splitMode() {
      return splitMode
    },
    set splitMode(v: 'equal' | 'parts' | 'amount') {
      splitMode = v
    },
    get splitParts() {
      return splitParts
    },
    set splitParts(v: Record<string, number>) {
      splitParts = v
    },
    get splitAmounts() {
      return splitAmounts
    },
    set splitAmounts(v: Record<string, number>) {
      splitAmounts = v
    },
    get splitAmountsTouched() {
      return splitAmountsTouched
    },
    set splitAmountsTouched(v: Set<string>) {
      splitAmountsTouched = v
    },
    get amount() {
      return amount
    },
    set amount(v: number) {
      amount = v
    },
    get activeSplitters() {
      return getActiveSplitters()
    },
    initAmounts,
    onAmountChange,
    handleSplitTypeChange,
    handleSplitModeChange,
    toggleSplitter,
    reset,
    setAmount,
  }
}
