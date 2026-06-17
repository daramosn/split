export interface Participant {
	id: string;
	groupId: string;
	userId: string | null;
	name: string;
	createdAt: string;
}

export type SplitMode = 'equal' | 'parts' | 'amount';

export interface Expense {
	id: string;
	groupId: string;
	title: string;
	amount: number;
	paidBy: string;
	splitBetween: string[];
	splitMode: SplitMode;
	splitParts?: Record<string, number>;
	splitAmounts?: Record<string, number>;
	date: string;
	createdAt: string;
}

export interface Settlement {
	id: string;
	groupId: string;
	fromId: string;
	toId: string;
	amount: number;
	paid: boolean;
	createdAt: string;
}

export interface Group {
	id: string;
	ownerId: string;
	name: string;
	description: string;
	currency: string;
	inviteCode: string;
	createdAt: string;
	participants: Participant[];
	expenses: Expense[];
	settlements: Settlement[];
}

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