import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  FALLBACK_UA_FUEL_UAH,
  fetchUkraineFuelPricesUah,
} from './ukFuelPrices'

describe('fetchUkraineFuelPricesUah', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('maps UA block from OpenVan response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            UA: {
              prices: { gasoline: 70, diesel: 80, lpg: 45 },
              fetched_at: '2026-01-01T00:00:00.000Z',
              sources: ['Fuelo.net'],
            },
          },
        }),
      }),
    )
    const r = await fetchUkraineFuelPricesUah()
    expect(r.usedFallback).toBe(false)
    expect(r.error).toBeNull()
    expect(r.prices).toEqual({ gasoline: 70, diesel: 80, lpg: 45 })
    expect(r.sources).toContain('Fuelo.net')
  })

  it('uses fallback on failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')))
    const r = await fetchUkraineFuelPricesUah()
    expect(r.usedFallback).toBe(true)
    expect(r.error).toBe('network')
    expect(r.prices).toEqual({ ...FALLBACK_UA_FUEL_UAH })
  })
})
