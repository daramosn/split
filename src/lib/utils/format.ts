function resolveLocale(locale?: string): string {
  if (locale) return locale;
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language;
  }
  return 'en-US';
}

export function formatCurrency(amount: number, currency: string, locale?: string): string {
  return new Intl.NumberFormat(resolveLocale(locale), {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(dateStr: string, locale?: string): string {
  return new Date(dateStr).toLocaleDateString(resolveLocale(locale), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
