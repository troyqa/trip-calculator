import type { RouteSummary } from '../types/route'

export type LonLat = [number, number]

type OrsDirectionsGeoJson = {
  features?: Array<{
    properties?: {
      summary?: {
        distance?: number
        duration?: number
      }
    }
    geometry?: {
      coordinates?: number[][]
    }
  }>
}

const ORS_BASE = 'https://api.openrouteservice.org/v2/directions'

export async function fetchDrivingRoute(
  coordinates: LonLat[],
  apiKey: string,
): Promise<{ summary: RouteSummary; lineLonLat: LonLat[] }> {
  if (coordinates.length < 2) {
    throw new Error('Need at least two points')
  }

  const res = await fetch(`${ORS_BASE}/driving-car/geojson`, {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ coordinates }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`ORS ${res.status}: ${text.slice(0, 200)}`)
  }

  const data = (await res.json()) as OrsDirectionsGeoJson
  const feature = data.features?.[0]
  const summary = feature?.properties?.summary
  const distanceM = summary?.distance
  const durationSec = summary?.duration
  if (
    typeof distanceM !== 'number' ||
    typeof durationSec !== 'number' ||
    !Number.isFinite(distanceM) ||
    !Number.isFinite(durationSec)
  ) {
    throw new Error('Invalid ORS response: missing summary')
  }

  const coords = feature?.geometry?.coordinates
  const lineLonLat: LonLat[] = Array.isArray(coords)
    ? coords.map((c) => {
        if (typeof c[0] === 'number' && typeof c[1] === 'number') {
          return [c[0], c[1]]
        }
        return [0, 0]
      })
    : []

  return {
    summary: { distanceM, durationSec },
    lineLonLat,
  }
}

export function metersToKm(m: number): number {
  return m / 1000
}
