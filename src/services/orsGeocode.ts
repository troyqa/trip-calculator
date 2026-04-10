import type { LonLat } from './orsDirections'

type OrsGeocodeResponse = {
  features?: Array<{
    geometry?: {
      coordinates?: [number, number]
    }
    properties?: {
      label?: string
      name?: string
    }
  }>
}

const ORS_GEOCODE = 'https://api.openrouteservice.org/geocode/search'

export type GeocodeHit = {
  label: string
  lonLat: LonLat
}

export async function searchUkraine(
  text: string,
  apiKey: string,
): Promise<GeocodeHit[]> {
  const q = text.trim()
  if (q.length < 2) return []

  const url = new URL(ORS_GEOCODE)
  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('text', q)
  url.searchParams.set('boundary.country', 'UA')
  url.searchParams.set('size', '8')

  const res = await fetch(url.toString())
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Geocode ${res.status}: ${errText.slice(0, 160)}`)
  }

  const data = (await res.json()) as OrsGeocodeResponse
  const out: GeocodeHit[] = []
  for (const f of data.features ?? []) {
    const c = f.geometry?.coordinates
    if (!c || typeof c[0] !== 'number' || typeof c[1] !== 'number') continue
    const label =
      f.properties?.label ??
      f.properties?.name ??
      `${c[1].toFixed(4)}, ${c[0].toFixed(4)}`
    out.push({ label, lonLat: [c[0], c[1]] })
  }
  return out
}
