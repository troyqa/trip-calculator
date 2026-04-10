export function formatMoneyUah(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'uk' ? 'uk-UA' : 'en-GB', {
    style: 'currency',
    currency: 'UAH',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
