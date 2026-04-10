import { describe, expect, it } from 'vitest'
import {
  buildEeaCascadeIndex,
  formatEeaModelMenuText,
  parseLitersPer100FromRow,
} from './eeaCo2Cars'

const sampleRows = [
  { ID: 'id1', Mk: 'SKODA', Cn: 'OCTAVIA', Fc: 5.4, Ft: 'petrol' },
  { ID: 'id2', Mk: 'SKODA', Cn: 'FABIA', Fc: 5.1, Ft: 'diesel' },
  { ID: 'id3', Mk: 'TOYOTA', Cn: 'COROLLA', Fc: 4.2, Ft: 'PETROL' },
]

describe('buildEeaCascadeIndex', () => {
  it('lists makes and models; model value is row ID', () => {
    const idx = buildEeaCascadeIndex(sampleRows)

    const makes = idx.listMakes()
    expect(makes.map((m) => m.value).sort()).toEqual(['SKODA', 'TOYOTA'])

    const skoda = idx.listModels('SKODA')
    expect(skoda.map((m) => m.value).sort()).toEqual(['id1', 'id2'])
    expect(idx.rowsById.get('id1')?.Fc).toBe(5.4)
  })
})

describe('parseLitersPer100FromRow', () => {
  it('returns null for non-positive Fc', () => {
    expect(parseLitersPer100FromRow({ ...sampleRows[0], Fc: 0 })).toBeNull()
  })
})

describe('formatEeaModelMenuText', () => {
  it('includes consumption and fuel', () => {
    const s = formatEeaModelMenuText(sampleRows[0])
    expect(s).toContain('OCTAVIA')
    expect(s).toContain('5.4')
    expect(s).toContain('petrol')
  })
})
