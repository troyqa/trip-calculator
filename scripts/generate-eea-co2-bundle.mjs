/**
 * Builds a small bundle of **major** passenger car models (EU EEA): one row per (Mk, Cn),
 * median WLTP combined consumption (L/100 km), dominant fuel type. **No model years** in output.
 *
 * Pipeline: fetch a raw pool across several calendar years → count (Mk, Cn) frequency →
 * keep top N pairs → aggregate Fc (median) and Ft (mode).
 *
 * @see https://discodata.eea.europa.eu/Help.html
 */
import { createHash } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '../src/data/eeaCo2Cars.bundle.json')

const TABLE = '[co2emission].[latest].[co2cars_2023Pv27]'

/** Raw rows from Discodata (larger pool → better frequency ranking for “major” models). */
const RAW_LIMIT = 15000

/** How many (make, model) pairs to keep — “major” by occurrence in the raw pool. */
const TOP_MAJOR_PAIRS = 180

/** Drop rare pairs (noise); set 1 to disable. */
const MIN_OCCURRENCES = 4

function stableId(mk, cn) {
  return createHash('sha256').update(`${mk}\n${cn}`, 'utf8').digest('hex').slice(0, 16)
}

function median(nums) {
  if (nums.length === 0) return NaN
  const a = [...nums].sort((x, y) => x - y)
  const mid = Math.floor(a.length / 2)
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2
}

function modeLower(strs) {
  const m = new Map()
  for (const s of strs) {
    const k = String(s).trim().toLowerCase()
    if (!k) continue
    m.set(k, (m.get(k) ?? 0) + 1)
  }
  let best = 'petrol'
  let n = 0
  for (const [k, v] of m) {
    if (v > n) {
      n = v
      best = k
    }
  }
  return best
}

async function fetchDiscodata(sql, nr) {
  const url = `https://discodata.eea.europa.eu/sql?query=${encodeURIComponent(sql)}&p=1&nrOfHits=${nr}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Discodata HTTP ${res.status}`)
  const json = await res.json()
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.error).join('; '))
  }
  return json.results ?? []
}

const sql = `
SELECT TOP ${RAW_LIMIT}
  ID, Mk, Cn, Fc, Ft
FROM ${TABLE}
WHERE Fc IS NOT NULL
  AND Year >= 2020
  AND Ft IN ('petrol', 'diesel')
ORDER BY ID DESC
`.replace(/\s+/g, ' ').trim()

const raw = await fetchDiscodata(sql, RAW_LIMIT)

/** @type {Map<string, { mk: string, cn: string, fcs: number[], fts: string[] }>} */
const groups = new Map()
for (const r of raw) {
  const mk = String(r.Mk ?? '').trim()
  const cn = String(r.Cn ?? '').trim()
  if (!mk || !cn) continue
  const fc = Number(r.Fc)
  if (!Number.isFinite(fc) || fc <= 0) continue
  const key = `${mk}\u0000${cn}`
  let g = groups.get(key)
  if (!g) {
    g = { mk, cn, fcs: [], fts: [] }
    groups.set(key, g)
  }
  g.fcs.push(fc)
  g.fts.push(String(r.Ft ?? ''))
}

const ranked = [...groups.values()]
  .filter((g) => g.fcs.length >= MIN_OCCURRENCES)
  .sort((a, b) => b.fcs.length - a.fcs.length)
  .slice(0, TOP_MAJOR_PAIRS)

const rows = ranked.map((g) => {
  const Fc = Math.round(median(g.fcs) * 10) / 10
  const Ft = modeLower(g.fts)
  return {
    ID: stableId(g.mk, g.cn),
    Mk: g.mk,
    Cn: g.cn,
    Fc,
    Ft,
  }
})

if (rows.length === 0) {
  throw new Error('No aggregated rows (check Discodata / filters)')
}

const payload = {
  generatedAt: new Date().toISOString(),
  table: TABLE,
  schema: 'eea-major-models-v1',
  rowCount: rows.length,
  stats: {
    rawRows: raw.length,
    rawLimit: RAW_LIMIT,
    topMajorPairs: TOP_MAJOR_PAIRS,
    minOccurrences: MIN_OCCURRENCES,
  },
  note:
    'One row per (Mk, Cn): median WLTP Fc (L/100 km) and dominant fuel in a raw EEA sample. No years; “major” = most frequent nameplates in the pool.',
  rows,
}

writeFileSync(OUT, `${JSON.stringify(payload)}\n`, 'utf8')
console.log(`Wrote ${rows.length} major models (from ${raw.length} raw rows) to ${OUT}`)
