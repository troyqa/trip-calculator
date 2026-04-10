import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TripCalculatorResult } from '../hooks/useTripCalculator'
import { formatMoneyUah } from '../lib/formatUah'
import { VehiclePicker } from './VehiclePicker'

type TripFormProps = {
  distanceKm: string
  onDistanceKmChange: (v: string) => void
  consumptionLPer100km: string
  onConsumptionChange: (v: string) => void
  fuelPricePerLiter: string
  onFuelPriceChange: (v: string) => void
  people: string
  onPeopleChange: (v: string) => void
  includeDepreciation: boolean
  onIncludeDepreciationChange: (v: boolean) => void
  result: TripCalculatorResult
  selectedVehicleId: string | null
  onSelectVehicle: (id: string | null, litersPer100km: number | null) => void
}

export function TripForm({
  distanceKm,
  onDistanceKmChange,
  consumptionLPer100km,
  onConsumptionChange,
  fuelPricePerLiter,
  onFuelPriceChange,
  people,
  onPeopleChange,
  includeDepreciation,
  onIncludeDepreciationChange,
  result,
  selectedVehicleId,
  onSelectVehicle,
}: TripFormProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'en' ? 'en' : 'uk'
  const [vehiclePickerOpen, setVehiclePickerOpen] = useState(false)

  return (
    <Stack spacing={2} component="section">
      <TextField
        label={t('form.distance')}
        value={distanceKm}
        onChange={(e) => onDistanceKmChange(e.target.value)}
        type="text"
        inputMode="decimal"
        fullWidth
        size="small"
      />

      <Box>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            alignItems: 'flex-end',
          }}
        >
          <TextField
            label={t('form.consumption')}
            value={consumptionLPer100km}
            onChange={(e) => onConsumptionChange(e.target.value)}
            type="text"
            inputMode="decimal"
            size="small"
            sx={{ flex: '1 1 200px', minWidth: 0 }}
          />
          <Button
            type="button"
            variant="text"
            size="small"
            sx={{ flexShrink: 0, mb: 0.5, textTransform: 'none' }}
            aria-expanded={vehiclePickerOpen}
            onClick={() => setVehiclePickerOpen((o) => !o)}
          >
            {vehiclePickerOpen
              ? t('form.hideVehicleList')
              : t('form.chooseVehicleFromList')}
          </Button>
        </Box>
        {vehiclePickerOpen && (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <VehiclePicker selectedId={selectedVehicleId} onSelect={onSelectVehicle} />
          </Stack>
        )}
      </Box>

      <TextField
        label={t('form.fuelPrice')}
        value={fuelPricePerLiter}
        onChange={(e) => onFuelPriceChange(e.target.value)}
        type="text"
        inputMode="decimal"
        fullWidth
        size="small"
      />
      <FormControlLabel
        control={
          <Checkbox
            size="small"
            checked={includeDepreciation}
            onChange={(e) => onIncludeDepreciationChange(e.target.checked)}
          />
        }
        label={
          <Stack component="span" spacing={0}>
            <Typography component="span" variant="body2">
              {t('form.includeDepreciation')}
            </Typography>
            <Typography component="span" variant="caption" color="text.secondary">
              {t('form.depreciationRateHint')}
            </Typography>
          </Stack>
        }
        sx={{ alignItems: 'flex-start', m: 0 }}
      />
      <TextField
        label={t('form.people')}
        value={people}
        onChange={(e) => onPeopleChange(e.target.value)}
        type="text"
        inputMode="numeric"
        fullWidth
        size="small"
        error={result.peopleError}
        helperText={result.peopleError ? t('form.peopleError') : undefined}
      />
      {result.inputsValid && result.totalUah !== null && result.fuelCostUah !== null && (
        <Stack spacing={1}>
          {result.depreciationUah !== null ? (
            <>
              <Typography variant="body2" color="text.secondary">
                {t('form.fuelCost')}: {formatMoneyUah(result.fuelCostUah, locale)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('form.depreciation')}: {formatMoneyUah(result.depreciationUah, locale)}
              </Typography>
              <Typography variant="subtitle1">
                {t('form.total')}: {formatMoneyUah(result.totalUah, locale)}
              </Typography>
            </>
          ) : (
            <Typography variant="subtitle1">
              {t('form.total')}: {formatMoneyUah(result.totalUah, locale)}
            </Typography>
          )}
          {result.perPerson.kind === 'split' && (
            <Typography variant="body1" color="primary">
              {t('form.perPerson')}:{' '}
              {formatMoneyUah(result.perPerson.amountUah, locale)}
            </Typography>
          )}
        </Stack>
      )}
    </Stack>
  )
}
