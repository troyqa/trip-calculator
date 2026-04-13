export function formatMoneyUah(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'uk' ? 'uk-UA' : 'en-GB', {
    style: 'currency',
    currency: 'UAH',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/** Total distance for the estimate (one-way leg or ×2 if return is included). */
export function formatDistanceKm(km: number, locale: string): string {
  const n = km.toLocaleString(locale === 'uk' ? 'uk-UA' : 'en-GB', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })
  return locale === 'uk' ? `${n} км` : `${n} km`
}
