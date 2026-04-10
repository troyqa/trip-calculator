import { Stack, TextField, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { TripCalculatorResult } from '../hooks/useTripCalculator'
import { formatMoneyUah } from '../lib/formatUah'

type TripFormProps = {
  distanceKm: string
  onDistanceKmChange: (v: string) => void
  consumptionLPer100km: string
  onConsumptionChange: (v: string) => void
  fuelPricePerLiter: string
  onFuelPriceChange: (v: string) => void
  people: string
  onPeopleChange: (v: string) => void
  result: TripCalculatorResult
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
  result,
}: TripFormProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'en' ? 'en' : 'uk'

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
      <TextField
        label={t('form.consumption')}
        value={consumptionLPer100km}
        onChange={(e) => onConsumptionChange(e.target.value)}
        type="text"
        inputMode="decimal"
        fullWidth
        size="small"
      />
      <TextField
        label={t('form.fuelPrice')}
        value={fuelPricePerLiter}
        onChange={(e) => onFuelPriceChange(e.target.value)}
        type="text"
        inputMode="decimal"
        fullWidth
        size="small"
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
      {result.inputsValid && result.totalUah !== null && (
        <Stack spacing={1}>
          <Typography variant="subtitle1">
            {t('form.total')}: {formatMoneyUah(result.totalUah, locale)}
          </Typography>
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
