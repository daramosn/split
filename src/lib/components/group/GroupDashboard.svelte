<script lang="ts">
  import { enhance } from '$app/forms'
  import Avatar from '$lib/components/base/Avatar.svelte'
  import Badge from '$lib/components/base/Badge.svelte'
  import Button from '$lib/components/base/Button.svelte'
  import { IconArrowFlow, IconArrowRightShort, IconCheckSmall, IconCurrency } from '$lib/components/icons'
  import { getBalanceColor, getBalanceBg, getBalanceLabel } from '$lib/utils/display'
  import type { Settlement } from '$lib/types'

  interface Props {
    summary: Promise<{
      balances: { participantId: string; participantName: string; totalPaid: number; totalOwed: number; balance: number }[]
      total: number
      transactions: { from: string; to: string; amount: number }[]
    }>
    settlements: Settlement[]
    currency: string
    formatCurrency: (amount: number) => string
    getParticipantName: (id: string) => string
  }

  let {
    summary,
    settlements,
    formatCurrency,
    getParticipantName,
  }: Props = $props()
</script>

<section class="dashboard-grid animate-fade-in-up stagger-2">
  <div class="stat-card card card-elevated">
    <div class="stat-header">
      <span class="stat-icon text-success">
        <IconCurrency size={24} />
      </span>
      <span class="stat-label">Total Expenses</span>
    </div>
    <div class="stat-value text-2xl font-display text-success">
      {#await summary}
        <span class="skeleton skeleton-text" style="width: 120px" aria-hidden="true"></span>
      {:then { total }}
        {formatCurrency(total)}
      {/await}
    </div>
  </div>

  <div class="balances-card card card-elevated">
    <h3 class="text-base font-display mb-4">Balances</h3>
    <div class="balances-list">
      {#await summary}
        {#each Array(3) as _}
          <div class="balance-item" aria-hidden="true">
            <div class="skeleton skeleton-avatar"></div>
            <div class="balance-info">
              <span class="skeleton skeleton-text" style="width: 100px"></span>
              <span class="skeleton skeleton-text" style="width: 60px"></span>
            </div>
            <div class="skeleton skeleton-text" style="width: 80px; height: 32px"></div>
          </div>
        {/each}
      {:then { balances }}
        {#each balances as b}
          <div
            class="balance-item"
            style="--balance-color: {getBalanceColor(
              b.balance,
            )}; --balance-bg: {getBalanceBg(b.balance)}"
          >
            <Avatar name={b.participantName} />
            <div class="balance-info">
              <span class="balance-name">{b.participantName}</span>
              <span class="balance-label">{getBalanceLabel(b.balance)}</span>
              <span class="balance-detail text-sm text-secondary">
                Paid {formatCurrency(b.totalPaid)} · Owes {formatCurrency(b.totalOwed)}
              </span>
            </div>
            <div
              class="balance-amount"
              style="color: {getBalanceColor(
                b.balance,
              )}; background: {getBalanceBg(b.balance)}"
            >
              {b.balance > 0 ? '+' : ''}{formatCurrency(b.balance)}
            </div>
          </div>
        {/each}
      {/await}
    </div>
  </div>
</section>

{#await summary then { transactions }}
  {#if transactions.length > 0}
    <section class="settlements-section animate-fade-in-up stagger-3">
      <h2 class="section-title">Suggested Settlements</h2>
      <p class="text-secondary text-sm mb-4">
        Minimum transactions to settle all debts
      </p>
      <div class="transactions-list">
        {#each transactions as t}
          <div class="transaction-card card">
            <div class="transaction-flow">
              <div class="tf-avatar from">
                {getParticipantName(t.from).charAt(0)}
              </div>
              <div class="tf-arrow">
                <IconArrowFlow size={20} />
              </div>
              <div class="tf-avatar to">
                {getParticipantName(t.to).charAt(0)}
              </div>
            </div>
            <div class="transaction-details">
              <span class="tf-names">
                <strong>{getParticipantName(t.from)}</strong> owes
                <strong>{getParticipantName(t.to)}</strong>
              </span>
              <span class="tf-amount text-xl font-display">{formatCurrency(t.amount)}</span
              >
            </div>
            <form
              method="POST"
              action="?/settleUp"
              class="settle-form"
              use:enhance
            >
              <input type="hidden" name="fromId" value={t.from} />
              <input type="hidden" name="toId" value={t.to} />
              <input type="hidden" name="amount" value={t.amount} />
              <Button variant="primary" size="sm" type="submit">Settle Up</Button>
            </form>
          </div>
        {/each}
      </div>
    </section>
  {/if}
{/await}

{#if settlements.length > 0}
  <section class="settled-section animate-fade-in-up stagger-4">
    <h2 class="section-title">Settled Debts</h2>
    <div class="settled-list">
      {#each settlements as s}
        <div class="settled-card card" class:paid={s.paid}>
          <div class="settled-flow">
            <span class="settled-name">{getParticipantName(s.fromId)}</span>
            <IconArrowRightShort size={16} />
            <span class="settled-name">{getParticipantName(s.toId)}</span>
          </div>
          <span class="settled-amount font-display">{formatCurrency(s.amount)}</span>
          <div class="settled-actions">
            {#if s.paid}
              <Badge variant="success">
                <IconCheckSmall size={12} strokeWidth={3} />
                Paid
              </Badge>
            {:else}
              <form method="POST" action="?/markPaid" use:enhance>
                <input type="hidden" name="settlementId" value={s.id} />
                <Button variant="secondary" size="sm" type="submit">Mark Paid</Button>
              </form>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </section>
{/if}

<style>
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
  }

  .stat-value {
    min-height: 28px;
  }

  .balances-card {
    padding: 24px;
  }

  .balances-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .balance-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: var(--radius-md);
    background: var(--color-surface-container-low);
    transition: background var(--transition-fast);
  }

  .balance-item:hover {
    background: var(--color-surface-container);
  }

  .balance-info {
    flex: 1;
  }

  .balance-name {
    font-weight: 600;
    font-size: 14px;
    display: block;
  }

  .balance-label {
    font-size: 12px;
    color: var(--color-on-surface-variant);
    display: block;
  }

  .balance-detail {
    display: block;
    margin-top: 2px;
  }

  .balance-amount {
    padding: 6px 14px;
    border-radius: var(--radius-full);
    font-weight: 700;
    font-size: 14px;
    white-space: nowrap;
  }

  .settlements-section {
    margin-bottom: 40px;
  }

  .section-title {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 20px;
    color: var(--color-on-surface);
  }

  .transactions-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .transaction-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 20px;
  }

  .transaction-flow {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tf-avatar {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    color: white;
  }

  .tf-avatar.from {
    background: var(--color-danger);
  }

  .tf-avatar.to {
    background: var(--color-success);
  }

  .tf-arrow {
    color: var(--color-on-surface-variant);
  }

  .transaction-details {
    flex: 1;
  }

  .tf-names {
    font-size: 14px;
    display: block;
    margin-bottom: 4px;
  }

  .tf-amount {
    font-weight: 700;
    color: var(--color-primary);
  }

  .settled-section {
    margin-bottom: 40px;
  }

  .settled-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .settled-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
  }

  .settled-flow {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .settled-name {
    font-weight: 500;
    font-size: 14px;
  }

  .settled-amount {
    font-weight: 700;
    font-size: 16px;
    margin-left: auto;
    margin-right: 16px;
  }

  .skeleton {
    display: inline-block;
    border-radius: var(--radius-xs);
    background: linear-gradient(
      90deg,
      var(--color-surface-container) 25%,
      var(--color-surface-container-high) 50%,
      var(--color-surface-container) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
  }

  .skeleton-text {
    height: 16px;
    border-radius: var(--radius-xs);
  }

  .skeleton-avatar {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-full);
  }

  @media (max-width: 768px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
    }

    .transaction-card {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
