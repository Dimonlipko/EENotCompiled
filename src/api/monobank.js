import axios from 'axios'

const SUPABASE_URL = 'https://fkmolbxcicwishbtmqbs.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrbW9sYnhjaWN3aXNoYnRtcWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNjAwNTIsImV4cCI6MjA4OTgzNjA1Mn0.akITabI14iWkHnouzcza_NzbLxDCwbkytXYqtXJiYIY'

/**
 * Get USD/UAH rate from Supabase settings (updated hourly by Google Script)
 * @returns {Promise<{rateBuy: number, rateSell: number}|null>}
 */
export async function getUsdRate() {
  try {
    const { data } = await axios.get(
      `${SUPABASE_URL}/rest/v1/settings?key=eq.usd_rate&select=value`,
      { headers: { apikey: SUPABASE_ANON_KEY } }
    )
    return (data && data[0] && data[0].value) || null
  } catch (e) {
    console.warn('Failed to fetch USD rate from Supabase:', e.message)
    return null
  }
}
