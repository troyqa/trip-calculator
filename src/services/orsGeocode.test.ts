import { describe, expect, it } from 'vitest'
import { looksLikeAddressQuery } from './orsGeocode'

describe('looksLikeAddressQuery', () => {
  it('detects house numbers', () => {
    expect(looksLikeAddressQuery('вул. Хрещатик 1, Київ')).toBe(true)
    expect(looksLikeAddressQuery('Київ 42')).toBe(true)
  })

  it('detects street keywords without digits', () => {
    expect(looksLikeAddressQuery('вулиця Соборна')).toBe(true)
    expect(looksLikeAddressQuery('проспект Перемоги')).toBe(true)
  })

  it('does not flag plain city names', () => {
    expect(looksLikeAddressQuery('Кременчук')).toBe(false)
    expect(looksLikeAddressQuery('Львів')).toBe(false)
  })
})
