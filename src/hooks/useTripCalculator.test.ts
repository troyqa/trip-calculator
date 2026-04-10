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
    expect(result.current.result.inputsValid).toBe(true)
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
