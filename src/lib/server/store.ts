import type { SupabaseClient } from '@supabase/supabase-js';
import type { Group, Participant, Expense, Settlement, Balance } from '$lib/types';

export async function getGroupsByOwner(supabase: SupabaseClient, ownerId: string): Promise<Group[]> {
	const { data: groups, error } = await supabase
		.from('groups')
		.select('*')
		.eq('owner_id', ownerId)
		.order('created_at', { ascending: false });

	if (error) throw error;
	if (!groups) return [];

	const result: Group[] = [];
	for (const g of groups) {
		const group = await getFullGroup(supabase, g.id);
		if (group) result.push(group);
	}
	return result;
}

export async function getGroupByInviteCode(supabase: SupabaseClient, inviteCode: string): Promise<Group | null> {
	const { data: group, error } = await supabase
		.from('groups')
		.select('*')
		.eq('invite_code', inviteCode)
		.single();

	if (error) return null;
	if (!group) return null;

	return getFullGroup(supabase, group.id);
}

export async function getGroupById(supabase: SupabaseClient, groupId: string): Promise<Group | null> {
	return getFullGroup(supabase, groupId);
}

export async function getFullGroup(supabase: SupabaseClient, groupId: string): Promise<Group | null> {
	const { data: group, error: groupError } = await supabase
		.from('groups')
		.select('*')
		.eq('id', groupId)
		.single();

	if (groupError) return null;
	if (!group) return null;

	const { data: participants } = await supabase
		.from('participants')
		.select('*')
		.eq('group_id', groupId)
		.order('created_at');

	const { data: expenses } = await supabase
		.from('expenses')
		.select('*')
		.eq('group_id', groupId)
		.order('date', { ascending: false });

	const { data: settlements } = await supabase
		.from('settlements')
		.select('*')
		.eq('group_id', groupId)
		.order('created_at');

	return {
		id: group.id,
		ownerId: group.owner_id,
		name: group.name,
		description: group.description || '',
		currency: group.currency,
		inviteCode: group.invite_code,
		createdAt: group.created_at,
		participants: (participants || []).map(p => ({
			id: p.id,
			groupId: p.group_id,
			userId: p.user_id,
			name: p.name,
			createdAt: p.created_at
		})),
		expenses: (expenses || []).map(e => ({
			id: e.id,
			groupId: e.group_id,
			title: e.title,
			amount: Number(e.amount),
			paidBy: e.paid_by,
			splitBetween: e.split_between || [],
			splitMode: e.split_mode as 'equal' | 'parts' | 'amount',
			splitParts: e.split_parts || undefined,
			splitAmounts: e.split_amounts || undefined,
			date: e.date,
			createdAt: e.created_at
		})),
		settlements: (settlements || []).map(s => ({
			id: s.id,
			groupId: s.group_id,
			fromId: s.from_id,
			toId: s.to_id,
			amount: Number(s.amount),
			paid: s.paid,
			createdAt: s.created_at
		}))
	};
}

export async function createGroup(
	supabase: SupabaseClient,
	name: string,
	description: string,
	currency: string,
	ownerId: string
): Promise<Group> {
	const { data: group, error } = await supabase
		.from('groups')
		.insert({ name, description, currency, owner_id: ownerId })
		.select()
		.single();

	if (error) throw error;
	if (!group) throw new Error('Failed to create group');

	return {
		id: group.id,
		ownerId: group.owner_id,
		name: group.name,
		description: group.description || '',
		currency: group.currency,
		inviteCode: group.invite_code,
		createdAt: group.created_at,
		participants: [],
		expenses: [],
		settlements: []
	};
}

export async function addParticipant(
	supabase: SupabaseClient,
	groupId: string,
	name: string,
	userId: string | null = null
): Promise<Participant> {
	const { data: participant, error } = await supabase
		.from('participants')
		.insert({ group_id: groupId, name, user_id: userId })
		.select()
		.single();

	if (error) throw error;
	if (!participant) throw new Error('Failed to add participant');

	return {
		id: participant.id,
		groupId: participant.group_id,
		userId: participant.user_id,
		name: participant.name,
		createdAt: participant.created_at
	};
}

export async function removeParticipant(supabase: SupabaseClient, groupId: string, participantId: string): Promise<boolean> {
	const { error } = await supabase
		.from('participants')
		.delete()
		.eq('id', participantId)
		.eq('group_id', groupId);

	return !error;
}

export async function updateParticipant(supabase: SupabaseClient, groupId: string, participantId: string, name: string): Promise<boolean> {
	const { error } = await supabase
		.from('participants')
		.update({ name })
		.eq('id', participantId)
		.eq('group_id', groupId);

	return !error;
}

export async function addExpense(
	supabase: SupabaseClient,
	groupId: string,
	title: string,
	amount: number,
	paidBy: string,
	splitBetween: string[],
	splitMode: 'equal' | 'parts' | 'amount' = 'equal',
	splitParts?: Record<string, number>,
	splitAmounts?: Record<string, number>,
	date?: string
): Promise<Expense> {
	const { data: expense, error } = await supabase
		.from('expenses')
		.insert({
			group_id: groupId,
			title,
			amount,
			paid_by: paidBy,
			split_between: splitBetween,
			split_mode: splitMode,
			split_parts: splitParts,
			split_amounts: splitAmounts,
			date: date || new Date().toISOString().split('T')[0]
		})
		.select()
		.single();

	if (error) throw error;
	if (!expense) throw new Error('Failed to add expense');

	return {
		id: expense.id,
		groupId: expense.group_id,
		title: expense.title,
		amount: Number(expense.amount),
		paidBy: expense.paid_by,
		splitBetween: expense.split_between || [],
		splitMode: expense.split_mode as 'equal' | 'parts' | 'amount',
		splitParts: expense.split_parts || undefined,
		splitAmounts: expense.split_amounts || undefined,
		date: expense.date,
		createdAt: expense.created_at
	};
}

export async function updateExpense(
	supabase: SupabaseClient,
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
): Promise<boolean> {
	const { error } = await supabase
		.from('expenses')
		.update({
			title,
			amount,
			paid_by: paidBy,
			split_between: splitBetween,
			split_mode: splitMode,
			split_parts: splitParts,
			split_amounts: splitAmounts,
			date: date || new Date().toISOString().split('T')[0]
		})
		.eq('id', expenseId)
		.eq('group_id', groupId);

	return !error;
}

export async function deleteExpense(supabase: SupabaseClient, groupId: string, expenseId: string): Promise<boolean> {
	const { error } = await supabase
		.from('expenses')
		.delete()
		.eq('id', expenseId)
		.eq('group_id', groupId);

	return !error;
}

export async function addSettlement(
	supabase: SupabaseClient,
	groupId: string,
	fromId: string,
	toId: string,
	amount: number
): Promise<Settlement> {
	const { data: settlement, error } = await supabase
		.from('settlements')
		.insert({ group_id: groupId, from_id: fromId, to_id: toId, amount })
		.select()
		.single();

	if (error) throw error;
	if (!settlement) throw new Error('Failed to add settlement');

	return {
		id: settlement.id,
		groupId: settlement.group_id,
		fromId: settlement.from_id,
		toId: settlement.to_id,
		amount: Number(settlement.amount),
		paid: settlement.paid,
		createdAt: settlement.created_at
	};
}

export async function markSettlementPaid(supabase: SupabaseClient, groupId: string, settlementId: string): Promise<boolean> {
	const { error } = await supabase
		.from('settlements')
		.update({ paid: true })
		.eq('id', settlementId)
		.eq('group_id', groupId);

	return !error;
}

export async function deleteSettlement(supabase: SupabaseClient, groupId: string, settlementId: string): Promise<boolean> {
	const { error } = await supabase
		.from('settlements')
		.delete()
		.eq('id', settlementId)
		.eq('group_id', groupId);

	return !error;
}

export function calculateBalances(group: Group): { balances: Map<string, number>; total: number } {
	const balances = new Map<string, number>();
	group.participants.forEach(p => balances.set(p.id, 0));

	let total = 0;
	group.expenses.forEach(e => {
		total += e.amount;
		const current = balances.get(e.paidBy) ?? 0;
		balances.set(e.paidBy, current + e.amount);

		if (e.splitMode === 'parts' && e.splitParts) {
			const totalParts = Object.values(e.splitParts).reduce((sum, p) => sum + p, 0);
			e.splitBetween.forEach(pid => {
				const parts = e.splitParts?.[pid] ?? 1;
				const owes = (parts / totalParts) * e.amount;
				const cur = balances.get(pid) ?? 0;
				balances.set(pid, cur - owes);
			});
		} else if (e.splitMode === 'amount' && e.splitAmounts) {
			e.splitBetween.forEach(pid => {
				const owes = e.splitAmounts?.[pid] ?? 0;
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

export async function updateGroup(
	supabase: SupabaseClient,
	groupId: string,
	name: string,
	description: string,
	currency: string
): Promise<boolean> {
	const { error } = await supabase
		.from('groups')
		.update({ name, description, currency })
		.eq('id', groupId);

	return !error;
}

export async function deleteGroup(supabase: SupabaseClient, groupId: string): Promise<boolean> {
	const { error } = await supabase
		.from('groups')
		.delete()
		.eq('id', groupId);

	return !error;
}

export async function isGroupOwner(supabase: SupabaseClient, groupId: string, userId: string): Promise<boolean> {
	const { data: group } = await supabase
		.from('groups')
		.select('owner_id')
		.eq('id', groupId)
		.eq('owner_id', userId)
		.single();

	return !!group;
}