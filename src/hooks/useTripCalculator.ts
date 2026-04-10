import { useCallback, useMemo, useState } from 'react'
import {
  computeDepreciationUah,
  computeTripCostUah,
  DEFAULT_DEPRECIATION_UAH_PER_KM,
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
  fuelCostUah: number | null
  depreciationUah: number | null
  perPerson: { kind: 'none' } | { kind: 'split'; amountUah: number }
  peopleError: boolean
  inputsValid: boolean
}

export function useTripCalculator() {
  const [distanceKm, setDistanceKm] = useState('')
  const [consumptionLPer100km, setConsumptionState] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState('')
  const [people, setPeople] = useState('')
  const [includeDepreciation, setIncludeDepreciation] = useState(false)
  const [includeReturnTrip, setIncludeReturnTrip] = useState(false)

  const setConsumptionLPer100km = useCallback((v: string) => {
    setSelectedVehicleId(null)
    setConsumptionState(v)
  }, [])

  const selectVehicle = useCallback((id: string | null, litersPer100km: number | null) => {
    if (id === null) {
      setSelectedVehicleId(null)
      return
    }
    if (litersPer100km === null || !Number.isFinite(litersPer100km)) return
    setSelectedVehicleId(id)
    setConsumptionState(litersPer100km.toFixed(2))
  }, [])

  const result = useMemo((): TripCalculatorResult => {
    const d = parseOptionalPositiveNumber(distanceKm)
    const c = parseOptionalPositiveNumber(consumptionLPer100km)
    const p = parseOptionalPositiveNumber(fuelPricePerLiter)
    if (d === null || c === null || p === null) {
      return {
        totalUah: null,
        fuelCostUah: null,
        depreciationUah: null,
        perPerson: { kind: 'none' },
        peopleError: false,
        inputsValid: false,
      }
    }
    const distanceForCostKm = includeReturnTrip ? d * 2 : d
    const fuelCostUah = computeTripCostUah(distanceForCostKm, c, p)
    const depreciationUah = includeDepreciation
      ? computeDepreciationUah(distanceForCostKm, DEFAULT_DEPRECIATION_UAH_PER_KM)
      : 0
    const total = fuelCostUah + depreciationUah
    const per = resolvePerPersonUah(total, people)
    if (per.kind === 'error') {
      return {
        totalUah: total,
        fuelCostUah,
        depreciationUah: includeDepreciation ? depreciationUah : null,
        perPerson: { kind: 'none' },
        peopleError: true,
        inputsValid: true,
      }
    }
    if (per.kind === 'split') {
      return {
        totalUah: total,
        fuelCostUah,
        depreciationUah: includeDepreciation ? depreciationUah : null,
        perPerson: per,
        peopleError: false,
        inputsValid: true,
      }
    }
    return {
      totalUah: total,
      fuelCostUah,
      depreciationUah: includeDepreciation ? depreciationUah : null,
      perPerson: { kind: 'none' },
      peopleError: false,
      inputsValid: true,
    }
  }, [
    distanceKm,
    consumptionLPer100km,
    fuelPricePerLiter,
    people,
    includeDepreciation,
    includeReturnTrip,
  ])

  return {
    distanceKm,
    setDistanceKm,
    consumptionLPer100km,
    setConsumptionLPer100km,
    selectedVehicleId,
    selectVehicle,
    fuelPricePerLiter,
    setFuelPricePerLiter,
    people,
    setPeople,
    includeDepreciation,
    setIncludeDepreciation,
    includeReturnTrip,
    setIncludeReturnTrip,
    result,
  }
}
