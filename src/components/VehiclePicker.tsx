import {
  Autocomplete,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  type SelectChangeEvent,
} from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { VEHICLE_PRESETS } from '../data/vehicles'
import {
  buildEeaCascadeIndex,
  parseLitersPer100FromRow,
  type EeaCo2BundleFile,
  type EeaMenuItem,
} from '../services/eeaCo2Cars'

type PresetOption = {
  id: string
  label: string
  litersPer100km: number
}

type VehiclePickerProps = {
  selectedId: string | null
  onSelect: (id: string | null, litersPer100km: number | null) => void
}

export function VehiclePicker({ selectedId, onSelect }: VehiclePickerProps) {
  const { t } = useTranslation()

  const presetOptions: PresetOption[] = useMemo(
    () =>
      VEHICLE_PRESETS.map((p) => ({
        id: p.id,
        label: t(p.labelKey),
        litersPer100km: p.consumptionLPer100km,
      })),
    [t],
  )

  const presetValue = useMemo(() => {
    if (!selectedId?.startsWith('preset_')) return null
    return presetOptions.find((p) => p.id === selectedId) ?? null
  }, [presetOptions, selectedId])

  const [bundle, setBundle] = useState<EeaCo2BundleFile | null>(null)
  const [bundleError, setBundleError] = useState<string | null>(null)

  useEffect(() => {
    const scheduleId = setTimeout(() => {
      setBundleError(null)
      void import('../data/eeaCo2Cars.bundle.json')
        .then((m) => {
          setBundle(m.default as EeaCo2BundleFile)
        })
        .catch((e: unknown) => {
          setBundleError(e instanceof Error ? e.message : String(e))
          setBundle(null)
        })
    }, 0)
    return () => clearTimeout(scheduleId)
  }, [])

  const index = useMemo(
    () => (bundle ? buildEeaCascadeIndex(bundle.rows) : null),
    [bundle],
  )

  const [make, setMake] = useState('')
  const [modelRowId, setModelRowId] = useState('')
  const [eeaError, setEeaError] = useState<string | null>(null)

  const makes: EeaMenuItem[] = useMemo(
    () => (index ? index.listMakes() : []),
    [index],
  )
  const models = useMemo(
    () => (index && make ? index.listModels(make) : []),
    [index, make],
  )

  useEffect(() => {
    if (selectedId != null) return
    const id = setTimeout(() => {
      setMake('')
      setModelRowId('')
      setEeaError(null)
    }, 0)
    return () => clearTimeout(id)
  }, [selectedId])

  useEffect(() => {
    if (!index || !selectedId?.startsWith('eea:')) return
    const rid = selectedId.slice(4)
    const row = index.rowsById.get(rid)
    if (!row) return
    const scheduleId = setTimeout(() => {
      setMake(row.Mk)
      setModelRowId(rid)
      setEeaError(null)
    }, 0)
    return () => clearTimeout(scheduleId)
  }, [selectedId, index])

  const handleMakeChange = useCallback(
    (e: SelectChangeEvent<string>) => {
      const m = e.target.value
      setMake(m)
      setModelRowId('')
      onSelect(null, null)
    },
    [onSelect],
  )

  const handleModelChange = useCallback(
    (e: SelectChangeEvent<string>) => {
      const rid = e.target.value
      setModelRowId(rid)
      if (!rid || !index) {
        onSelect(null, null)
        return
      }
      const row = index.rowsById.get(rid)
      if (!row) {
        setEeaError(t('vehicle.eeaInvalidFc'))
        onSelect(null, null)
        return
      }
      const l = parseLitersPer100FromRow(row)
      if (l === null) {
        setEeaError(t('vehicle.eeaInvalidFc'))
        onSelect(null, null)
        return
      }
      setEeaError(null)
      onSelect(`eea:${rid}`, l)
    },
    [index, onSelect, t],
  )

  const loadingBundle = !bundle && !bundleError

  return (
    <Stack spacing={2}>
      <Autocomplete
        value={presetValue}
        onChange={(_, v) => {
          if (!v) {
            onSelect(null, null)
            return
          }
          setMake('')
          setModelRowId('')
          setEeaError(null)
          onSelect(v.id, v.litersPer100km)
        }}
        options={presetOptions}
        getOptionLabel={(o) => o.label}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t('vehicle.presetsLabel')}
            size="small"
            helperText={t('vehicle.presetsHint')}
          />
        )}
      />

      <Box>
        <Typography variant="subtitle2" color="text.secondary" className="mb-2">
          {t('vehicle.eeaSectionTitle')}
        </Typography>
        <Typography variant="caption" color="text.secondary" className="mb-2 block">
          {t('vehicle.eeaSectionBody')}
        </Typography>
        <Stack spacing={1.5}>
          <FormControl fullWidth size="small" disabled={loadingBundle}>
            <InputLabel id="eea-make-label">{t('vehicle.eeaMake')}</InputLabel>
            <Select
              labelId="eea-make-label"
              value={make}
              label={t('vehicle.eeaMake')}
              onChange={handleMakeChange}
            >
              {makes.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.text}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" disabled={!make || loadingBundle}>
            <InputLabel id="eea-model-label">{t('vehicle.eeaModel')}</InputLabel>
            <Select
              labelId="eea-model-label"
              value={modelRowId}
              label={t('vehicle.eeaModel')}
              onChange={handleModelChange}
            >
              {models.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.text}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        {bundleError && (
          <Typography variant="caption" color="error" className="mt-1 block">
            {bundleError}
          </Typography>
        )}
        {eeaError && (
          <Typography variant="caption" color="error" className="mt-1 block">
            {eeaError}
          </Typography>
        )}
      </Box>
    </Stack>
  )
}
