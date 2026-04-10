/** Preset vehicles for future UI (car picker + auto consumption). */
export type Vehicle = {
  id: string
  labelKey: string
  consumptionLPer100km: number
}

/** Empty for now — extend when adding a car selector. */
export const VEHICLES: Vehicle[] = []
