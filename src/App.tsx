import { useCallback, useEffect, useState } from 'react'
import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  Paper,
  Toolbar,
  Typography,
} from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { MapRouteSection } from './components/MapRouteSection'
import { TripForm } from './components/TripForm'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { useTripCalculator } from './hooks/useTripCalculator'
import type { RouteSummary } from './types/route'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
  },
})

const ORS_KEY = import.meta.env.VITE_ORS_API_KEY as string | undefined

function App() {
  const { t, i18n } = useTranslation()
  const {
    distanceKm,
    setDistanceKm,
    consumptionLPer100km,
    setConsumptionLPer100km,
    fuelPricePerLiter,
    setFuelPricePerLiter,
    people,
    setPeople,
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar className="flex flex-wrap gap-2 justify-between">
          <Typography variant="h6" component="h1">
            {t('app.title')}
          </Typography>
          <LanguageSwitcher />
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" className="py-6">
        <Typography variant="body1" color="text.secondary" className="mb-6">
          {t('app.subtitle')}
        </Typography>
        <Box className="grid gap-6 md:grid-cols-2">
          <Paper className="p-4" elevation={2}>
            <TripForm
              distanceKm={distanceKm}
              onDistanceKmChange={setDistanceKm}
              consumptionLPer100km={consumptionLPer100km}
              onConsumptionChange={setConsumptionLPer100km}
              fuelPricePerLiter={fuelPricePerLiter}
              onFuelPriceChange={setFuelPricePerLiter}
              people={people}
              onPeopleChange={setPeople}
              result={result}
            />
          </Paper>
          <MapRouteSection
            apiKey={ORS_KEY}
            onDistanceKm={handleDistanceFromRoute}
            onRouteCleared={handleRouteCleared}
            routeSummary={routeSummary}
            onRouteSummary={handleRouteSummary}
          />
        </Box>
      </Container>
    </ThemeProvider>
  )
}

export default App
