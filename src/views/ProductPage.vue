<template>
  <div>
    <el-row :gutter="10">
      <el-col
        :xs="{ span: 24, offset: 0 }"
        :sm="{ span: 16, offset: 4 }"
        :md="{ span: 10, offset: 2 }"
      >
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/shop' }">
            {{ $t('menu.shop') }}
          </el-breadcrumb-item>
          <el-breadcrumb-item>{{ getTitle(product) }}</el-breadcrumb-item>
        </el-breadcrumb>
      </el-col>
    </el-row>
    <ShoppingCart />
    <el-row :gutter="10">
      <el-col
        :xs="{ span: 24, offset: 0 }"
        :sm="{ span: 16, offset: 4 }"
        :md="{ span: 10, offset: 2 }"
      >
        <el-row>
          <el-carousel
            ref="carousel"
            :autoplay="false"
            trigger="click"
            indicator-position="none"
            :arrow="product.images.length <= 1 ? `never` : `hover`"
          >
            <el-carousel-item
              v-for="image in product.images"
              :key="image"
              :name="image"
            >
              <img
                :src="getImageSrc(image)"
                class="image"
                style="cursor: pointer"
                @click="openLightbox(image)"
              />
            </el-carousel-item>
          </el-carousel>
        </el-row>
        <el-row
          v-show="product.images.length <= 1 ? false : true"
          class="suggested-image"
        >
          <div v-for="image in product.images"
class="image" :key="image">
            <img
              :src="getImageSrc(image)"
              @click="setActiveItem(image)"
            >
          </div>
        </el-row>

      </el-col>
      <el-col
        :xs="{ span: 24, offset: 0 }"
        :sm="{ span: 16, offset: 4 }"
        :md="{ span: 10, offset: 0 }"
      >
        <h2>{{ getTitle(product) }}</h2>
        <el-divider />
        <h1>${{ SummaryPrice }}</h1>
        <el-checkbox-group
          v-if="product.options && product.options.length > 0"
          v-model="product.checkList"
        >
          <el-checkbox
            v-for="(option, index) in product.options"
            :key="index"
            v-model="product.checked[index]"
            :label="String(index)"
          >
            {{ getOptionName(option) }} + ${{ option.price }}
          </el-checkbox>
        </el-checkbox-group>
        <p />
        <el-button
          class="btn-add-to-cart"
          :disabled="!product.inventory"
          @click="addThisProductToCart(product)"
        >
          {{ $t('shop.product.addToCart') }}
        </el-button>

        <div class="description">
          <el-divider content-position="left">
            {{ $t('shop.product.description') }}
          </el-divider>
          <p v-html="getDescription(product)" />

          <div v-if="product.id === 1" class="product-actions">
            <a
              href="/docs/Leaf_ecu_manual.pdf"
              target="_blank"
              class="btn-product-action"
            >
              <i class="el-icon-document" /> {{ $t('shop.product.documentation') }}
            </a>
            <a
              href="https://diag.electricengines.com.ua/"
              target="_blank"
              class="btn-product-action"
            >
              <i class="el-icon-setting" /> {{ $t('shop.product.configurator') }}
            </a>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

import ShoppingCart from '../components/ShoppingCart.vue'

const Products = namespace('products')
const Cart = namespace('cart')

@Component({
  name: 'ProductPage',
  components: {
    ShoppingCart,
  },
})
export default class ProductPage extends Vue {
  lightboxVisible = false
  lightboxImage = ''
  lightboxIndex = 0

  @Products.Getter getById: any
  @Products.Getter getShopSize: any
  @Products.Getter getConfigCombinations: any
  @Products.Getter getConfigIds: any
  @Products.Action getAllProducts: any
  @Products.Action addNewProduct: any
  @Products.Action addNewConfigCombinations: any
  @Products.Action addNewConfigIds: any
  @Cart.Action addProductToCart: any
  get myCarousel(): any {
    return this.$refs.carousel
  }

  get product() {
    return this.getById(this.$route.params.id)
  }

  get configCombinations() {
    return this.getConfigCombinations()
  }

  get configIds() {
    return this.getConfigIds()
  }

  get shopSize() {
    return this.getShopSize()
  }

  get config() {
    let str = ''
    for (let i = 0; i < this.product.checkList.length; i++) {
      const element = this.product.checkList[i]
      str += element
    }
    return str
  }

  get SummaryPrice() {
    let sum = 0
    for (let i = 0; i < this.product.checkList.length; i++) {
      const element = this.product.checkList[i]
      sum += this.product.configurator[element]
    }
    return this.product.price + sum
  }

  created() {
    this.getAllProducts()
  }

  getTitle(product) {
    if (typeof product.title === 'object') {
      return product.title[this.$i18n.locale] || product.title.ua || product.title.en || ''
    }
    return product.title
  }

  getDescription(product) {
    if (product.description && typeof product.description === 'object') {
      return product.description[this.$i18n.locale] || product.description.ua || product.description.en || ''
    }
    return product.description || ''
  }

  getOptionName(option) {
    if (option.name && typeof option.name === 'object') {
      return option.name[this.$i18n.locale] || option.name.ua || option.name.en || ''
    }
    return option.name || ''
  }

  getImageSrc(image) {
    if (!image) return ''
    if (image.startsWith('http') || image.startsWith('/')) {
      return image
    }
    try {
      return require(`@/assets/img/${image}`)
    } catch (e) {
      return ''
    }
  }

  setActiveItem(index) {
    this.myCarousel.setActiveItem(index)
  }

  lightboxEl: any = null

  openLightbox(image) {
    this.lightboxIndex = this.product.images.indexOf(image)
    this.lightboxVisible = true
    document.body.style.overflow = 'hidden'
    this.renderLightbox()
  }

  closeLightbox() {
    this.lightboxVisible = false
    document.body.style.overflow = ''
    if (this.lightboxEl) {
      document.body.removeChild(this.lightboxEl)
      this.lightboxEl = null
    }
  }

  lightboxPrev() {
    this.lightboxIndex = (this.lightboxIndex - 1 + this.product.images.length) % this.product.images.length
    this.renderLightbox()
  }

  lightboxNext() {
    this.lightboxIndex = (this.lightboxIndex + 1) % this.product.images.length
    this.renderLightbox()
  }

  renderLightbox() {
    if (this.lightboxEl) document.body.removeChild(this.lightboxEl)

    const el = document.createElement('div')
    el.className = 'lightbox'
    el.onclick = () => this.closeLightbox()

    const img = document.createElement('img')
    img.src = this.getImageSrc(this.product.images[this.lightboxIndex])
    img.onclick = (e) => e.stopPropagation()
    el.appendChild(img)

    if (this.product.images.length > 1) {
      const prev = document.createElement('button')
      prev.className = 'lightbox-prev'
      prev.innerHTML = '&#8249;'
      prev.onclick = (e) => { e.stopPropagation(); this.lightboxPrev() }
      el.appendChild(prev)

      const next = document.createElement('button')
      next.className = 'lightbox-next'
      next.innerHTML = '&#8250;'
      next.onclick = (e) => { e.stopPropagation(); this.lightboxNext() }
      el.appendChild(next)
    }

    const close = document.createElement('button')
    close.className = 'lightbox-close'
    close.innerHTML = '&times;'
    close.onclick = () => this.closeLightbox()
    el.appendChild(close)

    document.body.appendChild(el)
    this.lightboxEl = el
  }

  beforeDestroy() {
    if (this.lightboxEl) {
      document.body.removeChild(this.lightboxEl)
      this.lightboxEl = null
    }
    document.body.style.overflow = ''
  }

  contains(arr, arr2) {
    if (arr.length != arr2.length) {
      return false
    }
    let on = 0
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr2.length; j++) {
        if (arr[i] === arr2[j]) {
          on++
          break
        }
      }
    }
    return on == arr.length ? true : false
  }

  addThisProductToCart(product) {
    if (product.checkList.length > 0) {
      let doWeHaveConfig = false
      for (let i = 0; i < this.configCombinations.length; i++) {
        if (this.contains(this.configCombinations[i], this.config)) {
          this.addProductToCart(this.getById(this.configIds[i]))
          doWeHaveConfig = true
          break
        }
      }

      if (!doWeHaveConfig) {
        const newProduct = {
          id: this.shopSize + 1,
          title: this.getTitle(product),
          price: product.price,
          inventory: product.inventory,
          images: product.images,
          configurator: product.configurator,
          checked: product.checked,
          checkList: product.checkList,
          totalPrice: this.SummaryPrice,
        }
        this.addNewConfigCombinations(this.config)
        this.addNewConfigIds(this.shopSize + 1)
        this.addNewProduct(newProduct)
        this.addProductToCart(newProduct)
      }
    } else {
      this.addProductToCart(product)
    }

    // Тост
    ;(this as any).$notify({
      title: this.getTitle(product),
      message: String(this.$t('shop.addedToCart')),
      type: 'success',
      offset: 160,
      duration: 2500,
    })

    // Короткочасна зелена підсвітка кнопки
    const btn = this.$el.querySelector('.btn-add-to-cart')
    if (btn) {
      btn.classList.add('btn-flash')
      setTimeout(() => { btn.classList.remove('btn-flash'); (btn as HTMLElement).blur() }, 400)
    }
  }
}
</script>

<style lang="scss" scoped>
.el-carousel {
  .el-carousel-item {
    position: relative;
  }

  .image {
    max-height: 100%;
    max-width: 100%;
    width: auto;
    height: auto;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    padding: 0 20px;
    box-sizing: border-box;
  }
}

.suggested-image {
  padding: 13px 20px;
  width: 100%;
  display: table;
  .image {
    vertical-align: middle;
    display: table-cell;
    padding: 0 10px;
    img {
      min-width: 40px;
      width: 100%;
      max-width: 120px;
      display: block;
      margin-left: auto;
      margin-right: auto;
      cursor: pointer;
    }
  }
}

.description {
  margin-top: 60px;
  white-space: pre-line;
  color: #555;
  font-size: 15px;
  line-height: 1.6;
}

.product-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.btn-product-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background-color: #f8f8f8;
  color: #333;
  border: 2px solid #e0e0e0;
  border-bottom: 3px solid #00ddc0;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Roboto', sans-serif;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.25s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  &:hover {
    background-color: #eee;
    border-color: #ccc;
    border-bottom-color: #00ddc0;
    color: #333;
  }
  &:active {
    background-color: #00ddc0;
    border-color: #00ddc0;
  }
  i {
    font-size: 16px;
  }
}

.el-checkbox {
  display: block;
  ::v-deep .el-checkbox__label {
    font-weight: 400;
  }
}



</style>
<style lang="scss">
.lightbox {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: rgba(0, 0, 0, 0.8) !important;
  backdrop-filter: blur(4px);
  z-index: 99999 !important;
  display: flex !important;
  align-items: center;
  justify-content: center;

  img {
    max-width: 90vw;
    max-height: 90vh;
    object-fit: contain;
    user-select: none;
  }
}

.lightbox-close {
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  color: #fff;
  font-size: 36px;
  cursor: pointer;
  line-height: 1;
  z-index: 100000;
  &:hover { color: #00ddc0; }
}

.lightbox-prev,
.lightbox-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  font-size: 32px;
  padding: 15px 14px;
  cursor: pointer;
  border-radius: 4px;
  z-index: 100000;
  &:hover { background: rgba(0, 221, 192, 0.3); }
}

.lightbox-prev { left: 15px; }
.lightbox-next { right: 15px; }
</style>
