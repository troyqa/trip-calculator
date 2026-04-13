import type { LonLat } from './orsDirections'

/** Pelias / ORS geocode feature properties (subset). */
type OrsGeocodeProperties = {
  label?: string
  name?: string
  locality?: string
  region?: string
  macroregion?: string
  county?: string
  country?: string
  layer?: string
  /** OSM / OA address fields (Pelias). */
  street?: string
  housenumber?: string
}

type OrsGeocodeResponse = {
  features?: Array<{
    geometry?: {
      coordinates?: [number, number]
    }
    properties?: OrsGeocodeProperties
  }>
}

const ORS_GEOCODE = 'https://api.openrouteservice.org/geocode/search'

/** Bias toward central Ukraine (same idea as map default). */
const UA_FOCUS_LAT = 48.5
const UA_FOCUS_LON = 31.0

const RESULT_SIZE_DEFAULT = 10
const RESULT_SIZE_ADDRESS = 18

export type GeocodeHit = {
  label: string
  lonLat: LonLat
  /** Pelias layer, e.g. `address`, `locality` — used for ranking only. */
  layer?: string
}

/** Heuristic: user is likely typing a street address (house number / street words). */
export function looksLikeAddressQuery(text: string): boolean {
  const q = text.trim()
  if (/\d/.test(q)) return true
  return /вул|вуз|просп|бул|пров|пл\.|площ|буд\.|будинок|набереж|шосе|провул|узвіз|майдан|пр-т|str\.|st\.|street|avenue|ave\.|boulevard|road|lane|drive|sq\.|square/i.test(
    q,
  )
}

/** Strip Pelias label segments like ", MY, " (bad short codes) before "Україна" / "Ukraine". */
function sanitizePeliasLabelUa(label: string): string {
  return label
    .replace(/,\s*[A-Z]{2}\s*,\s*(?=Україна\b|Ukraine\b)/i, ', ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/**
 * Build a readable label without Pelias `region_a`-style noise (e.g. "MY").
 * Prefer full region / macroregion / county + country from properties.
 */
function buildGeocodeLabel(props: OrsGeocodeProperties): string {
  const country = props.country?.trim()
  const region = (
    props.region ??
    props.macroregion ??
    props.county
  )?.trim()
  const locality = props.locality?.trim()
  const name = props.name?.trim()
  const layer = props.layer
  const street = props.street?.trim()
  const hn = props.housenumber?.trim()

  if (layer === 'address') {
    const streetLine =
      name ||
      [street, hn].filter(Boolean).join(', ') ||
      [hn, street].filter(Boolean).join(' ')
    if (streetLine) {
      const parts: string[] = [streetLine]
      if (locality && !streetLine.toLowerCase().includes(locality.toLowerCase())) {
        parts.push(locality)
      } else if (
        region &&
        !streetLine.toLowerCase().includes(region.toLowerCase())
      ) {
        parts.push(region)
      }
      if (country) parts.push(country)
      return parts.join(', ')
    }
  }

  const place = locality ?? name ?? ''
  if (place || region || country) {
    const parts: string[] = []
    if (place) parts.push(place)
    if (
      region &&
      region.toLowerCase() !== place.toLowerCase() &&
      !place.toLowerCase().includes(region.toLowerCase())
    ) {
      parts.push(region)
    }
    if (country) parts.push(country)
    if (parts.length > 0) return parts.join(', ')
  }

  if (props.label) return sanitizePeliasLabelUa(props.label)
  return name ?? locality ?? ''
}

/** BCP 47 / ISO 639-1; Pelias prefers labels in this language when available. */
export type GeocodeUiLang = 'uk' | 'en'

export async function searchUkraine(
  text: string,
  apiKey: string,
  uiLang: GeocodeUiLang = 'uk',
): Promise<GeocodeHit[]> {
  const q = text.trim()
  if (q.length < 2) return []

  const addressLike = looksLikeAddressQuery(q)
  const size = addressLike ? RESULT_SIZE_ADDRESS : RESULT_SIZE_DEFAULT

  const url = new URL(ORS_GEOCODE)
  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('text', q)
  url.searchParams.set('boundary.country', 'UA')
  url.searchParams.set('size', String(size))
  url.searchParams.set('lang', uiLang === 'uk' ? 'uk' : 'en')
  url.searchParams.set('focus.point.lat', String(UA_FOCUS_LAT))
  url.searchParams.set('focus.point.lon', String(UA_FOCUS_LON))

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
    const props = f.properties ?? {}
    const label =
      buildGeocodeLabel(props) ||
      props.label ||
      props.name ||
      `${c[1].toFixed(4)}, ${c[0].toFixed(4)}`
    out.push({
      label,
      lonLat: [c[0], c[1]],
      layer: props.layer,
    })
  }

  if (addressLike && out.length > 1) {
    out.sort((a, b) => {
      const aw = a.layer === 'address' ? 0 : 1
      const bw = b.layer === 'address' ? 0 : 1
      return aw - bw
    })
  }

  return out
}
