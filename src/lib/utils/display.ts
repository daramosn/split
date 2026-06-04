export function getBalanceColor(balance: number): string {
  if (balance > 0.01) return 'var(--color-success)'
  if (balance < -0.01) return 'var(--color-danger)'
  return 'var(--color-on-surface)'
}

export function getBalanceBg(balance: number): string {
  if (balance > 0.01) return 'var(--color-success-container)'
  if (balance < -0.01) return 'var(--color-danger-container)'
  return 'var(--color-surface-container)'
}

export function getBalanceLabel(balance: number): string {
  if (balance > 0.01) return 'gets back'
  if (balance < -0.01) return 'owes'
  return 'all settled'
}

export function calculatePartShare(
  parts: Record<string, number>,
  amount: number,
): number {
  const totalParts = Object.values(parts).reduce((sum, p) => sum + p, 0)
  if (totalParts === 0) return 0
  return amount / totalParts
}
