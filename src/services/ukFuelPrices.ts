/** Retail fuel averages for Ukraine (UAH/L). Used if the API is unreachable. */
export const FALLBACK_UA_FUEL_UAH = {
  gasoline: 72.72,
  diesel: 87.12,
  lpg: 47.55,
} as const

export type PresetFuelKind = keyof typeof FALLBACK_UA_FUEL_UAH

export type UkraineFuelPricesUah = Record<PresetFuelKind, number>

const OPENVAN_FUEL_URL =
  'https://openvan.camp/api/fuel/prices?source=trip-calculator'

type OpenVanFuelResponse = {
  success?: boolean
  data?: {
    UA?: {
      prices?: {
        gasoline?: number | null
        diesel?: number | null
        lpg?: number | null
      }
      fetched_at?: string
      sources?: string[]
    }
  }
}

export async function fetchUkraineFuelPricesUah(): Promise<{
  prices: UkraineFuelPricesUah
  fetchedAt: string | null
  sources: string[]
  usedFallback: boolean
  error: string | null
}> {
  try {
    const res = await fetch(OPENVAN_FUEL_URL, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }
    const json = (await res.json()) as OpenVanFuelResponse
    const ua = json?.data?.UA
    const p = ua?.prices
    const gasoline = p?.gasoline
    const diesel = p?.diesel
    const lpg = p?.lpg
    if (
      gasoline == null ||
      diesel == null ||
      lpg == null ||
      !Number.isFinite(gasoline) ||
      !Number.isFinite(diesel) ||
      !Number.isFinite(lpg)
    ) {
      throw new Error('Incomplete Ukraine fuel data')
    }
    return {
      prices: { gasoline, diesel, lpg },
      fetchedAt: ua?.fetched_at ?? null,
      sources: Array.isArray(ua?.sources) ? ua.sources : [],
      usedFallback: false,
      error: null,
    }
  } catch (e) {
    return {
      prices: { ...FALLBACK_UA_FUEL_UAH },
      fetchedAt: null,
      sources: [],
      usedFallback: true,
      error: e instanceof Error ? e.message : 'Request failed',
    }
  }
}
