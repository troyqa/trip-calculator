import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useTripCalculator } from './useTripCalculator'

describe('useTripCalculator', () => {
  it('computes total when inputs are valid', () => {
    const { result } = renderHook(() => useTripCalculator())
    act(() => {
      result.current.setDistanceKm('100')
      result.current.setConsumptionLPer100km('8')
      result.current.setFuelPricePerLiter('50')
    })
    expect(result.current.result.totalUah).toBe(400)
    expect(result.current.result.fuelCostUah).toBe(400)
    expect(result.current.result.depreciationUah).toBeNull()
    expect(result.current.result.inputsValid).toBe(true)
  })

  it('adds depreciation at 0.5 UAH/km when enabled', () => {
    const { result } = renderHook(() => useTripCalculator())
    act(() => {
      result.current.setDistanceKm('100')
      result.current.setConsumptionLPer100km('8')
      result.current.setFuelPricePerLiter('50')
      result.current.setIncludeDepreciation(true)
    })
    expect(result.current.result.fuelCostUah).toBe(400)
    expect(result.current.result.depreciationUah).toBe(50)
    expect(result.current.result.totalUah).toBe(450)
  })

  it('doubles effective distance when return trip is included', () => {
    const { result } = renderHook(() => useTripCalculator())
    act(() => {
      result.current.setDistanceKm('100')
      result.current.setConsumptionLPer100km('8')
      result.current.setFuelPricePerLiter('50')
      result.current.setIncludeReturnTrip(true)
    })
    expect(result.current.result.fuelCostUah).toBe(800)
    expect(result.current.result.totalUah).toBe(800)
  })

  it('splits cost when people >= 2', () => {
    const { result } = renderHook(() => useTripCalculator())
    act(() => {
      result.current.setDistanceKm('100')
      result.current.setConsumptionLPer100km('8')
      result.current.setFuelPricePerLiter('50')
      result.current.setPeople('4')
    })
    expect(result.current.result.perPerson).toEqual({
      kind: 'split',
      amountUah: 100,
    })
  })
})
