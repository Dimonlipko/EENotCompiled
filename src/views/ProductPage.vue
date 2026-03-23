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
:src="getImageSrc(image)" class="image" />
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
          type="text"
          class="button"
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
}

.el-checkbox {
  display: block;
}
</style>
