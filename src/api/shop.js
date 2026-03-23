import axios from 'axios'

const PRODUCTS_URL = '/products.json'

const CACHE_KEY = 'ee_products_cache'
const CACHE_TTL = 5 * 60 * 1000 // 5 хвилин

function getCachedProducts() {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY)
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < CACHE_TTL) return data
    }
  } catch (e) {
    // ignore
  }
  return null
}

function setCachedProducts(data) {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data, timestamp: Date.now() })
    )
  } catch (e) {
    // ignore
  }
}

function transformProduct(p) {
  return {
    id: p.id,
    title: p.title,
    price: p.price,
    inventory: 9999,
    images: p.images || [],
    description: p.description || { ua: '', en: '' },
    options: p.options || [],
    configurator: (p.options || []).map(o => o.price),
    checked: (p.options || []).map(() => false),
    checkList: [],
  }
}

export default {
  async getProducts(cb) {
    const cached = getCachedProducts()
    if (cached) {
      cb(cached.map(transformProduct))
      return
    }

    try {
      const res = await axios.get(PRODUCTS_URL + '?t=' + Date.now())
      const products = res.data || []
      setCachedProducts(products)
      cb(products.map(transformProduct))
    } catch (e) {
      cb([])
    }
  },

  async getDefaultProducts(cb) {
    this.getProducts(cb)
  },

  buyProducts(products, cb) {
    cb()
  },
}
