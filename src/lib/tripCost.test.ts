import { describe, expect, it } from 'vitest'
import {
  computeTripCostUah,
  isPositiveFinite,
  parseOptionalPositiveNumber,
  resolvePerPersonUah,
} from './tripCost'

describe('computeTripCostUah', () => {
  it('computes fuel cost for 100 km at 8 l/100km and 50 UAH/l', () => {
    expect(computeTripCostUah(100, 8, 50)).toBe(400)
  })

  it('handles fractional distance', () => {
    expect(computeTripCostUah(50, 10, 52)).toBe(260)
  })
})

describe('resolvePerPersonUah', () => {
  it('returns none for empty input', () => {
    expect(resolvePerPersonUah(100, '')).toEqual({ kind: 'none' })
  })

  it('returns none for 1 person', () => {
    expect(resolvePerPersonUah(100, '1')).toEqual({ kind: 'none' })
  })

  it('splits for 2+ people', () => {
    expect(resolvePerPersonUah(100, '4')).toEqual({
      kind: 'split',
      amountUah: 25,
    })
  })

  it('rejects invalid people count', () => {
    expect(resolvePerPersonUah(100, '0')).toEqual({
      kind: 'error',
      code: 'invalid_people',
    })
    expect(resolvePerPersonUah(100, '2.5')).toEqual({
      kind: 'error',
      code: 'invalid_people',
    })
  })
})

describe('parseOptionalPositiveNumber', () => {
  it('parses comma decimal', () => {
    expect(parseOptionalPositiveNumber('8,5')).toBe(8.5)
  })

  it('returns null for empty', () => {
    expect(parseOptionalPositiveNumber('')).toBeNull()
  })
})

describe('isPositiveFinite', () => {
  it('accepts positive numbers', () => {
    expect(isPositiveFinite(1)).toBe(true)
  })

  it('rejects non-positive', () => {
    expect(isPositiveFinite(0)).toBe(false)
    expect(isPositiveFinite(-1)).toBe(false)
  })
})
