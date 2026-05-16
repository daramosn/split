export interface Participant {
	id: string;
	name: string;
}

export type SplitMode = 'equal' | 'parts' | 'amount';

export interface Expense {
	id: string;
	title: string;
	amount: number;
	paidBy: string;
	splitBetween: string[];
	splitMode: SplitMode;
	splitParts?: Record<string, number>;
	splitAmounts?: Record<string, number>;
	date: string;
}

export interface Settlement {
	id: string;
	fromId: string;
	toId: string;
	amount: number;
	paid: boolean;
}

export interface Group {
	id: string;
	name: string;
	description: string;
	currency: string;
	createdAt: string;
	participants: Participant[];
	expenses: Expense[];
	settlements: Settlement[];
}

export type GroupSummary = Pick<Group, 'id' | 'name' | 'currency' | 'createdAt' | 'participants'>;

export interface Balance {
	participantId: string;
	participantName: string;
	totalPaid: number;
	totalOwed: number;
	balance: number;
}

export interface Transaction {
	fromId: string;
	fromName: string;
	toId: string;
	toName: string;
	amount: number;
}

export type Result<T, E = string> =
	| { ok: true; value: T }
	| { ok: false; error: E };

export function success<T>(value: T): Result<T, never> {
	return { ok: true, value };
}

export function failure<E = string>(error: E): Result<never, E> {
	return { ok: false, error };
}