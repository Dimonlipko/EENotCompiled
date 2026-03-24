import axios from 'axios'

const NP_API = 'https://api.novaposhta.ua/v2.0/json/'

// Nova Poshta public API (no key required for address search)
const NP_KEY = '' // optional — works without key for basic search

let cityCache = {}
let warehouseCache = {}

/**
 * Search cities by name (Ukrainian)
 * @param {string} query - city name (min 2 chars)
 * @returns {Promise<Array<{ref: string, name: string, area: string}>>}
 */
export async function searchCities(query) {
  if (!query || query.length < 2) return []

  const cacheKey = query.toLowerCase()
  if (cityCache[cacheKey]) return cityCache[cacheKey]

  try {
    const { data } = await axios.post(NP_API, {
      apiKey: NP_KEY,
      modelName: 'Address',
      calledMethod: 'searchSettlements',
      methodProperties: {
        CityName: query,
        Limit: '15',
        Page: '1',
      },
    })

    if (!data.success || !data.data || !data.data[0]) return []

    const cities = data.data[0].Addresses.map(c => ({
      ref: c.DeliveryCity,
      name: c.Present,
      area: c.Area || '',
    }))

    cityCache[cacheKey] = cities
    return cities
  } catch (e) {
    console.error('NovaPoshta searchCities error:', e)
    return []
  }
}

/**
 * Get warehouses by city ref
 * @param {string} cityRef - city reference from searchCities
 * @param {string} [search] - optional filter by warehouse name/number
 * @returns {Promise<Array<{ref: string, name: string, number: string}>>}
 */
export async function getWarehouses(cityRef, search) {
  if (!cityRef) return []

  const cacheKey = cityRef + (search || '')
  if (warehouseCache[cacheKey]) return warehouseCache[cacheKey]

  try {
    const { data } = await axios.post(NP_API, {
      apiKey: NP_KEY,
      modelName: 'Address',
      calledMethod: 'getWarehouses',
      methodProperties: {
        CityRef: cityRef,
        FindByString: search || '',
        Limit: '50',
        Page: '1',
      },
    })

    if (!data.success || !data.data) return []

    const warehouses = data.data.map(w => ({
      ref: w.Ref,
      name: w.Description,
      number: w.Number,
      shortAddress: w.ShortAddress,
    }))

    warehouseCache[cacheKey] = warehouses
    return warehouses
  } catch (e) {
    console.error('NovaPoshta getWarehouses error:', e)
    return []
  }
}

/**
 * Clear caches
 */
export function clearCache() {
  cityCache = {}
  warehouseCache = {}
}
