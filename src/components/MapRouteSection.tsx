import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react'
import {
  Alert,
  AlertTitle,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import L from 'leaflet'
import {
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import { useTranslation } from 'react-i18next'
import type { RouteSummary } from '../types/route'
import { fetchDrivingRoute, metersToKm, type LonLat } from '../services/orsDirections'
import { getDefaultUkraineCitySuggestions } from '../data/uaCitySuggestions'
import {
  searchUkraine,
  type GeocodeUiLang,
} from '../services/orsGeocode'

import iconRetina from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconRetinaUrl: iconRetina,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

export type LatLng = { lat: number; lng: number }

export type PointSelection = { label: string; point: LatLng }

const UKRAINE_CENTER: LatLng = { lat: 48.5, lng: 31.0 }
const DEFAULT_ZOOM = 6

function lonLatToLeaflet([lon, lat]: LonLat): LatLng {
  return { lat, lng: lon }
}

function leafletToLonLat(p: LatLng): LonLat {
  return [p.lng, p.lat]
}

function formatCoordLabel(p: LatLng): string {
  return `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`
}

function MapClickHandler({
  onClick,
}: {
  onClick: (p: LatLng) => void
}) {
  useMapEvents({
    click(e) {
      onClick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

function FitRoute({
  line,
  points,
}: {
  line: LatLng[]
  points: LatLng[]
}) {
  const map = useMap()
  useEffect(() => {
    const pts = line.length >= 2 ? line : points
    if (pts.length === 0) return
    const b = L.latLngBounds(pts.map((p) => [p.lat, p.lng]))
    map.fitBounds(b, { padding: [40, 40], maxZoom: 12 })
  }, [line, map, points])
  return null
}

function formatDuration(sec: number, t: (k: string, o?: Record<string, unknown>) => string) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  return t('trip.durationValue', { hours: h, minutes: m })
}

type GeocodeAutocompleteProps = {
  label: string
  apiKey: string
  uiLang: GeocodeUiLang
  value: PointSelection | null
  onChange: (v: PointSelection | null) => void
  disabled?: boolean
  inputRef?: RefObject<HTMLInputElement | null>
}

function GeocodeAutocomplete({
  label,
  apiKey,
  uiLang,
  value,
  onChange,
  disabled,
  inputRef,
}: GeocodeAutocompleteProps) {
  const { t } = useTranslation()
  const [inputValue, setInputValue] = useState(() => value?.label ?? '')
  const [options, setOptions] = useState<PointSelection[]>([])
  const [loading, setLoading] = useState(false)
  const [listboxOpen, setListboxOpen] = useState(false)

  useEffect(() => {
    const q = inputValue.trim()
    if (q.length === 0 && listboxOpen) {
      setOptions(
        getDefaultUkraineCitySuggestions(uiLang).map((h) => ({
          label: h.label,
          point: lonLatToLeaflet(h.lonLat),
        })),
      )
      setLoading(false)
      return
    }
    if (q.length < 2) {
      setOptions([])
      return
    }
    const id = setTimeout(() => {
      setLoading(true)
      void searchUkraine(inputValue, apiKey, uiLang)
        .then((hits) => {
          setOptions(
            hits.map((h) => ({
              label: h.label,
              point: lonLatToLeaflet(h.lonLat),
            })),
          )
        })
        .catch(() => setOptions([]))
        .finally(() => setLoading(false))
    }, 400)
    return () => clearTimeout(id)
  }, [apiKey, inputValue, uiLang, listboxOpen])

  return (
    <Autocomplete
      disabled={disabled}
      value={value}
      onOpen={() => setListboxOpen(true)}
      onClose={() => setListboxOpen(false)}
      onChange={(_, v) => {
        onChange(v)
        if (v) setInputValue(v.label)
      }}
      inputValue={inputValue}
      onInputChange={(_, v, reason) => {
        if (reason === 'clear') {
          setInputValue('')
          onChange(null)
          return
        }
        if (reason === 'reset' && value) {
          setInputValue(value.label)
          return
        }
        setInputValue(v)
      }}
      options={options}
      loading={loading}
      filterOptions={(x) => x}
      getOptionLabel={(o) => o.label}
      isOptionEqualToValue={(a, b) => a.label === b.label && a.point.lat === b.point.lat}
      renderInput={(params) => (
        <TextField
          {...params}
          inputRef={inputRef}
          label={label}
          size="small"
          helperText={t('map.searchAddressHint')}
        />
      )}
    />
  )
}

type MapClickMode = 'a' | 'b' | 'stop'

type MapRouteSectionProps = {
  apiKey: string | undefined
  onDistanceKm: (km: number) => void
  onRouteCleared: () => void
  routeSummary: RouteSummary | null
  onRouteSummary: (s: RouteSummary | null) => void
}

export function MapRouteSection({
  apiKey,
  onDistanceKm,
  onRouteCleared,
  routeSummary,
  onRouteSummary,
}: MapRouteSectionProps) {
  const { t, i18n } = useTranslation()
  const geocodeLang: GeocodeUiLang = i18n.language.startsWith('en')
    ? 'en'
    : 'uk'
  const pointBInputRef = useRef<HTMLInputElement>(null)
  const [pointA, setPointA] = useState<PointSelection | null>(null)
  const [pointB, setPointB] = useState<PointSelection | null>(null)
  const [stops, setStops] = useState<PointSelection[]>([])
  const [mapMode, setMapMode] = useState<MapClickMode>('a')

  const [routeLine, setRouteLine] = useState<LatLng[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const canUseApi = Boolean(apiKey)

  const routePoints = useMemo((): LatLng[] => {
    if (!pointA || !pointB) return []
    return [pointA.point, ...stops.map((s) => s.point), pointB.point]
  }, [pointA, pointB, stops])

  const allMarkers = useMemo((): LatLng[] => {
    const pts: LatLng[] = []
    if (pointA) pts.push(pointA.point)
    pts.push(...stops.map((s) => s.point))
    if (pointB) pts.push(pointB.point)
    return pts
  }, [pointA, pointB, stops])

  const buildRoute = useCallback(async () => {
    if (!apiKey || routePoints.length < 2) return
    setLoading(true)
    setError(null)
    try {
      const coords = routePoints.map(leafletToLonLat)
      const { summary, lineLonLat } = await fetchDrivingRoute(coords, apiKey)
      onRouteSummary(summary)
      onDistanceKm(metersToKm(summary.distanceM))
      setRouteLine(lineLonLat.map(lonLatToLeaflet))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setRouteLine([])
      onRouteSummary(null)
    } finally {
      setLoading(false)
    }
  }, [apiKey, onDistanceKm, onRouteSummary, routePoints])

  useEffect(() => {
    if (routePoints.length < 2) {
      setRouteLine([])
      onRouteSummary(null)
    }
  }, [routePoints.length, onRouteSummary])

  useEffect(() => {
    if (!canUseApi || routePoints.length < 2) return
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      void buildRoute()
    }, 600)
    return () => clearTimeout(debounceRef.current)
  }, [routePoints, canUseApi, buildRoute])

  const afterPointASelected = useCallback(() => {
    setMapMode('b')
    requestAnimationFrame(() => pointBInputRef.current?.focus())
  }, [])

  const handleMapClick = useCallback(
    (p: LatLng) => {
      const label = formatCoordLabel(p)
      if (mapMode === 'a') {
        setPointA({ label, point: p })
        afterPointASelected()
      } else if (mapMode === 'b') {
        setPointB({ label, point: p })
      } else {
        setStops((s) => [...s, { label, point: p }])
      }
    },
    [afterPointASelected, mapMode],
  )

  const handlePointAChange = useCallback(
    (v: PointSelection | null) => {
      setPointA(v)
      if (v) afterPointASelected()
      else setMapMode('a')
    },
    [afterPointASelected],
  )

  const clearPoints = useCallback(() => {
    setPointA(null)
    setPointB(null)
    setStops([])
    setRouteLine([])
    setMapMode('a')
    onRouteSummary(null)
    onRouteCleared()
    setError(null)
  }, [onRouteCleared, onRouteSummary])

  const removeStop = useCallback((index: number) => {
    setStops((s) => s.filter((_, i) => i !== index))
  }, [])

  const linePositions = useMemo(
    () => routeLine.map((p) => [p.lat, p.lng] as [number, number]),
    [routeLine],
  )

  return (
    <div className="flex flex-col gap-3 pt-1">
      <Typography variant="h6">{t('map.title')}</Typography>
      <Typography variant="body2" color="text.secondary">
        {t('map.hint')}
      </Typography>
      {!canUseApi && (
        <Typography variant="body2" color="warning.main">
          {t('map.needKey')}
        </Typography>
      )}
      {canUseApi && (
        <Box className="flex flex-col gap-2">
          <GeocodeAutocomplete
            key={`pa-${pointA ? `${pointA.point.lat}-${pointA.point.lng}` : 'empty'}`}
            label={t('map.pointA')}
            apiKey={apiKey!}
            uiLang={geocodeLang}
            value={pointA}
            onChange={handlePointAChange}
          />
          <GeocodeAutocomplete
            key={`pb-${pointB ? `${pointB.point.lat}-${pointB.point.lng}` : 'empty'}`}
            label={t('map.pointB')}
            apiKey={apiKey!}
            uiLang={geocodeLang}
            value={pointB}
            onChange={setPointB}
            inputRef={pointBInputRef}
          />
        </Box>
      )}
      {canUseApi && (
        <Box className="flex flex-col gap-1">
          <Typography variant="caption" color="text.secondary">
            {t('map.clickModeLabel')}
          </Typography>
          <ToggleButtonGroup
            fullWidth
            size="small"
            exclusive
            value={mapMode}
            onChange={(_, v: MapClickMode | null) => v && setMapMode(v)}
            aria-label={t('map.clickModeLabel')}
            sx={{ '& .MuiToggleButton-root': { flex: 1 } }}
          >
            <ToggleButton value="a">{t('map.modeA')}</ToggleButton>
            <ToggleButton value="b">{t('map.modeB')}</ToggleButton>
            <ToggleButton value="stop">{t('map.modeStop')}</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}
      {stops.length > 0 && (
        <Box className="flex flex-wrap gap-1 items-center">
          <Typography variant="caption" color="text.secondary">
            {t('map.stops')}:
          </Typography>
          {stops.map((s, i) => (
            <Chip
              key={`${s.point.lat}-${s.point.lng}-${i}`}
              size="small"
              label={s.label.slice(0, 40) + (s.label.length > 40 ? '…' : '')}
              onDelete={() => removeStop(i)}
            />
          ))}
        </Box>
      )}
      <Box className="flex flex-wrap gap-2 items-center">
        <Button variant="outlined" size="small" onClick={clearPoints}>
          {t('map.clear')}
        </Button>
        <Typography variant="body2">
          {t('map.routeStatus', {
            a: pointA ? '✓' : '—',
            b: pointB ? '✓' : '—',
            stops: stops.length,
          })}
        </Typography>
        {loading && <CircularProgress size={22} />}
      </Box>
      {error && canUseApi && (
        <Alert
          severity="error"
          variant="outlined"
          role="alert"
          aria-live="assertive"
          onClose={() => setError(null)}
          sx={{
            borderWidth: 2,
            borderRadius: 0,
            boxShadow: '4px 4px 0px 0px #121212',
          }}
          action={
            <Button
              color="inherit"
              size="small"
              variant="outlined"
              onClick={() => {
                void buildRoute()
              }}
              sx={{ borderRadius: 0, flexShrink: 0 }}
            >
              {t('map.routeErrorRetry')}
            </Button>
          }
        >
          <AlertTitle>{t('map.routeError')}</AlertTitle>
          <Typography variant="body2" color="text.secondary" component="div">
            {t('map.routeErrorIntro')}
            <Box component="ul" sx={{ m: 0, mt: 1, pl: 2.5 }}>
              <li>{t('map.routeErrorHint1')}</li>
              <li>{t('map.routeErrorHint2')}</li>
              <li>{t('map.routeErrorHint3')}</li>
            </Box>
          </Typography>
        </Alert>
      )}
      {routeSummary && canUseApi && (
        <Typography variant="body2" color="text.secondary">
          {t('trip.duration')}: {formatDuration(routeSummary.durationSec, t)}
        </Typography>
      )}
      <Box className="h-[min(420px,55vh)] w-full overflow-hidden border-2 border-bauhaus-ink shadow-[4px_4px_0px_0px_#121212] sm:border-4">
        <MapContainer
          center={[UKRAINE_CENTER.lat, UKRAINE_CENTER.lng]}
          zoom={DEFAULT_ZOOM}
          className="h-full w-full z-0"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onClick={handleMapClick} />
          <FitRoute line={routeLine} points={allMarkers} />
          {pointA && (
            <CircleMarker
              center={[pointA.point.lat, pointA.point.lng]}
              radius={10}
              pathOptions={{ color: '#121212', fillColor: '#1040C0', fillOpacity: 0.95 }}
            >
              <Tooltip direction="top" offset={[0, -6]}>
                A
              </Tooltip>
            </CircleMarker>
          )}
          {pointB && (
            <CircleMarker
              center={[pointB.point.lat, pointB.point.lng]}
              radius={10}
              pathOptions={{ color: '#121212', fillColor: '#D02020', fillOpacity: 0.95 }}
            >
              <Tooltip direction="top" offset={[0, -6]}>
                B
              </Tooltip>
            </CircleMarker>
          )}
          {stops.map((s, i) => (
            <CircleMarker
              key={`stop-${s.point.lat}-${s.point.lng}-${i}`}
              center={[s.point.lat, s.point.lng]}
              radius={8}
              pathOptions={{ color: '#121212', fillColor: '#F0C020', fillOpacity: 0.95 }}
            >
              <Tooltip direction="top" offset={[0, -6]}>
                {i + 1}
              </Tooltip>
            </CircleMarker>
          ))}
          {linePositions.length >= 2 && (
            <Polyline positions={linePositions} pathOptions={{ color: '#1040C0', weight: 5 }} />
          )}
        </MapContainer>
      </Box>
    </div>
  )
}
