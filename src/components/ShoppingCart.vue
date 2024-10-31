<template>
  <el-row>
    <el-col>
      <el-popover placement="top" trigger="click">
        <el-row>
          <el-col>
            <div class="cart">
              <h2>{{ $t('shop.cart.header') }}</h2>
              <p v-show="!products.length">
                <i>{{ $t('shop.cart.failText') }}</i>
              </p>
              <ul>
                <li v-for="product in products" :key="product.id">
                  <div class="img-wrapper">
                    <img
                      :src="require(`@/assets/img/${product.images[0]}`)"
                      class="image"
                    />
                  </div>
                  <div class="productListInCart">
                    <p>
                      {{ product.title }}: ${{ product.price }} x
                      {{ product.quantity }}
                    </p>
                    <el-button
                      icon="el-icon-close"
                      class="remove-button"
                      @click="removeProduct(product.id)"
                    />
                    <div v-if="product.totalPrice">
                      <ul
                        v-for="check in product.checkList"
                        :key="check"
                        class="product-configurator"
                      >
                        <li>
                          {{
                            $t('shop.product.products.1.configurator.' + check)
                          }}: + ${{ product.configurator[check] }}
                        </li>
                      </ul>
                      <p>
                        {{ $t('shop.cart.positionTotal') }}: ${{
                          product.totalPrice * product.quantity
                        }}
                      </p>
                    </div>
                  </div>
                </li>
              </ul>
              <p>{{ $t('shop.cart.total') }}: {{ total }} $</p>
              <p>
                <el-button
                  :disabled="!products.length"
                  @click="$router.push('/checkout')"
                >
                  {{ $t('shop.cart.checkout') }}
                </el-button>
              </p>
              <p v-show="checkoutStatus">Checkout {{ checkoutStatus }}.</p>
            </div>
          </el-col>
        </el-row>
        <el-button
          slot="reference"
          class="custom-icon"
          icon="el-icon-shopping-cart-2"
        >
          {{ count }}
        </el-button>
      </el-popover>
    </el-col>
  </el-row>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  computed: {
    ...mapState({
      checkoutStatus: state => state.cart.checkoutStatus,
    }),
    ...mapGetters('cart', {
      products: 'cartProducts',
      total: 'cartTotalPrice',
      count: 'itemsInCart',
    }),
  },
  methods: {
    checkout(products) {
      this.$store.dispatch('cart/checkout', products)
    },
    removeProduct(productId) {
      this.$store.dispatch('cart/removeProductFromCart', productId)
    },
  },
}
</script>

<style lang="scss" scoped>
.custom-icon {
  font-size: 2rem;
}
.el-button {
  padding: 6px 10px;
}

.remove-button {
  margin-right: 8px;
  color: grey;
}

.el-col > span {
  float: right;
}
ul {
  padding: 0;
}
li {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  padding: 5px 0;
  .img-wrapper {
    padding: 0 10px 0 0;
    width: 20%;
  }
  .image {
    width: 100%;
    display: block;
  }
  p {
    margin: 0;
  }
}

.product-configurator {
  marker: none;
  li {
    padding: 0;
  }
}
</style>
<style>
.el-popover {
  max-width: 400px;
  width: 90%;
}
</style>
