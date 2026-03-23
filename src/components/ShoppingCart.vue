<template>
  <el-row>
    <el-col>
      <el-popover
        ref="cartPopover"
        placement="top"
        trigger="click"
      >
        <el-row>
          <el-col>
            <div class="cart">
              <h2>{{ $t('shop.cart.header') }}</h2>
              <p v-show="!products.length">
                <i>{{ $t('shop.cart.failText') }}</i>
              </p>
              <ul>
                <li
                  v-for="product in products"
                  :key="product.id"
                >
                  <div class="img-wrapper">
                    <img
                      :src="getImageSrc(product.images[0])"
                      class="image"
                    />
                  </div>
                  <div class="productListInCart">
                    <p>
                      {{ getTitle(product) }}: ${{ product.price }} x
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
                          {{ getOptionLabel(product, check) }}: + ${{ product.configurator[check] }}
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
              <p class="cart-total">{{ $t('shop.cart.total') }}: {{ total }} $</p>
              <p>
                <el-button
                  :disabled="!products.length"
                  @click="openCheckout"
                >
                  {{ $t('shop.cart.checkout') }}
                </el-button>
              </p>
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

      <!-- Checkout Dialog -->
      <el-dialog
        :title="$t('checkout.title')"
        :visible.sync="checkoutVisible"
        :width="dialogWidth"
        :close-on-click-modal="false"
        :append-to-body="true"
        custom-class="checkout-dialog"
      >
        <el-form ref="checkoutForm" :model="form">
          <el-form-item class="antispam-field">
            <el-input
              v-model="form.website"
              name="url_confirm"
              autocomplete="nope"
              tabindex="-1"
              aria-hidden="true"
            />
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="form.name"
              :placeholder="$t('contact.form.name')"
              prefix-icon="el-icon-user"
            />
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="form.phone"
              :placeholder="$t('contact.form.phone')"
              prefix-icon="el-icon-phone"
              @input="form.phone = form.phone.replace(/[^0-9+\-() ]/g, '')"
            />
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="form.email"
              :placeholder="$t('contact.form.email')"
              prefix-icon="el-icon-message"
            />
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="form.country"
              :placeholder="$t('checkout.form.country')"
              prefix-icon="el-icon-location"
            />
          </el-form-item>

          <el-form-item :label="$t('checkout.form.delivery')">
            <el-radio-group v-model="form.delivery">
              <el-radio label="pickup">{{ $t('checkout.form.pickup') }}</el-radio>
              <el-radio label="post">{{ $t('checkout.form.post') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="form.delivery === 'post'">
            <el-input
              v-model="form.address"
              :placeholder="$t('checkout.form.address')"
              prefix-icon="el-icon-office-building"
            />
          </el-form-item>

          <el-form-item :label="$t('checkout.form.payment')">
            <el-radio-group v-model="form.payment">
              <el-radio label="invoice">{{ $t('checkout.form.invoice') }}</el-radio>
              <el-radio label="cod">{{ $t('checkout.form.cod') }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>

        <div class="checkout-products">
          <div
            v-for="product in products"
            :key="product.id"
            class="checkout-product-row"
          >
            <img
              :src="getImageSrc(product.images[0])"
              class="checkout-product-img"
            />
            <div class="checkout-product-info">
              <span class="checkout-product-title">{{ getTitle(product) }}</span>
              <span class="checkout-product-price">
                ${{ product.price }} x {{ product.quantity }}
              </span>
              <div v-if="product.totalPrice" class="checkout-product-config">
                <span
                  v-for="check in product.checkList"
                  :key="check"
                >
                  {{ getOptionLabel(product, check) }}:
                  +${{ product.configurator[check] }}
                </span>
              </div>
            </div>
            <span class="checkout-product-subtotal">
              ${{ (product.totalPrice || product.price) * product.quantity }}
            </span>
          </div>
        </div>

        <div class="checkout-total">
          {{ $t('shop.cart.total') }}: <b>${{ total }}</b>
        </div>

        <div v-if="processing" class="checkout-loading">
          <div
            v-loading="processing"
            element-loading-text="Sending..."
          />
        </div>

        <span slot="footer">
          <el-button @click="checkoutVisible = false">
            {{ $t('checkout.form.cancel') || 'Cancel' }}
          </el-button>
          <el-button
            type="primary"
            :loading="processing"
            @click="submitOrder"
          >
            {{ $t('checkout.form.submit') }}
          </el-button>
        </span>
      </el-dialog>
    </el-col>
  </el-row>
</template>

<script>
import axios from 'axios'
import { mapGetters, mapState } from 'vuex'

export default {
  data() {
    return {
      checkoutVisible: false,
      form: {
        name: '',
        phone: '',
        email: '',
        country: '',
        delivery: 'pickup',
        address: '',
        payment: 'invoice',
        website: '',
      },
      processing: false,
      startTime: 0,
      clientIp: 'Unknown',
    }
  },
  computed: {
    ...mapState({
      checkoutStatus: state => state.cart.checkoutStatus,
    }),
    ...mapGetters('cart', {
      products: 'cartProducts',
      total: 'cartTotalPrice',
      count: 'itemsInCart',
    }),
    dialogWidth() {
      return window.innerWidth < 768 ? '95%' : '500px'
    },
  },
  mounted() {
    axios
      .get('https://api.ipify.org?format=json')
      .then(res => {
        if (res.data && res.data.ip) this.clientIp = res.data.ip
      })
      .catch(() => {})
  },
  methods: {
    getTitle(product) {
      if (typeof product.title === 'object') {
        return product.title[this.$i18n.locale] || product.title.ua || product.title.en || ''
      }
      return product.title
    },
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
    },
    getOptionLabel(product, check) {
      if (product.options && product.options[check]) {
        const opt = product.options[check]
        if (opt.name && typeof opt.name === 'object') {
          return opt.name[this.$i18n.locale] || opt.name.ua || opt.name.en || ''
        }
        return opt.name || ''
      }
      return ''
    },
    openCheckout() {
      this.$refs.cartPopover.doClose()
      this.checkoutVisible = true
      this.startTime = Date.now()
    },
    removeProduct(productId) {
      this.$store.dispatch('cart/removeProductFromCart', productId)
    },
    submitOrder() {
      if (
        !this.form.name ||
        !this.form.phone ||
        !this.form.email ||
        !this.form.country
      ) {
        this.$notify.error({
          title: this.$t('notifications.errorTitle'),
          message: this.$t('notifications.fillAllFields'),
          offset: 100,
          duration: 4500,
        })
        return
      }

      if (!/^.+@.+\..+$/.test(this.form.email)) {
        this.$notify.error({
          title: this.$t('notifications.errorTitle'),
          message: this.$t('notifications.invalidEmail'),
          offset: 100,
          duration: 4500,
        })
        return
      }

      if (this.form.phone.replace(/[\s\-\+\(\)]/g, '').length < 9) {
        this.$notify.error({
          title: this.$t('notifications.errorTitle'),
          message: this.$t('notifications.invalidPhone'),
          offset: 100,
          duration: 4500,
        })
        return
      }

      this.processing = true

      const orderData = {
        type: 'order',
        name: this.form.name,
        phone: this.form.phone,
        email: this.form.email,
        country: this.form.country,
        delivery: this.form.delivery,
        address: this.form.delivery === 'post' ? this.form.address : '',
        payment: this.form.payment,
        ip: this.clientIp,
        honeypot: this.form.website,
        timeTaken: Date.now() - this.startTime,
        total: this.total,
        products: this.products.map(product => ({
          title: this.getTitle(product),
          price: product.price,
          quantity: product.quantity,
        })),
      }

      const GOOGLE_SCRIPT_URL =
        'https://script.google.com/macros/s/AKfycbxdqxp8PF4H7MT5aLYl0a9b2vGKjbQrmckE81-1PnVCppDyfVeKio228CuXrYkPXcDn/exec'

      axios
        .post(GOOGLE_SCRIPT_URL, JSON.stringify(orderData), {
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
        })
        .then(response => {
          this.processing = false

          if (response.data && response.data.status === 'success') {
            this.$notify({
              title: this.$t('notifications.succesfullOrderTitle'),
              message: this.$t('notifications.succesfullOrder'),
              type: 'success',
              offset: 100,
              duration: 4500,
            })
            this.checkoutVisible = false
            this.form.name = ''
            this.form.phone = ''
            this.form.email = ''
            this.form.country = ''
            this.form.delivery = 'pickup'
            this.form.address = ''
            this.form.payment = 'invoice'
            this.$store.dispatch('cart/clearCart')
          } else {
            this.$notify.error({
              title: this.$t('notifications.errorTitle'),
              message: this.$t('notifications.error'),
              offset: 100,
              duration: 4500,
            })
          }
        })
        .catch(() => {
          this.processing = false
          this.$notify.error({
            title: this.$t('notifications.errorTitle'),
            message: this.$t('notifications.error'),
            offset: 100,
            duration: 4500,
          })
        })
    },
  },
}
</script>

<style lang="scss" scoped>
.custom-icon {
  font-size: 2rem;
  &:focus {
    color: inherit !important;
    border-color: #dcdfe6 !important;
    background-color: #fff !important;
  }
}
.el-button {
  padding: 6px 10px;
}

.remove-button {
  margin-right: 8px;
  color: #888;
  border: none;
  background: transparent;
  &:hover {
    color: #ff4d4f;
  }
}

.cart {
  h2 {
    font-family: 'Roboto', sans-serif;
    font-weight: 500;
    font-size: 18px;
    margin: 0 0 12px;
    padding-bottom: 10px;
    border-bottom: 2px solid #00ddc0;
    color: #333;
  }
  .cart-total {
    font-weight: 500;
    font-size: 16px;
    padding-top: 10px;
    border-top: 1px solid #e0e0e0;
  }
}

.el-col > span {
  float: right;
}
ul {
  padding: 0;
  margin: 0;
}
li {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  .img-wrapper {
    padding: 0 10px 0 0;
    width: 20%;
  }
  .image {
    width: 100%;
    display: block;
    border-radius: 4px;
  }
  p {
    margin: 0;
    font-size: 14px;
    color: #555;
  }
}

.product-configurator {
  marker: none;
  li {
    padding: 0;
    border-bottom: none;
    font-size: 12px;
    color: #888;
  }
}

/* Checkout dialog content */
.checkout-products {
  margin: 10px 0;
}
.checkout-product-row {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}
.checkout-product-img {
  width: 50px;
  height: 50px;
  object-fit: contain;
  border-radius: 4px;
  margin-right: 12px;
  flex-shrink: 0;
}
.checkout-product-info {
  flex: 1;
  .checkout-product-title {
    display: block;
    font-weight: 500;
    font-size: 14px;
    color: #333;
  }
  .checkout-product-price {
    font-size: 13px;
    color: #888;
  }
  .checkout-product-config {
    span {
      display: block;
      font-size: 12px;
      color: #aaa;
    }
  }
}
.checkout-product-subtotal {
  font-weight: 500;
  font-size: 15px;
  color: #333;
  flex-shrink: 0;
  margin-left: 10px;
}
.checkout-total {
  font-size: 18px;
  padding: 12px 0;
  border-top: 2px solid #00ddc0;
  text-align: right;
}
.checkout-loading {
  padding: 10px 0;
}

.antispam-field {
  position: absolute;
  left: -9999px;
  opacity: 0;
  z-index: -1;
  height: 0;
  width: 0;
  overflow: hidden;
}
</style>
<style>
.el-popover {
  max-width: 400px;
  width: 90%;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}
.checkout-dialog {
  border-radius: 8px;
}
.checkout-dialog .el-dialog__header {
  border-bottom: 2px solid #00ddc0;
  padding: 15px 20px;
}
.checkout-dialog .el-dialog__title {
  font-family: 'Roboto', sans-serif;
  font-weight: 500;
  font-size: 18px;
  color: #333;
}
.checkout-dialog .el-dialog__body {
  padding: 15px 20px;
}
.checkout-dialog .el-dialog__footer {
  border-top: 1px solid #e0e0e0;
  padding: 12px 20px;
}
</style>
