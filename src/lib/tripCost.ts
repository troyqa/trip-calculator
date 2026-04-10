/** Default depreciation rate when the option is enabled (UAH per km). */
export const DEFAULT_DEPRECIATION_UAH_PER_KM = 0.5

/** Total trip fuel cost in UAH. */
export function computeTripCostUah(
  distanceKm: number,
  consumptionLPer100km: number,
  fuelPricePerLiter: number,
): number {
  return (distanceKm / 100) * consumptionLPer100km * fuelPricePerLiter
}

/** Linear depreciation add-on: distance × rate (UAH). */
export function computeDepreciationUah(distanceKm: number, uahPerKm: number): number {
  return distanceKm * uahPerKm
}

export type PerPersonResult =
  | { kind: 'none' }
  | { kind: 'split'; amountUah: number }
  | { kind: 'error'; code: 'invalid_people' }

/**
 * Optional split: empty or "1" → no per-person line; integer ≥2 → amount per person.
 */
export function resolvePerPersonUah(
  totalUah: number,
  peopleRaw: string,
): PerPersonResult {
  const trimmed = peopleRaw.trim()
  if (trimmed === '') return { kind: 'none' }
  if (!/^[1-9]\d*$/.test(trimmed)) {
    return { kind: 'error', code: 'invalid_people' }
  }
  const n = Number.parseInt(trimmed, 10)
  if (n < 2) return { kind: 'none' }
  return { kind: 'split', amountUah: totalUah / n }
}

export function isPositiveFinite(n: number): boolean {
  return Number.isFinite(n) && n > 0
}

export function parseOptionalPositiveNumber(raw: string): number | null {
  const t = raw.trim().replace(',', '.')
  if (t === '') return null
  const n = Number.parseFloat(t)
  if (!Number.isFinite(n) || n <= 0) return null
  return n
}

export function parseRequiredPositiveNumber(raw: string): number | null {
  const n = parseOptionalPositiveNumber(raw)
  return n
}
