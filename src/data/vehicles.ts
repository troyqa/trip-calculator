/** Curated presets for quick estimates (typical mixed-cycle values, L/100 km). */
export type VehiclePreset = {
  id: string
  labelKey: string
  consumptionLPer100km: number
}

export const VEHICLE_PRESETS: VehiclePreset[] = [
  { id: 'preset_compact', labelKey: 'vehicle.preset.compact', consumptionLPer100km: 6.5 },
  { id: 'preset_sedan', labelKey: 'vehicle.preset.sedan', consumptionLPer100km: 8.0 },
  { id: 'preset_suv', labelKey: 'vehicle.preset.suv', consumptionLPer100km: 10.5 },
  { id: 'preset_minivan', labelKey: 'vehicle.preset.minivan', consumptionLPer100km: 11.0 },
  { id: 'preset_pickup', labelKey: 'vehicle.preset.pickup', consumptionLPer100km: 12.5 },
]
