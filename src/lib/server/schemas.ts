import { z } from 'zod';

export const createGroupSchema = z.object({
	name: z.string().min(1, 'Group name is required'),
	description: z.string().optional(),
	currency: z.string().optional().default('USD')
});

export const updateGroupSchema = z.object({
	name: z.string().min(1, 'Group name is required'),
	description: z.string().optional(),
	currency: z.string().optional().default('USD')
});

export const addExpenseSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	amount: z.coerce.number().positive('Amount must be positive'),
	paidBy: z.string().min(1, 'Payer is required'),
	splitType: z.enum(['all', 'specific']).default('all'),
	splitBetween: z.string().optional(),
	splitMode: z.enum(['equal', 'parts', 'amount']).default('equal'),
	splitParts: z.string().optional(),
	splitAmounts: z.string().optional(),
	date: z.string().optional()
});

export const updateExpenseSchema = z.object({
	expenseId: z.string().min(1, 'Expense ID is required'),
	title: z.string().min(1, 'Title is required'),
	amount: z.coerce.number().positive('Amount must be positive'),
	paidBy: z.string().min(1, 'Payer is required'),
	splitType: z.enum(['all', 'specific']).default('all'),
	splitBetween: z.string().optional(),
	splitMode: z.enum(['equal', 'parts', 'amount']).default('equal'),
	splitParts: z.string().optional(),
	splitAmounts: z.string().optional(),
	date: z.string().optional()
});

export const deleteExpenseSchema = z.object({
	expenseId: z.string().min(1, 'Expense ID is required')
});

export const addParticipantSchema = z.object({
	name: z.string().min(1, 'Name is required')
});

export const removeParticipantSchema = z.object({
	participantId: z.string().min(1, 'Participant ID is required')
});

export const settlementSchema = z.object({
	fromId: z.string().min(1, 'From is required'),
	toId: z.string().min(1, 'To is required'),
	amount: z.coerce.number().positive('Amount must be positive')
});

export const markPaidSchema = z.object({
	settlementId: z.string().min(1, 'Settlement ID is required')
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type AddExpenseInput = z.infer<typeof addExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type DeleteExpenseInput = z.infer<typeof deleteExpenseSchema>;
export type AddParticipantInput = z.infer<typeof addParticipantSchema>;
export type RemoveParticipantInput = z.infer<typeof removeParticipantSchema>;
export type SettlementInput = z.infer<typeof settlementSchema>;
export type MarkPaidInput = z.infer<typeof markPaidSchema>;

export function parseFormData<T extends z.ZodType>(
	schema: T,
	formData: FormData
): { success: true; data: z.infer<T> } | { success: false; error: string } {
	const result = schema.safeParse(Object.fromEntries(formData));
	if (!result.success) {
		const messages = result.error.issues
			.map((issue) => issue.message)
			.join(', ');
		return { success: false, error: messages || 'Validation failed' };
	}
	return { success: true, data: result.data };
}
