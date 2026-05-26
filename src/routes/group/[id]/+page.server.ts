import {
	getGroupByInviteCode,
	addExpense,
	updateExpense,
	deleteExpense,
	addSettlement,
	markSettlementPaid,
	calculateBalances,
	calculateOptimizedTransactions,
	addParticipant,
	removeParticipant,
	isGroupOwner
} from '$lib/server/store';
import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { addExpenseSchema, addParticipantSchema, parseFormData } from '$lib/server/schemas';

export const load: PageServerLoad = async ({ params, locals: { getUser, supabase } }) => {
	const user = await getUser();
	const group = await getGroupByInviteCode(supabase, params.id);

	if (!group) {
		throw error(404, 'Group not found');
	}

	const userId = user?.id ?? null;
	const isOwner = userId ? await isGroupOwner(supabase, group.id, userId) : false;

	const { balances, total } = calculateBalances(group);
	const transactions = calculateOptimizedTransactions(group);

	const balancesList = group.participants.map(p => ({
		participantId: p.id,
		participantName: p.name,
		totalPaid: group.expenses.filter(e => e.paidBy === p.id).reduce((sum, e) => sum + e.amount, 0),
		totalOwed: group.expenses.reduce((sum, e) => {
			const perPerson = e.amount / e.splitBetween.length;
			return sum + (e.splitBetween.includes(p.id) ? perPerson : 0);
		}, 0),
		balance: balances.get(p.id) ?? 0
	}));

	return {
		group,
		balances: balancesList,
		total,
		transactions,
		currency: group.currency,
		isOwner,
		userId,
		user: user ?? null
	};
};

export const actions: Actions = {
	addExpense: async ({ request, params, locals: { supabase, getUser } }) => {
		const user = await getUser();
		if (!user) {
			return { error: 'You must be signed in to add expenses' };
		}

		const group = await getGroupByInviteCode(supabase, params.id);
		if (!group) throw error(404, 'Group not found');

		const isOwner = await isGroupOwner(supabase, group.id, user.id);
		if (!isOwner) {
			return { error: 'Only the group owner can add expenses' };
		}

		const formData = await request.formData();
		const parsed = parseFormData(addExpenseSchema, formData);

		if ('error' in parsed) {
			return { error: parsed.error };
		}

		const splitBetween = parsed.splitType === 'specific'
			? (parsed.splitBetween?.split(',') ?? [])
			: group.participants.map(p => p.id);

		let splitParts: Record<string, number> | undefined;
		if (parsed.splitParts) {
			try { splitParts = JSON.parse(parsed.splitParts); } catch { splitParts = undefined; }
		}

		let splitAmounts: Record<string, number> | undefined;
		if (parsed.splitAmounts) {
			try { splitAmounts = JSON.parse(parsed.splitAmounts); } catch { splitAmounts = undefined; }
		}

		try {
			await addExpense(supabase, group.id, parsed.title.trim(), parsed.amount, parsed.paidBy, splitBetween, parsed.splitMode, splitParts, splitAmounts, parsed.date);
			return { success: true };
		} catch (err) {
			return { error: 'Failed to add expense' };
		}
	},

	updateExpense: async ({ request, params, locals: { supabase, getUser } }) => {
		const user = await getUser();
		if (!user) {
			return { error: 'You must be signed in to update expenses' };
		}

		const group = await getGroupByInviteCode(supabase, params.id);
		if (!group) throw error(404, 'Group not found');

		const isOwner = await isGroupOwner(supabase, group.id, user.id);
		if (!isOwner) {
			return { error: 'Only the group owner can update expenses' };
		}

		const formData = await request.formData();
		const expenseId = formData.get('expenseId')?.toString() ?? '';
		const title = formData.get('title')?.toString() ?? '';
		const amount = parseFloat(formData.get('amount')?.toString() ?? '0');
		const paidBy = formData.get('paidBy')?.toString() ?? '';
		const splitType = formData.get('splitType')?.toString() ?? 'all';
		const splitMode = (formData.get('splitMode')?.toString() ?? 'equal') as 'equal' | 'parts' | 'amount';
		const date = formData.get('date')?.toString() ?? '';

		if (!expenseId || !title.trim() || amount <= 0 || !paidBy) {
			return { error: 'Invalid expense data' };
		}

		const splitBetween = splitType === 'specific'
			? (formData.get('splitBetween')?.toString()?.split(',') ?? [])
			: group.participants.map(p => p.id);

		const splitPartsStr = formData.get('splitParts')?.toString() ?? '';
		let splitParts: Record<string, number> | undefined;
		if (splitPartsStr) {
			try { splitParts = JSON.parse(splitPartsStr); } catch { splitParts = undefined; }
		}

		const splitAmountsStr = formData.get('splitAmounts')?.toString() ?? '';
		let splitAmounts: Record<string, number> | undefined;
		if (splitAmountsStr) {
			try { splitAmounts = JSON.parse(splitAmountsStr); } catch { splitAmounts = undefined; }
		}

		const success = await updateExpense(supabase, group.id, expenseId, title.trim(), amount, paidBy, splitBetween, splitMode, splitParts, splitAmounts, date);
		if (!success) return { error: 'Failed to update expense' };

		return { success: true };
	},

	deleteExpense: async ({ request, params, locals: { supabase, getUser } }) => {
		const user = await getUser();
		if (!user) {
			return { error: 'You must be signed in to delete expenses' };
		}

		const group = await getGroupByInviteCode(supabase, params.id);
		if (!group) throw error(404, 'Group not found');

		const isOwner = await isGroupOwner(supabase, group.id, user.id);
		if (!isOwner) {
			return { error: 'Only the group owner can delete expenses' };
		}

		const formData = await request.formData();
		const expenseId = formData.get('expenseId')?.toString();
		if (!expenseId) return { error: 'Missing expense ID' };

		await deleteExpense(supabase, group.id, expenseId);
		return { success: true };
	},

	addParticipant: async ({ request, params, locals: { supabase, getUser } }) => {
		const user = await getUser();
		if (!user) {
			return { error: 'You must be signed in to add members' };
		}

		const group = await getGroupByInviteCode(supabase, params.id);
		if (!group) throw error(404, 'Group not found');

		const isOwner = await isGroupOwner(supabase, group.id, user.id);
		if (!isOwner) {
			return { error: 'Only the group owner can add members' };
		}

		const formData = await request.formData();
		const parsed = parseFormData(addParticipantSchema, formData);

		if ('error' in parsed) {
			return { error: parsed.error };
		}

		try {
			await addParticipant(supabase, group.id, parsed.name.trim(), null);
			return { success: true };
		} catch (err) {
			return { error: 'Failed to add participant' };
		}
	},

	removeParticipant: async ({ request, params, locals: { supabase, getUser } }) => {
		const user = await getUser();
		if (!user) {
			return { error: 'You must be signed in to remove members' };
		}

		const group = await getGroupByInviteCode(supabase, params.id);
		if (!group) throw error(404, 'Group not found');

		const isOwner = await isGroupOwner(supabase, group.id, user.id);
		if (!isOwner) {
			return { error: 'Only the group owner can remove members' };
		}

		const formData = await request.formData();
		const participantId = formData.get('participantId')?.toString();
		if (!participantId) return { error: 'Missing participant ID' };

		await removeParticipant(supabase, group.id, participantId);
		return { success: true };
	},

	settleUp: async ({ request, params, locals: { supabase, getUser } }) => {
		const user = await getUser();
		if (!user) {
			return { error: 'You must be signed in to settle up' };
		}

		const group = await getGroupByInviteCode(supabase, params.id);
		if (!group) throw error(404, 'Group not found');

		const isOwner = await isGroupOwner(supabase, group.id, user.id);
		if (!isOwner) {
			return { error: 'Only the group owner can settle up' };
		}

		const formData = await request.formData();
		const fromId = formData.get('fromId')?.toString() ?? '';
		const toId = formData.get('toId')?.toString() ?? '';
		const amount = parseFloat(formData.get('amount')?.toString() ?? '0');

		if (!fromId || !toId || amount <= 0) return { error: 'Invalid settlement data' };

		await addSettlement(supabase, group.id, fromId, toId, amount);
		return { success: true };
	},

	markPaid: async ({ request, params, locals: { supabase, getUser } }) => {
		const user = await getUser();
		if (!user) {
			return { error: 'You must be signed in to mark as paid' };
		}

		const group = await getGroupByInviteCode(supabase, params.id);
		if (!group) throw error(404, 'Group not found');

		const isOwner = await isGroupOwner(supabase, group.id, user.id);
		if (!isOwner) {
			return { error: 'Only the group owner can mark as paid' };
		}

		const formData = await request.formData();
		const settlementId = formData.get('settlementId')?.toString();
		if (!settlementId) return { error: 'Missing settlement ID' };

		await markSettlementPaid(supabase, group.id, settlementId);
		return { success: true };
	}
};