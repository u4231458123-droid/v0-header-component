/**
 * Safe Number Utility
 * Converts undefined, null, NaN to 0 for safe number operations
 */

export function safeNumber(value: number | undefined | null): number {
  if (value === undefined || value === null || isNaN(value)) {
    return 0
  }
  return value
}

export function formatCurrency(value: number | undefined | null, decimals = 2): string {
  return `${safeNumber(value).toFixed(decimals)} €`
}

export function formatPercent(value: number | undefined | null, decimals = 1): string {
  return `${safeNumber(value).toFixed(decimals)}%`
}

export function formatNumber(value: number | undefined | null, decimals = 0): string {
  return safeNumber(value).toFixed(decimals)
}
