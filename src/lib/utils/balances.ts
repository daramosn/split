import type { Group } from '$lib/types'

export function calculateBalances(group: Group): { balances: Map<string, number>; total: number } {
	const balances = new Map<string, number>()
	group.participants.forEach(p => balances.set(p.id, 0))

	let total = 0
	group.expenses.forEach(e => {
		total += e.amount
		const current = balances.get(e.paidBy) ?? 0
		balances.set(e.paidBy, current + e.amount)

		if (e.splitMode === 'parts' && e.splitParts) {
			const totalParts = Object.values(e.splitParts).reduce((sum, p) => sum + p, 0)
			e.splitBetween.forEach(pid => {
				const parts = e.splitParts?.[pid] ?? 1
				const owes = (parts / totalParts) * e.amount
				const cur = balances.get(pid) ?? 0
				balances.set(pid, cur - owes)
			})
		} else if (e.splitMode === 'amount' && e.splitAmounts) {
			e.splitBetween.forEach(pid => {
				const owes = e.splitAmounts?.[pid] ?? 0
				const cur = balances.get(pid) ?? 0
				balances.set(pid, cur - owes)
			})
		} else {
			const perPerson = e.amount / e.splitBetween.length
			e.splitBetween.forEach(pid => {
				const cur = balances.get(pid) ?? 0
				balances.set(pid, cur - perPerson)
			})
		}
	})

	group.settlements.forEach(s => {
		if (s.paid) {
			const from = balances.get(s.fromId) ?? 0
			const to = balances.get(s.toId) ?? 0
			balances.set(s.fromId, from + s.amount)
			balances.set(s.toId, to - s.amount)
		}
	})

	return { balances, total }
}

export function calculateOptimizedTransactions(group: Group): { from: string; to: string; amount: number }[] {
	const { balances } = calculateBalances(group)

	const creditors: { id: string; amount: number }[] = []
	const debtors: { id: string; amount: number }[] = []

	balances.forEach((amount, pid) => {
		if (amount > 0.01) creditors.push({ id: pid, amount })
		else if (amount < -0.01) debtors.push({ id: pid, amount: -amount })
	})

	creditors.sort((a, b) => b.amount - a.amount)
	debtors.sort((a, b) => b.amount - a.amount)

	const transactions: { from: string; to: string; amount: number }[] = []

	while (creditors.length && debtors.length) {
		const creditor = creditors[0]
		const debtor = debtors[0]
		const min = Math.min(creditor.amount, debtor.amount)

		transactions.push({ from: debtor.id, to: creditor.id, amount: Math.round(min * 100) / 100 })

		creditor.amount -= min
		debtor.amount -= min

		if (creditor.amount < 0.01) creditors.shift()
		if (debtor.amount < 0.01) debtors.shift()
	}

	return transactions
}
