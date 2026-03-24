import axios from 'axios'

const MONO_API = 'https://api.monobank.ua'

/**
 * Get current USD/UAH buy rate from Monobank
 * Currency codes: 840 = USD, 980 = UAH
 * @returns {Promise<{rateBuy: number, rateSell: number, date: number}|null>}
 */
export async function getUsdRate() {
  try {
    const { data } = await axios.get(`${MONO_API}/bank/currency`)
    const usd = (data || []).find(
      c => c.currencyCodeA === 840 && c.currencyCodeB === 980
    )
    return usd || null
  } catch (e) {
    console.error('Monobank getUsdRate error:', e)
    return null
  }
}
