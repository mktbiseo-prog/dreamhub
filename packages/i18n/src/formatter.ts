// ---------------------------------------------------------------------------
// Locale-Aware Formatting
//
// Uses the Intl API for locale-specific date, number, and currency formatting.
// Each locale renders differently:
//   en: 1,000  |  ko: 1,000  |  ar: ١٬٠٠٠  |  pt: 1.000
// ---------------------------------------------------------------------------

/**
 * Format a date for the given locale.
 *
 * @example
 * formatDate(new Date('2025-03-15'), 'en')  → "Mar 15, 2025"
 * formatDate(new Date('2025-03-15'), 'ko')  → "2025. 3. 15."
 * formatDate(new Date('2025-03-15'), 'ar')  → "١٥ مارس ٢٠٢٥"
 */
export function formatDate(
  date: Date,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const defaults: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Intl.DateTimeFormat(locale, options ?? defaults).format(date);
}

/**
 * Format a number for the given locale.
 *
 * @example
 * formatNumber(1000, 'en')  → "1,000"
 * formatNumber(1000, 'pt')  → "1.000"
 * formatNumber(1000, 'ar')  → "١٬٠٠٠"
 */
export function formatNumber(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Format a currency amount for the given locale.
 *
 * @example
 * formatCurrency(29.99, 'USD', 'en')  → "$29.99"
 * formatCurrency(29.99, 'USD', 'ko')  → "US$29.99"
 * formatCurrency(29.99, 'EUR', 'pt')  → "€ 29,99"
 */
export function formatCurrency(
  amount: number,
  currency: string,
  locale: string,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    ...options,
  }).format(amount);
}
