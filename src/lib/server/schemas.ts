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

export const addParticipantSchema = z.object({
	name: z.string().min(1, 'Name is required')
});

export const settlementSchema = z.object({
	fromId: z.string().min(1),
	toId: z.string().min(1),
	amount: z.coerce.number().positive('Amount must be positive')
});

export function parseFormData<T extends z.ZodType>(schema: T, formData: FormData): z.infer<T> | { error: string } {
	const result = schema.safeParse(Object.fromEntries(formData));
	if (!result.success) {
		const firstError = result.error.issues[0];
		return { error: firstError?.message ?? 'Validation failed' };
	}
	return result.data;
}