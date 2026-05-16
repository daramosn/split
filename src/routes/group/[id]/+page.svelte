<script lang="ts">
	import type { PageData } from './$types';

	let { data } = $props();

	let showAddExpense = $state(false);
	let showAddParticipant = $state(false);
	let splitType = $state('all');
	let selectedSplitters = $state<string[]>([]);
	let splitMode = $state<'equal' | 'parts' | 'amount'>('equal');
	let splitParts = $state<Record<string, number>>({});
	let splitAmounts = $state<Record<string, number>>({});
	let splitAmountsTouched = $state<Set<string>>(new Set());
	let currentExpenseAmount = $state(0);

	function openAddExpense() {
		splitAmountsTouched = new Set();
		splitMode = 'equal';
		splitType = 'all';
		selectedSplitters = data.group.participants.map(p => p.id);
		splitParts = {};
		splitAmounts = {};
		showAddExpense = true;
	}

	let editingExpenseId = $state<string | null>(null);
	let editSplitType = $state('all');
	let editSelectedSplitters = $state<string[]>([]);
	let editSplitMode = $state<'equal' | 'parts' | 'amount'>('equal');
	let editSplitParts = $state<Record<string, number>>({});
	let editSplitAmounts = $state<Record<string, number>>({});
	let editSplitAmountsTouched = $state<Set<string>>(new Set());
	let editExpenseAmount = $state(0);

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: data.currency
		}).format(amount);
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function getParticipantName(id: string): string {
		return data.group.participants.find(p => p.id === id)?.name ?? 'Unknown';
	}

	function getActiveSplitters() {
		return splitType === 'specific'
			? data.group.participants.filter(p => selectedSplitters.includes(p.id))
			: data.group.participants;
	}

	function calculatePartShare(parts: Record<string, number>, amount: number): number {
		const totalParts = Object.values(parts).reduce((sum, p) => sum + p, 0);
		if (totalParts === 0) return 0;
		return amount / totalParts;
	}

	function initSplitAmounts(amount: number) {
		const splitters = getActiveSplitters();
		if (splitters.length === 0) return;
		const equalAmount = amount / splitters.length;
		const newAmounts: Record<string, number> = {};
		splitters.forEach(p => {
			newAmounts[p.id] = Math.round(equalAmount * 100) / 100;
		});
		splitAmounts = newAmounts;
		splitAmountsTouched = new Set();
	}

	function onAmountInputChange(pId: string, value: number) {
		const splitters = getActiveSplitters();
		splitAmountsTouched = new Set([...splitAmountsTouched, pId]);
		splitAmounts[pId] = value;

		const touchedTotal = splitters.reduce((sum, p) => sum + (splitAmountsTouched.has(p.id) ? (splitAmounts[p.id] ?? 0) : 0), 0);
		const untouched = splitters.filter(p => !splitAmountsTouched.has(p.id));
		if (untouched.length > 0 && currentExpenseAmount > touchedTotal) {
			const remaining = currentExpenseAmount - touchedTotal;
			const perPerson = Math.round((remaining / untouched.length) * 100) / 100;
			untouched.forEach(p => {
				splitAmounts[p.id] = perPerson;
			});
		}
	}

	function getEditActiveSplitters() {
		return editSplitType === 'specific'
			? data.group.participants.filter(p => editSelectedSplitters.includes(p.id))
			: data.group.participants;
	}

	function initEditSplitAmounts(amount: number) {
		const splitters = getEditActiveSplitters();
		if (splitters.length === 0) return;
		const equalAmount = amount / splitters.length;
		const newAmounts: Record<string, number> = {};
		splitters.forEach(p => {
			newAmounts[p.id] = Math.round(equalAmount * 100) / 100;
		});
		editSplitAmounts = newAmounts;
		editSplitAmountsTouched = new Set();
	}

	function onEditAmountInputChange(pId: string, value: number) {
		const splitters = getEditActiveSplitters();
		editSplitAmountsTouched = new Set([...editSplitAmountsTouched, pId]);
		editSplitAmounts[pId] = value;

		const touchedTotal = splitters.reduce((sum, p) => sum + (editSplitAmountsTouched.has(p.id) ? (editSplitAmounts[p.id] ?? 0) : 0), 0);
		const untouched = splitters.filter(p => !editSplitAmountsTouched.has(p.id));
		if (untouched.length > 0 && editExpenseAmount > touchedTotal) {
			const remaining = editExpenseAmount - touchedTotal;
			const perPerson = Math.round((remaining / untouched.length) * 100) / 100;
			untouched.forEach(p => {
				editSplitAmounts[p.id] = perPerson;
			});
		}
	}

	function getSplitDisplay(e: { splitBetween: string[]; splitMode: string; splitParts?: Record<string, number>; splitAmounts?: Record<string, number>; amount: number }): string {
		const parts = e.splitParts;
		const amounts = e.splitAmounts;
		if (e.splitMode === 'parts' && parts) {
			const totalParts = Object.values(parts).reduce((sum, p) => sum + p, 0);
			return e.splitBetween.map(id => {
				const p = parts?.[id] ?? 1;
				const share = (p / totalParts) * e.amount;
				return `${getParticipantName(id)}: ${p} part${p > 1 ? 's' : ''} (${formatCurrency(share)})`;
			}).join(', ');
		}
		if (e.splitMode === 'amount' && amounts) {
			return e.splitBetween.map(id => `${getParticipantName(id)}: ${formatCurrency(amounts[id] ?? 0)}`).join(', ');
		}
		const perPerson = e.amount / e.splitBetween.length;
		return `${e.splitBetween.map(id => getParticipantName(id)).join(', ')} (${formatCurrency(perPerson)} each)`;
	}

	function handleSplitTypeChange(type: string) {
		splitType = type;
		if (type === 'all') {
			selectedSplitters = data.group.participants.map(p => p.id);
		}
		if (splitMode === 'amount' && currentExpenseAmount > 0) {
			initSplitAmounts(currentExpenseAmount);
		}
	}

	function handleSplitModeChange(mode: 'equal' | 'parts' | 'amount') {
		splitMode = mode;
		if (mode === 'amount' && currentExpenseAmount > 0) {
			initSplitAmounts(currentExpenseAmount);
		}
	}

	function toggleSplitter(id: string) {
		if (selectedSplitters.includes(id)) {
			selectedSplitters = selectedSplitters.filter(x => x !== id);
		} else {
			selectedSplitters = [...selectedSplitters, id];
		}
		if (splitMode === 'amount' && currentExpenseAmount > 0) {
			initSplitAmounts(currentExpenseAmount);
		}
	}

	function startEdit(expense: { id: string; title: string; amount: number; paidBy: string; splitBetween: string[]; splitMode: string; splitParts?: Record<string, number>; splitAmounts?: Record<string, number>; date: string }) {
		editingExpenseId = expense.id;
		editExpenseAmount = expense.amount;
		editSplitType = expense.splitBetween.length === data.group.participants.length ? 'all' : 'specific';
		editSelectedSplitters = [...expense.splitBetween];
		editSplitMode = (expense.splitMode as 'equal' | 'parts' | 'amount') || 'equal';
		editSplitParts = expense.splitParts ? { ...expense.splitParts } : {};
		editSplitAmounts = expense.splitAmounts ? { ...expense.splitAmounts } : {};
		editSplitAmountsTouched = new Set();
		if (editSplitMode === 'amount' && (!expense.splitAmounts || Object.keys(expense.splitAmounts).length === 0)) {
			initEditSplitAmounts(expense.amount);
		}
	}

	function cancelEdit() {
		editingExpenseId = null;
		editSplitMode = 'equal';
		editSplitParts = {};
		editSplitAmounts = {};
		editSplitAmountsTouched = new Set();
	}

	function handleEditSplitTypeChange(type: string) {
		editSplitType = type;
		if (type === 'all') {
			editSelectedSplitters = data.group.participants.map(p => p.id);
			editSplitMode = 'equal';
			editSplitParts = {};
			editSplitAmounts = {};
		}
	}

	function toggleEditSplitter(id: string) {
		if (editSelectedSplitters.includes(id)) {
			editSelectedSplitters = editSelectedSplitters.filter(x => x !== id);
		} else {
			editSelectedSplitters = [...editSelectedSplitters, id];
		}
	}

	function getBalanceColor(balance: number): string {
		if (balance > 0.01) return 'var(--color-success)';
		if (balance < -0.01) return 'var(--color-danger)';
		return 'var(--color-on-surface)';
	}

	function getBalanceBg(balance: number): string {
		if (balance > 0.01) return 'var(--color-success-container)';
		if (balance < -0.01) return 'var(--color-danger-container)';
		return 'var(--color-surface-container)';
	}
</script>

<div class="container">
	<section class="group-hero animate-fade-in-up">
		<div class="group-hero-content">
			<div class="hero-badge">
				<span class="chip">
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
						<circle cx="9" cy="7" r="4"/>
						<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
						<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
					</svg>
					{data.group.participants.length} members
				</span>
				<span class="chip">
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="12" y1="1" x2="12" y2="23"/>
						<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
					</svg>
					{data.group.currency}
				</span>
			</div>
			<h1 class="text-3xl font-display">{data.group.name}</h1>
			{#if data.group.description}
				<p class="text-lg text-secondary mt-2">{data.group.description}</p>
			{/if}
		</div>
		<div class="hero-actions">
			<button class="btn btn-secondary" onclick={() => showAddParticipant = !showAddParticipant}>
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
					<circle cx="8.5" cy="7" r="4"/>
					<line x1="20" y1="8" x2="20" y2="14"/>
					<line x1="23" y1="11" x2="17" y2="11"/>
				</svg>
				Add Member
			</button>
			<button class="btn btn-primary" onclick={openAddExpense}>
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<line x1="12" y1="5" x2="12" y2="19"/>
					<line x1="5" y1="12" x2="19" y2="12"/>
				</svg>
				Add Expense
			</button>
		</div>
	</section>

	{#if data.group.participants.length === 0}
		<div class="card filled-tonal mb-6 animate-scale-in">
			<div class="empty-participants">
				<div class="ep-icon">
					<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
						<circle cx="8.5" cy="7" r="4"/>
						<line x1="20" y1="8" x2="20" y2="14"/>
						<line x1="23" y1="11" x2="17" y2="11"/>
					</svg>
				</div>
				<p class="text-secondary">Add at least 2 members to start tracking expenses.</p>
				<button class="btn btn-primary mt-4" onclick={() => showAddParticipant = true}>+ Add Members</button>
			</div>
		</div>
	{/if}

	{#if showAddParticipant}
		<div class="sheet-backdrop" onclick={() => showAddParticipant = false} onkeydown={(e) => e.key === 'Escape' && (showAddParticipant = false)} role="presentation"></div>
		<div class="sheet-content card-elevated animate-slide-in-up">
			<form method="POST" action="?/addParticipant" class="add-participant-form">
				<h3 class="text-lg font-display mb-4">Add New Member</h3>
				<input type="text" name="name" class="input" placeholder="Member name" required />
				<div class="sheet-actions">
					<button type="button" class="btn btn-ghost" onclick={() => showAddParticipant = false}>Cancel</button>
					<button type="submit" class="btn btn-primary">Add Member</button>
				</div>
			</form>
		</div>
	{/if}

	{#if showAddExpense}
		<div class="sheet-backdrop" onclick={() => showAddExpense = false} onkeydown={(e) => e.key === 'Escape' && (showAddExpense = false)} role="presentation"></div>
		<div class="sheet-expense card-elevated animate-slide-in-up">
			<form method="POST" action="?/addExpense" class="expense-form">
				<div class="form-header">
					<h3 class="text-lg font-display">Add Expense</h3>
					<button type="button" class="close-btn" onclick={() => showAddExpense = false} aria-label="Close dialog">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<line x1="18" y1="6" x2="6" y2="18"/>
							<line x1="6" y1="6" x2="18" y2="18"/>
						</svg>
					</button>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label class="label" for="title">Title</label>
						<input type="text" id="title" name="title" class="input" placeholder="Dinner at Luigi's" required />
					</div>
					<div class="form-group">
						<label class="label" for="amount">Amount</label>
						<input type="number" id="amount" name="amount" class="input" step="0.01" min="0.01" placeholder="0.00" required oninput={(e) => { currentExpenseAmount = parseFloat(e.currentTarget.value) || 0; if (splitMode === 'amount') initSplitAmounts(currentExpenseAmount); }} />
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label class="label" for="paidBy">Paid by</label>
						<select id="paidBy" name="paidBy" class="input" required>
							{#each data.group.participants as p}
								<option value={p.id}>{p.name}</option>
							{/each}
						</select>
					</div>
					<div class="form-group">
						<label class="label" for="date">Date</label>
						<input type="date" id="date" name="date" class="input" value={new Date().toISOString().split('T')[0]} />
					</div>
				</div>

				<fieldset class="form-group">
					<legend class="label">Split Type</legend>
					<div class="segmented-control">
						<label class="segment" class:active={splitType === 'all'}>
							<input type="radio" name="splitType" value="all" checked={splitType === 'all'} onchange={() => handleSplitTypeChange('all')} />
							<span>Everyone</span>
						</label>
						<label class="segment" class:active={splitType === 'specific'}>
							<input type="radio" name="splitType" value="specific" checked={splitType === 'specific'} onchange={() => handleSplitTypeChange('specific')} />
							<span>Specific</span>
						</label>
					</div>
				</fieldset>

				{#if splitType === 'specific'}
					<fieldset class="form-group">
						<legend class="label">Split between</legend>
						<div class="splitter-chips">
							{#each data.group.participants as p}
								<label class="chip" class:chip-filled={selectedSplitters.includes(p.id)}>
									<input type="checkbox" checked={selectedSplitters.includes(p.id)} onchange={() => toggleSplitter(p.id)} />
									{p.name}
								</label>
							{/each}
						</div>
						<input type="hidden" name="splitBetween" value={selectedSplitters.join(',')} />
					</fieldset>
				{/if}

				<fieldset class="form-group">
					<legend class="label">Split Mode</legend>
					<div class="segmented-control">
						<label class="segment" class:active={splitMode === 'equal'}>
							<input type="radio" name="splitMode" value="equal" checked={splitMode === 'equal'} onchange={() => handleSplitModeChange('equal')} />
							<span>Equal</span>
						</label>
						<label class="segment" class:active={splitMode === 'parts'}>
							<input type="radio" name="splitMode" value="parts" checked={splitMode === 'parts'} onchange={() => handleSplitModeChange('parts')} />
							<span>By Parts</span>
						</label>
						<label class="segment" class:active={splitMode === 'amount'}>
							<input type="radio" name="splitMode" value="amount" checked={splitMode === 'amount'} onchange={() => handleSplitModeChange('amount')} />
							<span>By Amount</span>
						</label>
					</div>
				</fieldset>

				{#if splitMode === 'parts'}
					<fieldset class="form-group">
						<legend class="label">Parts</legend>
						<div class="split-inputs">
							{#each (splitType === 'specific' ? data.group.participants.filter(p => selectedSplitters.includes(p.id)) : data.group.participants) as p}
								<div class="split-row">
									<span class="split-name">{p.name}</span>
									<div class="split-parts-input">
										<input type="number" class="input input-sm" min="1" value={splitParts[p.id] ?? 1} onchange={(e) => splitParts[p.id] = parseInt(e.currentTarget.value) || 1} />
										<span class="split-calc">= {formatCurrency(calculatePartShare(splitParts, currentExpenseAmount) * (splitParts[p.id] ?? 1))}</span>
									</div>
								</div>
							{/each}
						</div>
						<input type="hidden" name="splitParts" value={JSON.stringify(splitParts)} />
					</fieldset>
				{:else if splitMode === 'amount'}
					<fieldset class="form-group">
						<legend class="label">Amounts</legend>
						<div class="split-inputs">
							{#each (splitType === 'specific' ? data.group.participants.filter(p => selectedSplitters.includes(p.id)) : data.group.participants) as p}
								<div class="split-row">
									<span class="split-name">{p.name}</span>
									<input type="number" class="input input-sm" step="0.01" min="0" placeholder="0.00" value={splitAmounts[p.id] ?? 0} oninput={(e) => onAmountInputChange(p.id, parseFloat(e.currentTarget.value) || 0)} />
								</div>
							{/each}
						</div>
						<input type="hidden" name="splitAmounts" value={JSON.stringify(splitAmounts)} />
					</fieldset>
				{/if}

				<div class="sheet-actions">
					<button type="button" class="btn btn-ghost" onclick={() => showAddExpense = false}>Cancel</button>
					<button type="submit" class="btn btn-primary">Add Expense</button>
				</div>
			</form>
		</div>
	{/if}

	<section class="dashboard-grid animate-fade-in-up stagger-2">
		<div class="stat-card card card-elevated">
			<div class="stat-header">
				<span class="stat-icon text-success">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="12" y1="1" x2="12" y2="23"/>
						<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
					</svg>
				</span>
				<span class="stat-label">Total Expenses</span>
			</div>
			<div class="stat-value text-2xl font-display text-success">{formatCurrency(data.total)}</div>
		</div>

		<div class="balances-card card card-elevated">
			<h3 class="text-base font-display mb-4">Balances</h3>
			<div class="balances-list">
				{#each data.balances as b}
					<div class="balance-item" style="--balance-color: {getBalanceColor(b.balance)}; --balance-bg: {getBalanceBg(b.balance)}">
						<div class="balance-avatar">
							{b.participantName.charAt(0).toUpperCase()}
						</div>
						<div class="balance-info">
							<span class="balance-name">{b.participantName}</span>
							<span class="balance-detail text-sm text-secondary">
								Paid {formatCurrency(b.totalPaid)} · Owes {formatCurrency(b.totalOwed)}
							</span>
						</div>
						<div class="balance-amount" style="color: {getBalanceColor(b.balance)}; background: {getBalanceBg(b.balance)}">
							{b.balance > 0 ? '+' : ''}{formatCurrency(b.balance)}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	{#if data.transactions.length > 0}
		<section class="settlements-section animate-fade-in-up stagger-3">
			<h2 class="section-title">Suggested Settlements</h2>
			<p class="text-secondary text-sm mb-4">Minimum transactions to settle all debts</p>
			<div class="transactions-list">
				{#each data.transactions as t}
					<div class="transaction-card card">
						<div class="transaction-flow">
							<div class="tf-avatar from">
								{getParticipantName(t.from).charAt(0)}
							</div>
							<div class="tf-arrow">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<line x1="5" y1="12" x2="19" y2="12"/>
									<polyline points="12 5 19 12 12 19"/>
								</svg>
							</div>
							<div class="tf-avatar to">
								{getParticipantName(t.to).charAt(0)}
							</div>
						</div>
						<div class="transaction-details">
							<span class="tf-names">
								<strong>{getParticipantName(t.from)}</strong> owes <strong>{getParticipantName(t.to)}</strong>
							</span>
							<span class="tf-amount text-xl font-display">{formatCurrency(t.amount)}</span>
						</div>
						<form method="POST" action="?/settleUp" class="settle-form">
							<input type="hidden" name="fromId" value={t.from} />
							<input type="hidden" name="toId" value={t.to} />
							<input type="hidden" name="amount" value={t.amount} />
							<button type="submit" class="btn btn-primary btn-sm">Settle Up</button>
						</form>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	{#if data.group.settlements.length > 0}
		<section class="settled-section animate-fade-in-up stagger-4">
			<h2 class="section-title">Settled Debts</h2>
			<div class="settled-list">
				{#each data.group.settlements as s}
					<div class="settled-card card" class:paid={s.paid}>
						<div class="settled-flow">
							<span class="settled-name">{getParticipantName(s.fromId)}</span>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<line x1="5" y1="12" x2="19" y2="12"/>
								<polyline points="12 5 19 12 12 19"/>
							</svg>
							<span class="settled-name">{getParticipantName(s.toId)}</span>
						</div>
						<span class="settled-amount font-display">{formatCurrency(s.amount)}</span>
						<div class="settled-actions">
							{#if s.paid}
								<span class="badge badge-success">
									<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
										<polyline points="20 6 9 17 4 12"/>
									</svg>
									Paid
								</span>
							{:else}
								<form method="POST" action="?/markPaid">
									<input type="hidden" name="settlementId" value={s.id} />
									<button type="submit" class="btn btn-secondary btn-sm">Mark Paid</button>
								</form>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<section class="expenses-section animate-fade-in-up stagger-4">
		<h2 class="section-title">Expense History</h2>
		{#if data.group.expenses.length === 0}
			<div class="card filled-tonal text-center py-12">
				<div class="empty-icon mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<rect x="2" y="5" width="20" height="14" rx="2"/>
						<line x1="2" y1="10" x2="22" y2="10"/>
					</svg>
				</div>
				<p class="text-secondary">No expenses recorded yet.</p>
				<button class="btn btn-primary mt-4" onclick={openAddExpense}>+ Add First Expense</button>
			</div>
		{:else}
			<div class="expenses-list">
				{#each data.group.expenses.slice().reverse() as e, i}
					<div class="expense-card card card-elevated animate-morph-in" style="animation-delay: {0.03 * i}s">
						{#if editingExpenseId === e.id}
							<form method="POST" action="?/updateExpense" class="edit-expense-form" onsubmit={() => setTimeout(() => editingExpenseId = null, 0)}>
								<input type="hidden" name="expenseId" value={e.id} />
								<div class="form-row">
									<input type="text" name="title" class="input" value={e.title} required />
									<input type="number" name="amount" class="input" step="0.01" min="0.01" value={e.amount} required oninput={(ev) => { editExpenseAmount = parseFloat(ev.currentTarget.value) || 0; if (editSplitMode === 'amount') initEditSplitAmounts(editExpenseAmount); }} />
								</div>
								<div class="form-row">
									<select name="paidBy" class="input" required>
										{#each data.group.participants as p}
											<option value={p.id} selected={p.id === e.paidBy}>{p.name}</option>
										{/each}
									</select>
									<input type="date" name="date" class="input" value={e.date} required />
								</div>
								<div class="form-group">
									<div class="segmented-control">
										<label class="segment" class:active={editSplitType === 'all'}>
											<input type="radio" name="splitType" value="all" checked={editSplitType === 'all'} onchange={() => handleEditSplitTypeChange('all')} />
											<span>Everyone</span>
										</label>
										<label class="segment" class:active={editSplitType === 'specific'}>
											<input type="radio" name="splitType" value="specific" checked={editSplitType === 'specific'} onchange={() => handleEditSplitTypeChange('specific')} />
											<span>Specific</span>
										</label>
									</div>
								</div>
								{#if editSplitType === 'specific'}
									<div class="splitter-chips mb-4">
										{#each data.group.participants as p}
											<label class="chip" class:chip-filled={editSelectedSplitters.includes(p.id)}>
												<input type="checkbox" checked={editSelectedSplitters.includes(p.id)} onchange={() => toggleEditSplitter(p.id)} />
												{p.name}
											</label>
										{/each}
									</div>
									<input type="hidden" name="splitBetween" value={editSelectedSplitters.join(',')} />
								{/if}
								<div class="form-group">
									<div class="segmented-control">
										<label class="segment" class:active={editSplitMode === 'equal'}>
											<input type="radio" name="splitMode" value="equal" checked={editSplitMode === 'equal'} onchange={() => { editSplitMode = 'equal'; }} />
											<span>Equal</span>
										</label>
										<label class="segment" class:active={editSplitMode === 'parts'}>
											<input type="radio" name="splitMode" value="parts" checked={editSplitMode === 'parts'} onchange={() => { editSplitMode = 'parts'; }} />
											<span>Parts</span>
										</label>
										<label class="segment" class:active={editSplitMode === 'amount'}>
											<input type="radio" name="splitMode" value="amount" checked={editSplitMode === 'amount'} onchange={() => { editSplitMode = 'amount'; if (editExpenseAmount > 0) initEditSplitAmounts(editExpenseAmount); }} />
											<span>Amount</span>
										</label>
									</div>
								</div>
								{#if editSplitMode === 'parts'}
									<div class="split-inputs mb-4">
										{#each (editSplitType === 'specific' ? data.group.participants.filter(p => editSelectedSplitters.includes(p.id)) : data.group.participants) as p}
											<div class="split-row">
												<span class="split-name">{p.name}</span>
												<div class="split-parts-input">
													<input type="number" class="input input-sm" min="1" value={editSplitParts[p.id] ?? 1} onchange={(e) => editSplitParts[p.id] = parseInt(e.currentTarget.value) || 1} />
													<span class="split-calc">= {formatCurrency(calculatePartShare(editSplitParts, editExpenseAmount) * (editSplitParts[p.id] ?? 1))}</span>
												</div>
											</div>
										{/each}
									</div>
									<input type="hidden" name="splitParts" value={JSON.stringify(editSplitParts)} />
								{:else if editSplitMode === 'amount'}
									<div class="split-inputs mb-4">
										{#each (editSplitType === 'specific' ? data.group.participants.filter(p => editSelectedSplitters.includes(p.id)) : data.group.participants) as p}
											<div class="split-row">
												<span class="split-name">{p.name}</span>
												<input type="number" class="input input-sm" step="0.01" min="0" placeholder="0.00" value={editSplitAmounts[p.id] ?? 0} oninput={(e) => onEditAmountInputChange(p.id, parseFloat(e.currentTarget.value) || 0)} />
											</div>
										{/each}
									</div>
									<input type="hidden" name="splitAmounts" value={JSON.stringify(editSplitAmounts)} />
								{/if}
								<div class="form-actions">
									<button type="button" class="btn btn-ghost btn-sm" onclick={cancelEdit}>Cancel</button>
									<button type="submit" class="btn btn-primary btn-sm">Save Changes</button>
								</div>
							</form>
						{:else}
							<div class="expense-main">
								<div class="expense-header">
									<div class="expense-payer">
										<div class="payer-avatar">
											{getParticipantName(e.paidBy).charAt(0)}
										</div>
										<div class="payer-info">
											<span class="payer-name">{getParticipantName(e.paidBy)}</span>
											<span class="expense-date text-sm text-secondary">{formatDate(e.date)}</span>
										</div>
									</div>
									<div class="expense-title-amount">
										<span class="expense-title">{e.title}</span>
										<span class="expense-amount text-xl font-display">{formatCurrency(e.amount)}</span>
									</div>
								</div>
								<div class="expense-split text-sm text-secondary">
									<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<line x1="8" y1="6" x2="21" y2="6"/>
										<line x1="8" y1="12" x2="21" y2="12"/>
										<line x1="8" y1="18" x2="21" y2="18"/>
										<line x1="3" y1="6" x2="3.01" y2="6"/>
										<line x1="3" y1="12" x2="3.01" y2="12"/>
										<line x1="3" y1="18" x2="3.01" y2="18"/>
									</svg>
									{getSplitDisplay(e)}
								</div>
							</div>
							<div class="expense-actions">
								<button type="button" class="btn btn-ghost btn-sm" onclick={() => startEdit(e)} aria-label="Edit expense">
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
										<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
									</svg>
								</button>
								<form method="POST" action="?/deleteExpense">
									<input type="hidden" name="expenseId" value={e.id} />
									<button type="submit" class="btn btn-ghost btn-sm text-danger" aria-label="Delete expense">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<polyline points="3 6 5 6 21 6"/>
											<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
										</svg>
									</button>
								</form>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</section>

	<section class="members-section animate-fade-in-up stagger-5">
		<h2 class="section-title">Members</h2>
		<div class="members-grid">
			{#each data.group.participants as p}
				<div class="member-card card">
					<div class="member-avatar">
						{p.name.charAt(0).toUpperCase()}
					</div>
					<span class="member-name">{p.name}</span>
					<form method="POST" action="?/removeParticipant" class="member-action">
						<input type="hidden" name="participantId" value={p.id} />
						<button type="submit" class="btn btn-ghost btn-sm text-danger" aria-label="Remove member">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<line x1="18" y1="6" x2="6" y2="18"/>
									<line x1="6" y1="6" x2="18" y2="18"/>
							</svg>
						</button>
					</form>
				</div>
			{/each}
		</div>
	</section>
</div>

<style>
	.group-hero {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 40px;
		padding: 32px;
		background: var(--color-surface-container-low);
		border-radius: var(--radius-xl);
		position: relative;
		overflow: hidden;
	}

	.group-hero::before {
		content: '';
		position: absolute;
		top: -50%;
		right: -20%;
		width: 500px;
		height: 500px;
		background: radial-gradient(circle, rgba(var(--color-primary-rgb), 0.08) 0%, transparent 70%);
		border-radius: 50%;
		pointer-events: none;
	}

	.hero-badge {
		display: flex;
		gap: 8px;
		margin-bottom: 12px;
	}

	.hero-badge .chip {
		font-size: 12px;
		padding: 6px 12px;
	}

	.hero-badge .chip svg {
		width: 12px;
		height: 12px;
	}

	.hero-actions {
		display: flex;
		gap: 12px;
		flex-shrink: 0;
	}

	.sheet-backdrop {
		position: fixed;
		inset: 0;
		background: var(--color-scrim);
		z-index: 100;
		animation: fadeIn 0.3s ease forwards;
	}

	.sheet-content {
		position: fixed;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 100%;
		max-width: 480px;
		background: var(--color-surface-bright);
		border-radius: var(--radius-xl) var(--radius-xl) 0 0;
		padding: 24px;
		z-index: 101;
		animation: slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}

	.sheet-expense {
		position: fixed;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 100%;
		max-width: 560px;
		max-height: 90vh;
		overflow-y: auto;
		background: var(--color-surface-bright);
		border-radius: var(--radius-xl) var(--radius-xl) 0 0;
		padding: 24px;
		z-index: 101;
		animation: slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}

	@keyframes slideInUp {
		from { transform: translateX(-50%) translateY(100%); }
		to { transform: translateX(-50%) translateY(0); }
	}

	.form-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24px;
	}

	.close-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: var(--radius-full);
		color: var(--color-on-surface-variant);
		transition: all var(--transition-fast);
	}

	.close-btn:hover {
		background: var(--color-surface-container);
		color: var(--color-on-surface);
	}

	.sheet-actions {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
		margin-top: 24px;
	}

	.expense-form {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.add-participant-form {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.empty-participants {
		text-align: center;
		padding: 24px;
	}

	.ep-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 72px;
		height: 72px;
		border-radius: var(--radius-full);
		background: var(--color-surface-container);
		color: var(--color-primary);
		margin-bottom: 16px;
	}

	.dashboard-grid {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 20px;
		margin-bottom: 40px;
	}

	.stat-card {
		padding: 24px;
		min-width: 220px;
	}

	.stat-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 12px;
	}

	.stat-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: var(--radius-lg);
		background: var(--color-success-container);
	}

	.stat-label {
		font-size: 14px;
		font-weight: 600;
		color: var(--color-on-surface-variant);
	}

	.stat-value {
		font-weight: 800;
	}

	.balances-card {
		padding: 24px;
	}

	.balances-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.balance-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px;
		background: var(--color-surface-container-low);
		border-radius: var(--radius-lg);
		transition: all var(--transition-fast);
	}

	.balance-item:hover {
		background: var(--color-surface-container);
	}

	.balance-avatar {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-full);
		background: var(--color-primary-container);
		color: var(--color-on-primary-container);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 14px;
		flex-shrink: 0;
	}

	.balance-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.balance-name {
		font-weight: 600;
		font-size: 15px;
	}

	.balance-amount {
		padding: 4px 10px;
		border-radius: var(--radius-full);
		font-weight: 700;
		font-size: 13px;
	}

	.section-title {
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 700;
		margin-bottom: 16px;
		color: var(--color-on-surface);
	}

	.settlements-section {
		margin-bottom: 40px;
	}

	.transactions-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 16px;
	}

	.transaction-card {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 20px;
	}

	.transaction-flow {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.tf-avatar {
		width: 36px;
		height: 36px;
		border-radius: var(--radius-full);
		background: var(--color-primary-container);
		color: var(--color-on-primary-container);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 13px;
	}

	.tf-arrow {
		color: var(--color-outline);
	}

	.transaction-details {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.tf-names {
		font-size: 13px;
		color: var(--color-on-surface-variant);
	}

	.tf-amount {
		font-weight: 700;
	}

	.settle-form {
		flex-shrink: 0;
	}

	.settled-section {
		margin-bottom: 40px;
	}

	.settled-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.settled-card {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px 20px;
	}

	.settled-card.paid {
		opacity: 0.7;
	}

	.settled-flow {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
	}

	.settled-name {
		font-weight: 600;
		font-size: 14px;
	}

	.settled-amount {
		font-weight: 700;
		font-size: 16px;
	}

	.settled-actions {
		flex-shrink: 0;
	}

	.expenses-section {
		margin-bottom: 40px;
	}

	.expenses-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.expense-card {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 20px;
	}

	.expense-main {
		flex: 1;
	}

	.expense-header {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 12px;
	}

	.expense-payer {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.payer-avatar {
		width: 44px;
		height: 44px;
		border-radius: var(--radius-full);
		background: linear-gradient(135deg, var(--color-primary-container) 0%, var(--color-secondary-container) 100%);
		color: var(--color-on-primary-container);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 16px;
	}

	.payer-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.payer-name {
		font-weight: 600;
	}

	.expense-title-amount {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 2px;
	}

	.expense-title {
		font-weight: 600;
		font-size: 16px;
	}

	.expense-amount {
		font-weight: 700;
	}

	.expense-split {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 14px;
		background: var(--color-surface-container-low);
		border-radius: var(--radius-md);
	}

	.expense-actions {
		display: flex;
		gap: 4px;
		flex-shrink: 0;
	}

	.edit-expense-form {
		width: 100%;
		padding: 20px;
		background: var(--color-surface-container);
		border-radius: var(--radius-lg);
	}

	.edit-expense-form .form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
		margin-bottom: 12px;
	}

	.edit-expense-form .form-group {
		margin-bottom: 12px;
	}

	.members-section {
		margin-bottom: 40px;
	}

	.members-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: 12px;
	}

	.member-card {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
	}

	.member-avatar {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-full);
		background: var(--color-primary-container);
		color: var(--color-on-primary-container);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 14px;
		flex-shrink: 0;
	}

	.member-name {
		flex: 1;
		font-weight: 600;
		font-size: 14px;
	}

	.member-action {
		flex-shrink: 0;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}

	.form-group {
		margin-bottom: 16px;
	}

	.form-actions {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
	}

	.segmented-control {
		display: flex;
		background: var(--color-surface-container);
		border-radius: var(--radius-lg);
		padding: 4px;
		gap: 4px;
	}

	.segment {
		flex: 1;
		cursor: pointer;
		padding: 10px 16px;
		border-radius: var(--radius-md);
		font-size: 14px;
		font-weight: 600;
		text-align: center;
		transition: all var(--transition-fast);
		color: var(--color-on-surface-variant);
	}

	.segment input {
		display: none;
	}

	.segment:hover {
		color: var(--color-on-surface);
	}

	.segment.active {
		background: var(--color-surface-bright);
		color: var(--color-primary);
		box-shadow: var(--elevation-1);
	}

	.splitter-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.splitter-chips .chip {
		cursor: pointer;
	}

	.splitter-chips .chip input {
		display: none;
	}

	.split-inputs {
		padding: 16px;
		background: var(--color-surface-container-low);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-outline-variant);
	}

	.split-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 10px;
	}

	.split-row:last-child {
		margin-bottom: 0;
	}

	.split-name {
		font-weight: 500;
		font-size: 14px;
	}

	.split-row input {
		width: 80px;
	}

	.split-parts-input {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.split-parts-input input {
		width: 60px;
	}

	.split-calc {
		font-size: 12px;
		color: var(--color-on-surface-variant);
		min-width: 80px;
	}

	.input-sm {
		padding: 8px 12px;
		font-size: 14px;
	}

	.font-display {
		font-family: var(--font-display);
	}

	@media (max-width: 768px) {
		.group-hero {
			flex-direction: column;
			gap: 24px;
		}

		.hero-actions {
			width: 100%;
		}

		.hero-actions .btn {
			flex: 1;
		}

		.dashboard-grid {
			grid-template-columns: 1fr;
		}

		.stat-card {
			min-width: 0;
		}

		.form-row {
			grid-template-columns: 1fr;
		}

		.expense-card {
			flex-direction: column;
			gap: 16px;
		}

		.expense-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.expense-title-amount {
			align-items: flex-start;
		}

		.expense-actions {
			align-self: flex-end;
		}
	}
</style>