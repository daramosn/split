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
	updateGroup,
	deleteGroup
} from '$lib/server/store';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import {
	addExpenseSchema,
	updateExpenseSchema,
	deleteExpenseSchema,
	addParticipantSchema,
	removeParticipantSchema,
	updateGroupSchema,
	settlementSchema,
	markPaidSchema,
	parseFormData
} from '$lib/server/schemas';

export const load: PageServerLoad = async ({ params, locals: { getUser, supabase } }) => {
	const user = await getUser();
	const group = await getGroupByInviteCode(supabase, params.id);

	if (!group) {
		throw error(404, 'Group not found');
	}

	const userId = user?.id ?? null;
	const isOwner = userId !== null && group.ownerId === userId;

	return {
		group,
		currency: group.currency,
		isOwner,
		userId,
		user: user ?? null,
		summary: new Promise<{
			balances: { participantId: string; participantName: string; totalPaid: number; totalOwed: number; balance: number }[];
			total: number;
			transactions: { from: string; to: string; amount: number }[];
		}>((resolve) => {
			const { balances, total } = calculateBalances(group);
			const transactions = calculateOptimizedTransactions(group);

			const balancesList = group.participants.map(p => ({
				participantId: p.id,
				participantName: p.name,
				totalPaid: group.expenses.filter(e => e.paidBy === p.id).reduce((sum, e) => sum + e.amount, 0),
				totalOwed: group.expenses.reduce((sum, e) => {
					if (e.splitMode === 'parts' && e.splitParts) {
						const totalParts = Object.values(e.splitParts).reduce((s, n) => s + n, 0);
						const parts = e.splitParts[p.id] ?? 0;
						return sum + (totalParts > 0 ? (parts / totalParts) * e.amount : 0);
					}
					if (e.splitMode === 'amount' && e.splitAmounts) {
						return sum + (e.splitAmounts[p.id] ?? 0);
					}
					const perPerson = e.amount / Math.max(e.splitBetween.length, 1);
					return sum + (e.splitBetween.includes(p.id) ? perPerson : 0);
				}, 0),
				balance: balances.get(p.id) ?? 0
			}));

			resolve({ balances: balancesList, total, transactions });
		})
	};
};

export const actions: Actions = {
	updateGroup: async ({ request, params, locals: { supabase, getUser } }) => {
		const user = await getUser();
		if (!user) {
			return { error: 'You must be signed in to update a group' };
		}

		const group = await getGroupByInviteCode(supabase, params.id);
		if (!group) throw error(404, 'Group not found');

		if (group.ownerId !== user.id) {
			return { error: 'Only the group owner can update the group' };
		}

		const formData = await request.formData();
		const parsed = parseFormData(updateGroupSchema, formData);

		if (!parsed.success) {
			return { error: parsed.error };
		}

		const success = await updateGroup(
			supabase,
			group.id,
			parsed.data.name.trim(),
			parsed.data.description?.trim() ?? '',
			parsed.data.currency ?? 'USD'
		);
		if (!success) return { error: 'Failed to update group' };

		return { success: true };
	},

	deleteGroup: async ({ params, locals: { supabase, getUser } }) => {
		const user = await getUser();
		if (!user) {
			return { error: 'You must be signed in to delete a group' };
		}

		const group = await getGroupByInviteCode(supabase, params.id);
		if (!group) throw error(404, 'Group not found');

		if (group.ownerId !== user.id) {
			return { error: 'Only the group owner can delete the group' };
		}

		const success = await deleteGroup(supabase, group.id);
		if (!success) return { error: 'Failed to delete group' };

		throw redirect(303, '/');
	},

	addExpense: async ({ request, params, locals: { supabase, getUser } }) => {
		const user = await getUser();
		if (!user) {
			return { error: 'You must be signed in to add expenses' };
		}

		const group = await getGroupByInviteCode(supabase, params.id);
		if (!group) throw error(404, 'Group not found');

		if (group.ownerId !== user.id) {
			return { error: 'Only the group owner can add expenses' };
		}

		const formData = await request.formData();
		const parsed = parseFormData(addExpenseSchema, formData);

		if (!parsed.success) {
			return { error: parsed.error };
		}

		const data = parsed.data;
		const splitBetween =
			data.splitType === 'specific'
				? (data.splitBetween?.split(',') ?? [])
				: group.participants.map(p => p.id);

		let splitParts: Record<string, number> | undefined;
		if (data.splitParts) {
			try {
				splitParts = JSON.parse(data.splitParts);
			} catch {
				splitParts = undefined;
			}
		}

		let splitAmounts: Record<string, number> | undefined;
		if (data.splitAmounts) {
			try {
				splitAmounts = JSON.parse(data.splitAmounts);
			} catch {
				splitAmounts = undefined;
			}
		}

		try {
			await addExpense(
				supabase,
				group.id,
				data.title.trim(),
				data.amount,
				data.paidBy,
				splitBetween,
				data.splitMode,
				splitParts,
				splitAmounts,
				data.date
			);
			return { success: true };
		} catch {
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

		if (group.ownerId !== user.id) {
			return { error: 'Only the group owner can update expenses' };
		}

		const formData = await request.formData();
		const parsed = parseFormData(updateExpenseSchema, formData);

		if (!parsed.success) {
			return { error: parsed.error };
		}

		const data = parsed.data;
		const splitBetween =
			data.splitType === 'specific'
				? (data.splitBetween?.split(',') ?? [])
				: group.participants.map(p => p.id);

		let splitParts: Record<string, number> | undefined;
		if (data.splitParts) {
			try {
				splitParts = JSON.parse(data.splitParts);
			} catch {
				splitParts = undefined;
			}
		}

		let splitAmounts: Record<string, number> | undefined;
		if (data.splitAmounts) {
			try {
				splitAmounts = JSON.parse(data.splitAmounts);
			} catch {
				splitAmounts = undefined;
			}
		}

		const success = await updateExpense(
			supabase,
			group.id,
			data.expenseId,
			data.title.trim(),
			data.amount,
			data.paidBy,
			splitBetween,
			data.splitMode,
			splitParts,
			splitAmounts,
			data.date
		);
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

		if (group.ownerId !== user.id) {
			return { error: 'Only the group owner can delete expenses' };
		}

		const formData = await request.formData();
		const parsed = parseFormData(deleteExpenseSchema, formData);

		if (!parsed.success) {
			return { error: parsed.error };
		}

		const success = await deleteExpense(supabase, group.id, parsed.data.expenseId);
		if (!success) return { error: 'Failed to delete expense' };

		return { success: true };
	},

	addParticipant: async ({ request, params, locals: { supabase, getUser } }) => {
		const user = await getUser();
		if (!user) {
			return { error: 'You must be signed in to add members' };
		}

		const group = await getGroupByInviteCode(supabase, params.id);
		if (!group) throw error(404, 'Group not found');

		if (group.ownerId !== user.id) {
			return { error: 'Only the group owner can add members' };
		}

		const formData = await request.formData();
		const parsed = parseFormData(addParticipantSchema, formData);

		if (!parsed.success) {
			return { error: parsed.error };
		}

		try {
			await addParticipant(supabase, group.id, parsed.data.name.trim(), null);
			return { success: true };
		} catch {
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

		if (group.ownerId !== user.id) {
			return { error: 'Only the group owner can remove members' };
		}

		const formData = await request.formData();
		const parsed = parseFormData(removeParticipantSchema, formData);

		if (!parsed.success) {
			return { error: parsed.error };
		}

		const success = await removeParticipant(supabase, group.id, parsed.data.participantId);
		if (!success) return { error: 'Failed to remove participant' };

		return { success: true };
	},

	settleUp: async ({ request, params, locals: { supabase, getUser } }) => {
		const user = await getUser();
		if (!user) {
			return { error: 'You must be signed in to settle up' };
		}

		const group = await getGroupByInviteCode(supabase, params.id);
		if (!group) throw error(404, 'Group not found');

		if (group.ownerId !== user.id) {
			return { error: 'Only the group owner can settle up' };
		}

		const formData = await request.formData();
		const parsed = parseFormData(settlementSchema, formData);

		if (!parsed.success) {
			return { error: parsed.error };
		}

		try {
			await addSettlement(
				supabase,
				group.id,
				parsed.data.fromId,
				parsed.data.toId,
				parsed.data.amount
			);
			return { success: true };
		} catch {
			return { error: 'Failed to create settlement' };
		}
	},

	markPaid: async ({ request, params, locals: { supabase, getUser } }) => {
		const user = await getUser();
		if (!user) {
			return { error: 'You must be signed in to mark as paid' };
		}

		const group = await getGroupByInviteCode(supabase, params.id);
		if (!group) throw error(404, 'Group not found');

		if (group.ownerId !== user.id) {
			return { error: 'Only the group owner can mark as paid' };
		}

		const formData = await request.formData();
		const parsed = parseFormData(markPaidSchema, formData);

		if (!parsed.success) {
			return { error: parsed.error };
		}

		const success = await markSettlementPaid(supabase, group.id, parsed.data.settlementId);
		if (!success) return { error: 'Failed to mark as paid' };

		return { success: true };
	}
};
