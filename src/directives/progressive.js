// Vue-директива v-progressive: спочатку показує стиснений плейсхолдер (розмитий),
// паралельно довантажує повну якість і м'яко підмінює, коли вона готова.
//
// Використання:
//   <img v-progressive="image" />                       // дефолтні опції
//   <img v-progressive="{ src: image, width: 600, height: 400, quality: 75 }" />
//
// CSS-класи pi-blur / pi-sharp описані у global style.scss.

import { imagePair } from '@/utils/image'

function normalize(value) {
  if (value && typeof value === 'object') {
    const { src, ...opts } = value
    return { src, opts }
  }
  return { src: value, opts: {} }
}

function apply(el, value) {
  const { src, opts } = normalize(value)
  const { low, high } = imagePair(src, opts)

  if (!high) {
    el.removeAttribute('src')
    return
  }

  // Немає окремого плейсхолдера (локальні/зовнішні файли) — вантажимо напряму.
  if (!low || low === high) {
    el.classList.remove('pi-blur')
    el.src = high
    return
  }

  // 1) Миттєво показуємо стиснений розмитий плейсхолдер.
  el.classList.add('pi-blur')
  el.classList.remove('pi-sharp')
  el.src = low

  // 2) Догружаємо повну якість у фоні та підмінюємо.
  const full = new Image()
  full.onload = () => {
    el.src = high
    el.classList.remove('pi-blur')
    el.classList.add('pi-sharp')
  }
  full.onerror = () => {
    el.classList.remove('pi-blur')
  }
  full.src = high
}

export default {
  bind(el, binding) {
    apply(el, binding.value)
  },
  update(el, binding) {
    if (JSON.stringify(binding.value) !== JSON.stringify(binding.oldValue)) {
      apply(el, binding.value)
    }
  },
}
