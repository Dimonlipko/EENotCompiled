<template>
  <el-row
type="flex" justify="center"
>
    <el-col
v-for="product in products" :key="product.id"
>
      <el-card :body-style="{ padding: '0px' }">
        <div
class="img-wrapper" @click="viewMore(product.id, product)"
>
          <el-carousel
            :autoplay="false"
            trigger="click"
            :arrow="product.images.length <= 1 ? `never` : `hover`"
            :indicator-position="product.images.length <= 1 ? 'none' : ''"
          >
            <el-carousel-item
v-for="image in product.images" :key="image"
>
              <img
:src="getImageSrc(image)" class="image" />
            </el-carousel-item>
          </el-carousel>
        </div>
        <div class="item-main">
          <div>
            <span>{{ getTitle(product) }}</span>
          </div>
          <div class="price">
            <span>$ {{ product.price }}</span>
          </div>
          <div class="button-wrapper">
            <el-button
              class="btn-add-to-cart"
              :disabled="!product.inventory"
              @click="handleAddToCart(product)"
            >
              {{ $t('shop.addToCart') }}
            </el-button>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import { mapActions, mapState } from 'vuex'
export default {
  computed: mapState({
    products: state => state.products.defaultProducts,
  }),
  created: function() {
    this.$store.dispatch('products/getAllDefaultProducts')
    this.$store.dispatch('products/getAllProducts')
  },
  data() {
    return {
      addedProducts: {},
    }
  },
  methods: {
    ...mapActions('cart', ['addProductToCart']),

    handleAddToCart(product) {
      this.addProductToCart(product)
      this.$notify({
        title: this.getTitle(product),
        message: this.$t('shop.addedToCart'),
        type: 'success',
        offset: 80,
        duration: 2500,
      })
    },

    getTitle(product) {
      if (typeof product.title === 'object') {
        return product.title[this.$i18n.locale] || product.title.ua || product.title.en || ''
      }
      return product.title
    },

    getImageSrc(image) {
      if (!image) return ''
      if (image.includes('supabase.co/storage/v1/object/public/')) {
        return image.replace('/object/public/', '/render/image/public/') + '?width=600&height=400&resize=contain&quality=75'
      }
      if (image.startsWith('http') || image.startsWith('/')) {
        return image
      }
      try {
        return require(`@/assets/img/${image}`)
      } catch (e) {
        return ''
      }
    },

    viewMore: function(id, product) {
      this.$router.push({
        name: 'Product',
        params: { id, product },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.el-row {
  flex-wrap: wrap;
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}
.el-col {
  border-radius: 4px;
  flex: 0 0 26%;
  margin: 10px;
  min-width: 15em;
}
.item-main {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  justify-content: space-between;
  padding: 14px;
  .price {
    padding: 0px 10px;
    white-space: pre;
  }
  .button-wrapper {
    padding: 0 0 0 10px;
  }
}

.button {
  padding: 0;
  float: right;
}

.img-wrapper {
  padding: 5px;
  ::v-deep .el-carousel {
    overflow: hidden;
  }
  ::v-deep .el-carousel__indicators {
    bottom: -4px;
  }
  ::v-deep .el-carousel__button {
    width: 20px;
    height: 4px;
    border-radius: 2px;
    background-color: #fff;
    opacity: 0.6;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  }
  ::v-deep .el-carousel__indicator.is-active .el-carousel__button {
    background-color: #00ddc0;
    opacity: 1;
  }
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
    cursor: pointer;
  }
}
</style>
