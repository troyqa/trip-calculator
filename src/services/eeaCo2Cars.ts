/**
 * Bundled **major** EU models (EEA): one row per make + commercial name, no years.
 * @see scripts/generate-eea-co2-bundle.mjs
 */

export type EeaCo2Row = {
  /** Stable hash id (hex) from make + model */
  ID: string
  Mk: string
  Cn: string
  /** WLTP combined fuel consumption, L/100 km (median in source pool) */
  Fc: number
  Ft: string
}

export type EeaCo2BundleFile = {
  generatedAt: string
  table: string
  rowCount: number
  note: string
  rows: EeaCo2Row[]
  schema?: string
  stats?: { rawRows?: number; topMajorPairs?: number; minOccurrences?: number }
}

export type EeaMenuItem = { text: string; value: string }

export type EeaCascadeIndex = {
  rowsById: Map<string, EeaCo2Row>
  listMakes: () => EeaMenuItem[]
  listModels: (make: string) => EeaMenuItem[]
}

function distinctSorted(values: Iterable<string>): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, 'uk'))
}

export function normalizeFuelType(ft: string): string {
  return ft.trim().toLowerCase()
}

export function formatEeaModelMenuText(r: EeaCo2Row): string {
  const fc = Number.isFinite(r.Fc) ? r.Fc.toFixed(1) : '?'
  const fuel = normalizeFuelType(r.Ft)
  return `${r.Cn} · ${fc} L/100 km · ${fuel}`
}

export function buildEeaCascadeIndex(rows: EeaCo2Row[]): EeaCascadeIndex {
  const rowsById = new Map<string, EeaCo2Row>()
  for (const r of rows) {
    rowsById.set(String(r.ID), r)
  }

  const listMakes = (): EeaMenuItem[] => {
    const mk = distinctSorted(rows.map((r) => r.Mk))
    return mk.map((m) => ({ text: m, value: m }))
  }

  const listModels = (make: string): EeaMenuItem[] => {
    if (!make) return []
    const list = rows.filter((r) => r.Mk === make)
    list.sort((a, b) => a.Cn.localeCompare(b.Cn, 'uk'))
    return list.map((r) => ({
      value: String(r.ID),
      text: formatEeaModelMenuText(r),
    }))
  }

  return { rowsById, listMakes, listModels }
}

export function parseLitersPer100FromRow(r: EeaCo2Row): number | null {
  const v = Number(r.Fc)
  if (!Number.isFinite(v) || v <= 0) return null
  return v
}
