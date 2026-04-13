import type { LonLat } from '../services/orsDirections'
import type { GeocodeUiLang } from '../services/orsGeocode'

/** Approximate city centers (WGS84, lon/lat) — Kyiv first. */
const UA_MAJOR_CITIES: ReadonlyArray<{
  uk: string
  en: string
  lonLat: LonLat
}> = [
  {
    uk: 'Київ, Україна',
    en: 'Kyiv, Ukraine',
    lonLat: [30.5234, 50.4501],
  },
  {
    uk: 'Харків, Україна',
    en: 'Kharkiv, Ukraine',
    lonLat: [36.2304, 49.9935],
  },
  {
    uk: 'Одеса, Україна',
    en: 'Odesa, Ukraine',
    lonLat: [30.7233, 46.4825],
  },
  {
    uk: 'Дніпро, Україна',
    en: 'Dnipro, Ukraine',
    lonLat: [35.0462, 48.4647],
  },
  {
    uk: 'Львів, Україна',
    en: 'Lviv, Ukraine',
    lonLat: [24.0297, 49.8397],
  },
  {
    uk: 'Запоріжжя, Україна',
    en: 'Zaporizhzhia, Ukraine',
    lonLat: [35.1396, 47.8388],
  },
  {
    uk: 'Кривий Ріг, Україна',
    en: 'Kryvyi Rih, Ukraine',
    lonLat: [33.3918, 47.9077],
  },
  {
    uk: 'Миколаїв, Україна',
    en: 'Mykolaiv, Ukraine',
    lonLat: [32.0000, 46.9750],
  },
  {
    uk: 'Вінниця, Україна',
    en: 'Vinnytsia, Ukraine',
    lonLat: [28.4914, 49.2328],
  },
  {
    uk: 'Чернігів, Україна',
    en: 'Chernihiv, Ukraine',
    lonLat: [31.2893, 51.4982],
  },
  {
    uk: 'Полтава, Україна',
    en: 'Poltava, Ukraine',
    lonLat: [34.5514, 49.5883],
  },
  {
    uk: 'Херсон, Україна',
    en: 'Kherson, Ukraine',
    lonLat: [32.6178, 46.6354],
  },
  {
    uk: 'Черкаси, Україна',
    en: 'Cherkasy, Ukraine',
    lonLat: [32.0598, 49.4444],
  },
  {
    uk: 'Житомир, Україна',
    en: 'Zhytomyr, Ukraine',
    lonLat: [28.6587, 50.2547],
  },
  {
    uk: 'Суми, Україна',
    en: 'Sumy, Ukraine',
    lonLat: [34.8003, 50.9077],
  },
]

export type DefaultCityHit = { label: string; lonLat: LonLat }

export function getDefaultUkraineCitySuggestions(
  lang: GeocodeUiLang,
): DefaultCityHit[] {
  return UA_MAJOR_CITIES.map((c) => ({
    label: lang === 'en' ? c.en : c.uk,
    lonLat: c.lonLat,
  }))
}
