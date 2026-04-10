import { useEffect, useState } from 'react'
import {
  fetchUkraineFuelPricesUah,
  type UkraineFuelPricesUah,
} from '../services/ukFuelPrices'

export function useUkraineFuelPrices() {
  const [prices, setPrices] = useState<UkraineFuelPricesUah | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchedAt, setFetchedAt] = useState<string | null>(null)
  const [usedFallback, setUsedFallback] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchUkraineFuelPricesUah().then((r) => {
      if (cancelled) return
      setPrices(r.prices)
      setFetchedAt(r.fetchedAt)
      setUsedFallback(r.usedFallback)
      setError(r.error)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return { prices, loading, error, fetchedAt, usedFallback }
}
