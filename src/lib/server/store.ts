import type { Group, Participant, Expense, Settlement } from '$lib/types';

function generateId(): string {
	return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const groups = new Map<string, Group>();

export function getAllGroups(): Group[] {
	return Array.from(groups.values());
}

export function getGroup(id: string): Group | undefined {
	return groups.get(id);
}

export function createGroup(name: string, description: string, currency: string, participantNames: string[]): Group {
	const id = generateId();
	const now = new Date().toISOString();
	const participants: Participant[] = participantNames.map(n => ({ id: generateId(), name: n }));

	const group: Group = {
		id,
		name,
		description,
		currency,
		createdAt: now,
		participants,
		expenses: [],
		settlements: []
	};

	groups.set(id, group);
	return group;
}

export function addParticipant(groupId: string, name: string): Participant | undefined {
	const group = groups.get(groupId);
	if (!group) return undefined;

	const participant: Participant = { id: generateId(), name };
	group.participants.push(participant);
	return participant;
}

export function removeParticipant(groupId: string, participantId: string): boolean {
	const group = groups.get(groupId);
	if (!group) return false;

	const idx = group.participants.findIndex(p => p.id === participantId);
	if (idx === -1) return false;

	group.participants.splice(idx, 1);
	group.expenses = group.expenses.map(e => ({
		...e,
		paidBy: e.paidBy === participantId ? e.paidBy : e.paidBy,
		splitBetween: e.splitBetween.filter(id => id !== participantId)
	}));
	group.settlements = group.settlements.filter(s => s.fromId !== participantId && s.toId !== participantId);
	return true;
}

export function updateParticipant(groupId: string, participantId: string, name: string): boolean {
	const group = groups.get(groupId);
	if (!group) return false;

	const participant = group.participants.find(p => p.id === participantId);
	if (!participant) return false;

	participant.name = name;
	return true;
}

export function addExpense(
	groupId: string,
	title: string,
	amount: number,
	paidBy: string,
	splitBetween: string[],
	splitMode: 'equal' | 'parts' | 'amount' = 'equal',
	splitParts?: Record<string, number>,
	splitAmounts?: Record<string, number>,
	date?: string
): Expense | undefined {
	const group = groups.get(groupId);
	if (!group) return undefined;

	const payer = group.participants.find(p => p.id === paidBy);
	const validSplitters = splitBetween.filter(id => group.participants.some(p => p.id === id));

	if (!payer || validSplitters.length === 0) return undefined;

	const expense: Expense = {
		id: generateId(),
		title,
		amount,
		paidBy,
		splitBetween: validSplitters,
		splitMode,
		splitParts: splitParts && Object.keys(splitParts).length > 0 ? splitParts : undefined,
		splitAmounts: splitAmounts && Object.keys(splitAmounts).length > 0 ? splitAmounts : undefined,
		date: date ?? new Date().toISOString().split('T')[0]
	};

	group.expenses.push(expense);
	return expense;
}

export function updateExpense(
	groupId: string,
	expenseId: string,
	title: string,
	amount: number,
	paidBy: string,
	splitBetween: string[],
	splitMode: 'equal' | 'parts' | 'amount' = 'equal',
	splitParts?: Record<string, number>,
	splitAmounts?: Record<string, number>,
	date?: string
): boolean {
	const group = groups.get(groupId);
	if (!group) return false;

	const expense = group.expenses.find(e => e.id === expenseId);
	if (!expense) return false;

	expense.title = title;
	expense.amount = amount;
	expense.paidBy = paidBy;
	expense.splitBetween = splitBetween.filter(id => group.participants.some(p => p.id === id));
	expense.splitMode = splitMode;
	expense.splitParts = splitParts && Object.keys(splitParts).length > 0 ? splitParts : undefined;
	expense.splitAmounts = splitAmounts && Object.keys(splitAmounts).length > 0 ? splitAmounts : undefined;
	expense.date = date ?? expense.date;

	return true;
}

export function deleteExpense(groupId: string, expenseId: string): boolean {
	const group = groups.get(groupId);
	if (!group) return false;

	const idx = group.expenses.findIndex(e => e.id === expenseId);
	if (idx === -1) return false;

	group.expenses.splice(idx, 1);
	return true;
}

export function addSettlement(groupId: string, fromId: string, toId: string, amount: number): Settlement | undefined {
	const group = groups.get(groupId);
	if (!group) return undefined;

	const settlement: Settlement = {
		id: generateId(),
		fromId,
		toId,
		amount,
		paid: false
	};

	group.settlements.push(settlement);
	return settlement;
}

export function markSettlementPaid(groupId: string, settlementId: string): boolean {
	const group = groups.get(groupId);
	if (!group) return false;

	const settlement = group.settlements.find(s => s.id === settlementId);
	if (!settlement) return false;

	settlement.paid = true;
	return true;
}

export function deleteSettlement(groupId: string, settlementId: string): boolean {
	const group = groups.get(groupId);
	if (!group) return false;

	const idx = group.settlements.findIndex(s => s.id === settlementId);
	if (idx === -1) return false;

	group.settlements.splice(idx, 1);
	return true;
}

export function calculateBalances(group: Group): { balances: Map<string, number>; total: number } {
	const balances = new Map<string, number>();
	group.participants.forEach(p => balances.set(p.id, 0));

	let total = 0;
	group.expenses.forEach(e => {
		total += e.amount;
		const current = balances.get(e.paidBy) ?? 0;
		balances.set(e.paidBy, current + e.amount);

		let owesTotal = 0;
		if (e.splitMode === 'parts' && e.splitParts) {
			const totalParts = Object.values(e.splitParts).reduce((sum, p) => sum + p, 0);
			e.splitBetween.forEach(pid => {
				const parts = e.splitParts?.[pid] ?? 1;
				const owes = (parts / totalParts) * e.amount;
				owesTotal += owes;
				const cur = balances.get(pid) ?? 0;
				balances.set(pid, cur - owes);
			});
		} else if (e.splitMode === 'amount' && e.splitAmounts) {
			e.splitBetween.forEach(pid => {
				const owes = e.splitAmounts?.[pid] ?? 0;
				owesTotal += owes;
				const cur = balances.get(pid) ?? 0;
				balances.set(pid, cur - owes);
			});
		} else {
			const perPerson = e.amount / e.splitBetween.length;
			e.splitBetween.forEach(pid => {
				const cur = balances.get(pid) ?? 0;
				balances.set(pid, cur - perPerson);
			});
		}
	});

	group.settlements.forEach(s => {
		if (s.paid) {
			const from = balances.get(s.fromId) ?? 0;
			const to = balances.get(s.toId) ?? 0;
			balances.set(s.fromId, from + s.amount);
			balances.set(s.toId, to - s.amount);
		}
	});

	return { balances, total };
}

export function calculateOptimizedTransactions(group: Group): { from: string; to: string; amount: number }[] {
	const { balances } = calculateBalances(group);

	const creditors: { id: string; amount: number }[] = [];
	const debtors: { id: string; amount: number }[] = [];

	balances.forEach((amount, pid) => {
		if (amount > 0.01) creditors.push({ id: pid, amount });
		else if (amount < -0.01) debtors.push({ id: pid, amount: -amount });
	});

	creditors.sort((a, b) => b.amount - a.amount);
	debtors.sort((a, b) => b.amount - a.amount);

	const transactions: { from: string; to: string; amount: number }[] = [];

	while (creditors.length && debtors.length) {
		const creditor = creditors[0];
		const debtor = debtors[0];
		const min = Math.min(creditor.amount, debtor.amount);

		transactions.push({ from: debtor.id, to: creditor.id, amount: Math.round(min * 100) / 100 });

		creditor.amount -= min;
		debtor.amount -= min;

		if (creditor.amount < 0.01) creditors.shift();
		if (debtor.amount < 0.01) debtors.shift();
	}

	return transactions;
}