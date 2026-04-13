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

/** Meters: max distance to search for a road segment per waypoint (ORS `radiuses`). */
const SNAP_RETRY_RADIUS_M = 2500

function parseDirectionsGeoJson(
  data: OrsDirectionsGeoJson,
): { summary: RouteSummary; lineLonLat: LonLat[] } {
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

/**
 * Snap waypoints to the drivable graph. ORS accepts `radiuses` (meters per point);
 * `-1` means no per-point limit (see ORS directions API).
 * On failure, retry with a wider snap radius so off-road picks still find a route.
 */
export async function fetchDrivingRoute(
  coordinates: LonLat[],
  apiKey: string,
): Promise<{ summary: RouteSummary; lineLonLat: LonLat[] }> {
  if (coordinates.length < 2) {
    throw new Error('Need at least two points')
  }

  const n = coordinates.length
  const radiusWide = Array.from({ length: n }, () => SNAP_RETRY_RADIUS_M)
  const radiusUnlimited = Array.from({ length: n }, () => -1)

  const attempts: Record<string, unknown>[] = [
    { coordinates },
    { coordinates, radiuses: radiusWide },
    { coordinates, radiuses: radiusUnlimited },
  ]

  let lastStatus = 0
  let lastBody = ''

  for (const body of attempts) {
    const res = await fetch(`${ORS_BASE}/driving-car/geojson`, {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const text = await res.text()

    if (!res.ok) {
      lastStatus = res.status
      lastBody = text
      continue
    }

    let data: OrsDirectionsGeoJson
    try {
      data = JSON.parse(text) as OrsDirectionsGeoJson
    } catch {
      lastStatus = res.status
      lastBody = text.slice(0, 200)
      continue
    }

    try {
      return parseDirectionsGeoJson(data)
    } catch {
      lastStatus = res.status
      lastBody = text.slice(0, 200)
      continue
    }
  }

  throw new Error(
    `ORS ${lastStatus}: ${lastBody.slice(0, 200)}`,
  )
}

export function metersToKm(m: number): number {
  return m / 1000
}
