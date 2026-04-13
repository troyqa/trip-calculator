import { useCallback, useEffect, useState } from 'react'
import { AppBar, Box, Container, CssBaseline, Toolbar, Typography } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { BauhausLogo } from './components/BauhausLogo'
import { BauhausSurface } from './components/BauhausSurface'
import { MapRouteSection } from './components/MapRouteSection'
import { TripForm } from './components/TripForm'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { useTripCalculator } from './hooks/useTripCalculator'
import { bauhausTheme } from './theme/bauhausTheme'
import type { RouteSummary } from './types/route'

const ORS_KEY = import.meta.env.VITE_ORS_API_KEY as string | undefined

function App() {
  const { t, i18n } = useTranslation()
  const {
    distanceKm,
    setDistanceKm,
    consumptionLPer100km,
    setConsumptionLPer100km,
    selectedVehicleId,
    selectVehicle,
    fuelPriceSource,
    setFuelPriceSource,
    presetFuelType,
    setPresetFuelType,
    uaFuelPricesLoading,
    uaFuelPricesError,
    uaFuelPricesFetchedAt,
    uaFuelPricesUsedFallback,
    fuelPriceDisplay,
    setFuelPricePerLiter,
    people,
    setPeople,
    includeDepreciation,
    setIncludeDepreciation,
    includeReturnTrip,
    setIncludeReturnTrip,
    result,
  } = useTripCalculator()
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null)

  useEffect(() => {
    document.documentElement.lang = i18n.language.startsWith('en') ? 'en' : 'uk'
  }, [i18n.language])

  const handleDistanceFromRoute = useCallback((km: number) => {
    setDistanceKm(Number.isFinite(km) ? km.toFixed(2) : '')
  }, [setDistanceKm])

  const handleRouteCleared = useCallback(() => {
    setDistanceKm('')
    setRouteSummary(null)
  }, [setDistanceKm])

  const handleRouteSummary = useCallback((s: RouteSummary | null) => {
    setRouteSummary(s)
  }, [])

  return (
    <ThemeProvider theme={bauhausTheme}>
      <CssBaseline />
      <div className="flex min-h-full flex-col bg-bauhaus-bg">
        <AppBar position="static" color="secondary" elevation={0}>
          <Toolbar className="flex flex-wrap gap-4" disableGutters sx={{ px: { xs: 2, sm: 3 }, py: 1.5 }}>
            <Box className="flex min-w-0 flex-1 items-center gap-3">
              <BauhausLogo className="shrink-0" />
              <Typography variant="h6" component="h1" className="truncate text-white">
                {t('app.title')}
              </Typography>
            </Box>
            <LanguageSwitcher />
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          className="flex-1 border-b-4 border-bauhaus-ink bg-bauhaus-yellow/25"
        >
          <Container
            maxWidth={false}
            className="max-w-7xl px-4 py-4 sm:px-6 sm:py-[1.333rem] lg:px-8 lg:py-8"
          >
            <Typography
              component="p"
              variant="body1"
              className="mb-10 max-w-3xl border-l-4 border-bauhaus-red pl-4 text-lg font-medium leading-relaxed text-bauhaus-ink"
            >
              {t('app.subtitle')}
            </Typography>

            <div className="grid gap-8 md:gap-10 lg:grid-cols-2 lg:items-start">
              <BauhausSurface accent="yellow">
                <TripForm
                  distanceKm={distanceKm}
                  onDistanceKmChange={setDistanceKm}
                  consumptionLPer100km={consumptionLPer100km}
                  onConsumptionChange={setConsumptionLPer100km}
                  fuelPriceSource={fuelPriceSource}
                  onFuelPriceSourceChange={setFuelPriceSource}
                  presetFuelType={presetFuelType}
                  onPresetFuelTypeChange={setPresetFuelType}
                  uaFuelPricesLoading={uaFuelPricesLoading}
                  uaFuelPricesError={uaFuelPricesError}
                  uaFuelPricesFetchedAt={uaFuelPricesFetchedAt}
                  uaFuelPricesUsedFallback={uaFuelPricesUsedFallback}
                  fuelPriceDisplay={fuelPriceDisplay}
                  onFuelPriceChange={setFuelPricePerLiter}
                  people={people}
                  onPeopleChange={setPeople}
                  includeDepreciation={includeDepreciation}
                  onIncludeDepreciationChange={setIncludeDepreciation}
                  includeReturnTrip={includeReturnTrip}
                  onIncludeReturnTripChange={setIncludeReturnTrip}
                  result={result}
                  selectedVehicleId={selectedVehicleId}
                  onSelectVehicle={selectVehicle}
                />
              </BauhausSurface>

              <BauhausSurface accent="blue">
                <MapRouteSection
                  apiKey={ORS_KEY}
                  onDistanceKm={handleDistanceFromRoute}
                  onRouteCleared={handleRouteCleared}
                  routeSummary={routeSummary}
                  onRouteSummary={handleRouteSummary}
                />
              </BauhausSurface>
            </div>
          </Container>
        </Box>

        <Box
          component="footer"
          className="border-t-4 border-bauhaus-ink bg-bauhaus-ink px-4 py-8 text-white sm:px-6 lg:px-8"
        >
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6">
            <p className="text-xs font-bold uppercase tracking-widest">{t('app.title')}</p>
            <BauhausLogo variant="onDark" />
          </div>
        </Box>
      </div>
    </ThemeProvider>
  )
}

export default App
