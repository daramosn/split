import type { SupabaseClient } from '@supabase/supabase-js';
import type { Group, Participant, Expense, Settlement } from '$lib/types';
import { calculateBalances, calculateOptimizedTransactions } from '$lib/utils/balances';

export { calculateBalances, calculateOptimizedTransactions };

export async function getGroupsByOwner(supabase: SupabaseClient, ownerId: string): Promise<Group[]> {
	const { data: groups, error } = await supabase
		.from('groups')
		.select(`
			*,
			participants(*),
			expenses(*),
			settlements(*)
		`)
		.eq('owner_id', ownerId)
		.order('created_at', { ascending: false });

	if (error) throw error;
	if (!groups) return [];

	return groups.map(mapGroupRow);
}

function mapGroupRow(g: any): Group {
	return {
		id: g.id,
		ownerId: g.owner_id,
		name: g.name,
		description: g.description || '',
		currency: g.currency,
		inviteCode: g.invite_code,
		createdAt: g.created_at,
		participants: (g.participants || []).map((p: any) => ({
			id: p.id,
			groupId: p.group_id,
			userId: p.user_id,
			name: p.name,
			createdAt: p.created_at
		})),
		expenses: (g.expenses || []).map((e: any) => ({
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
		settlements: (g.settlements || []).map((s: any) => ({
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

export async function getFullGroup(supabase: SupabaseClient, groupId: string): Promise<Group | null> {
	const { data: group, error: groupError } = await supabase
		.from('groups')
		.select(`
			*,
			participants(*),
			expenses(*),
			settlements(*)
		`)
		.eq('id', groupId)
		.single();

	if (groupError) return null;
	if (!group) return null;

	return mapGroupRow(group);
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