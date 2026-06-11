// Хелпери для зображень: побудова Supabase image-transform URL та LQIP-пар
// (low quality placeholder + повна якість) для прогресивного завантаження.

function resolveLocal(image) {
  try {
    return require(`@/assets/img/${image}`)
  } catch (e) {
    return ''
  }
}

const SUPABASE_PUBLIC = 'supabase.co/storage/v1/object/public/'

function isSupabase(image) {
  return typeof image === 'string' && image.includes(SUPABASE_PUBLIC)
}

// Будує URL до Supabase render/image endpoint з трансформаціями.
function buildSupabaseSrc(image, { width, height, quality, resize = 'contain' }) {
  const base = image.replace('/object/public/', '/render/image/public/')
  const params = []
  if (width) params.push(`width=${width}`)
  if (height) params.push(`height=${height}`)
  if (resize) params.push(`resize=${resize}`)
  if (quality) params.push(`quality=${quality}`)
  return params.length ? `${base}?${params.join('&')}` : base
}

// Повертає { low, high }: low — маленька стиснута версія (плейсхолдер),
// high — версія потрібної якості. Для не-Supabase джерел low === '' (одразу high).
export function imagePair(
  image,
  { width, height, quality = 75, lowWidth = 32, lowQuality = 20 } = {}
) {
  if (!image) return { low: '', high: '' }

  if (isSupabase(image)) {
    return {
      low: buildSupabaseSrc(image, { width: lowWidth, quality: lowQuality, resize: 'contain' }),
      high: buildSupabaseSrc(image, { width, height, quality, resize: 'contain' }),
    }
  }

  if (image.startsWith('http') || image.startsWith('/')) {
    return { low: '', high: image }
  }

  return { low: '', high: resolveLocal(image) }
}
