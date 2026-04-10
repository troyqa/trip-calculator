import { useMemo, useState } from 'react'
import {
  computeTripCostUah,
  parseOptionalPositiveNumber,
  resolvePerPersonUah,
} from '../lib/tripCost'

export type TripCalculatorInputs = {
  distanceKm: string
  consumptionLPer100km: string
  fuelPricePerLiter: string
  people: string
}

export type TripCalculatorResult = {
  totalUah: number | null
  perPerson: { kind: 'none' } | { kind: 'split'; amountUah: number }
  peopleError: boolean
  inputsValid: boolean
}

export function useTripCalculator() {
  const [distanceKm, setDistanceKm] = useState('')
  const [consumptionLPer100km, setConsumptionLPer100km] = useState('')
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState('')
  const [people, setPeople] = useState('')

  const result = useMemo((): TripCalculatorResult => {
    const d = parseOptionalPositiveNumber(distanceKm)
    const c = parseOptionalPositiveNumber(consumptionLPer100km)
    const p = parseOptionalPositiveNumber(fuelPricePerLiter)
    if (d === null || c === null || p === null) {
      return {
        totalUah: null,
        perPerson: { kind: 'none' },
        peopleError: false,
        inputsValid: false,
      }
    }
    const total = computeTripCostUah(d, c, p)
    const per = resolvePerPersonUah(total, people)
    if (per.kind === 'error') {
      return {
        totalUah: total,
        perPerson: { kind: 'none' },
        peopleError: true,
        inputsValid: true,
      }
    }
    if (per.kind === 'split') {
      return {
        totalUah: total,
        perPerson: per,
        peopleError: false,
        inputsValid: true,
      }
    }
    return {
      totalUah: total,
      perPerson: { kind: 'none' },
      peopleError: false,
      inputsValid: true,
    }
  }, [distanceKm, consumptionLPer100km, fuelPricePerLiter, people])

  return {
    distanceKm,
    setDistanceKm,
    consumptionLPer100km,
    setConsumptionLPer100km,
    fuelPricePerLiter,
    setFuelPricePerLiter,
    people,
    setPeople,
    result,
  }
}
