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
        :title="checkoutStep === 1 ? $t('checkout.title') : $t('checkout.paymentDetails.title')"
        :visible.sync="checkoutVisible"
        :width="dialogWidth"
        :close-on-click-modal="false"
        :append-to-body="true"
        custom-class="checkout-dialog"
      >
        <!-- Step 1: Order Form -->
        <div v-show="checkoutStep === 1">
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
            <el-form-item :error="phoneError">
              <el-input
                v-model="form.phone"
                :placeholder="isUkraine ? '+38 (0XX) XXX-XX-XX' : $t('contact.form.phone')"
                prefix-icon="el-icon-phone"
                maxlength="19"
                @input="formatPhone"
              />
            </el-form-item>
            <el-form-item>
              <el-input
                v-model="form.email"
                :placeholder="$t('contact.form.email')"
                prefix-icon="el-icon-message"
              />
            </el-form-item>

            <el-form-item :label="$t('checkout.form.country')">
              <el-radio-group v-model="form.country">
                <el-radio label="UA">{{ $t('checkout.form.ukraine') }}</el-radio>
                <el-radio label="EU">{{ $t('checkout.form.europe') }}</el-radio>
                <el-radio label="US">{{ $t('checkout.form.usa') }}</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- Delivery: Ukraine -->
            <template v-if="form.country === 'UA'">
              <el-form-item :label="$t('checkout.form.delivery')">
                <el-radio-group v-model="form.delivery">
                  <el-radio label="pickup">{{ $t('checkout.form.pickup') }}</el-radio>
                  <el-radio label="novaposhta">{{ $t('checkout.form.novaposhta') }}</el-radio>
                  <el-radio label="ukrposhta">{{ $t('checkout.form.ukrposhta') }}</el-radio>
                </el-radio-group>
              </el-form-item>
              <!-- Nova Poshta: city + warehouse autocomplete -->
              <template v-if="form.delivery === 'novaposhta'">
                <el-form-item :label="$t('checkout.form.city')">
                  <el-autocomplete
                    v-model="npCityQuery"
                    :fetch-suggestions="npCityFetch"
                    :placeholder="$t('checkout.form.cityPlaceholder')"
                    prefix-icon="el-icon-location"
                    :loading="npCityLoading"
                    :trigger-on-focus="false"
                    @select="handleCitySelect"
                    value-key="name"
                    style="width: 100%"
                  />
                </el-form-item>
                <el-form-item v-if="npSelectedCity" :label="$t('checkout.form.branch')">
                  <el-autocomplete
                    v-model="npWarehouseQuery"
                    :fetch-suggestions="npWarehouseFetch"
                    :placeholder="$t('checkout.form.branchPlaceholder')"
                    prefix-icon="el-icon-office-building"
                    :loading="npWarehouseLoading"
                    :trigger-on-focus="true"
                    @select="handleWarehouseSelect"
                    value-key="name"
                    style="width: 100%"
                  />
                </el-form-item>
              </template>
              <!-- Ukrposhta: manual input -->
              <el-form-item v-if="form.delivery === 'ukrposhta'">
                <el-input
                  v-model="form.branch"
                  :placeholder="$t('checkout.form.ukrposhtaAddress')"
                  prefix-icon="el-icon-office-building"
                />
              </el-form-item>
            </template>

            <!-- Delivery: International -->
            <template v-else>
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
            </template>

            <el-form-item :label="$t('checkout.form.payment')">
              <el-radio-group v-model="form.payment">
                <el-radio label="invoice">{{ $t('checkout.form.invoice') }}</el-radio>
                <el-radio v-if="form.delivery === 'novaposhta'" label="cod_np">{{ $t('checkout.form.codNP') }}</el-radio>
                <el-radio v-if="form.delivery === 'pickup' || form.country !== 'UA'" label="cod">{{ $t('checkout.form.cod') }}</el-radio>
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
            <span v-if="isUkraine && usdRate" class="amount-usd">
              ({{ Math.round(total * usdRate * 100) / 100 }} ₴ за курсом {{ usdRate }})
            </span>
          </div>

          <div v-if="processing" class="checkout-loading">
            <div
              v-loading="processing"
              element-loading-text="Sending..."
            />
          </div>
        </div>

        <!-- Step 2: Payment Requisites (Ukraine + Invoice only) -->
        <div v-show="checkoutStep === 2" class="payment-requisites">
          <el-alert
            type="success"
            :title="$t('checkout.paymentDetails.orderPlaced') + (orderReference ? ' #' + orderReference : '')"
            show-icon
            :closable="false"
          />

          <div class="requisites-section">
            <h4>{{ $t('checkout.paymentDetails.bankDetails') }}</h4>
            <div class="requisite-row">
              <span class="requisite-label">{{ $t('checkout.paymentDetails.company') }}:</span>
              <span>{{ bankRequisites.companyName }}</span>
            </div>
            <div class="requisite-row">
              <span class="requisite-label">{{ $t('checkout.paymentDetails.ipn') }}:</span>
              <span>{{ bankRequisites.ipn }}</span>
            </div>
            <div class="requisite-row">
              <span class="requisite-label">{{ $t('checkout.paymentDetails.bank') }}:</span>
              <span>{{ bankRequisites.bankName }}</span>
            </div>
            <div class="requisite-row">
              <span class="requisite-label">{{ $t('checkout.paymentDetails.mfo') }}:</span>
              <span>{{ bankRequisites.mfo }}</span>
            </div>
            <div class="requisite-row">
              <span class="requisite-label">IBAN:</span>
              <span class="iban-value">{{ bankRequisites.iban }}</span>
              <el-button size="mini" icon="el-icon-copy-document" @click="copyToClipboard(bankRequisites.iban)">
                {{ $t('checkout.paymentDetails.copy') }}
              </el-button>
            </div>
            <div class="requisite-row">
              <span class="requisite-label">{{ $t('checkout.paymentDetails.amount') }}:</span>
              <span>
                <b>{{ orderTotalUah }} ₴</b>
                <span class="amount-usd">(${{ orderTotal }} × {{ usdRate }} ₴)</span>
              </span>
              <el-button size="mini" icon="el-icon-copy-document" @click="copyToClipboard(String(orderTotalUah))">
                {{ $t('checkout.paymentDetails.copy') }}
              </el-button>
            </div>
            <div class="requisite-row">
              <span class="requisite-label">{{ $t('checkout.paymentDetails.purpose') }}:</span>
              <span>{{ paymentPurpose }}</span>
            </div>
          </div>

          <div class="qr-section">
            <h4>{{ $t('checkout.paymentDetails.qrTitle') }}</h4>
            <p>{{ $t('checkout.paymentDetails.qrHint') }}</p>
            <a :href="paymentLink" target="_blank" rel="noopener" class="qr-link">
              <canvas ref="qrCanvas"></canvas>
            </a>
          </div>
        </div>

        <span slot="footer">
          <template v-if="checkoutStep === 1">
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
          </template>
          <template v-else>
            <el-button type="primary" @click="closeAfterPayment">
              {{ $t('checkout.paymentDetails.done') }}
            </el-button>
          </template>
        </span>
      </el-dialog>
    </el-col>
  </el-row>
</template>

<script>
import axios from 'axios'
import QRCode from 'qrcode'
import { mapGetters, mapState } from 'vuex'
import { BANK_REQUISITES } from '@/config/bankRequisites'
import { searchCities, getWarehouses } from '@/api/novaPoshta'
import { getUsdRate } from '@/api/monobank'

export default {
  data() {
    return {
      checkoutVisible: false,
      checkoutStep: 1,
      orderReference: '',
      orderTotal: 0,
      form: {
        name: '',
        phone: '',
        email: '',
        country: 'UA',
        delivery: 'pickup',
        address: '',
        branch: '',
        payment: 'invoice',
        website: '',
      },
      processing: false,
      startTime: 0,
      clientIp: 'Unknown',
      usdRate: 0,
      // Nova Poshta
      npCityQuery: '',
      npCities: [],
      npSelectedCity: null,
      npWarehouses: [],
      npWarehouseQuery: '',
      npCityLoading: false,
      npWarehouseLoading: false,
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
    isUkraine() {
      return this.form.country === 'UA'
    },
    isUkraineInvoice() {
      return this.isUkraine && this.form.payment === 'invoice'
    },
    bankRequisites() {
      return BANK_REQUISITES
    },
    orderTotalUah() {
      if (!this.usdRate || !this.orderTotal) return 0
      return Math.round(this.orderTotal * this.usdRate * 100) / 100
    },
    paymentPurpose() {
      return BANK_REQUISITES.paymentPurpose(this.orderTotalUah, this.orderReference)
    },
    paymentLink() {
      return BANK_REQUISITES.nbuQrLink(this.orderTotalUah, this.paymentPurpose)
    },
    phoneDigitsOnly() {
      return (this.form.phone || '').replace(/\D/g, '')
    },
    phoneError() {
      if (!this.form.phone || this.form.phone.length < 4) return ''
      if (this.isUkraine) {
        var d = this.phoneDigitsOnly
        if (d.length > 0 && d.length < 12) return this.$t('notifications.invalidPhone')
        if (d.length === 12 && !d.startsWith('380')) return this.$t('notifications.invalidPhone')
      }
      return ''
    },
  },
  watch: {
    'form.country'() {
      this.form.delivery = 'pickup'
      this.form.address = ''
      this.form.branch = ''
      this.resetNovaPoshta()
    },
    'form.delivery'(val) {
      this.form.branch = ''
      this.resetNovaPoshta()
      // Скинути cod_np якщо змінили доставку не на НП
      if (val !== 'novaposhta' && this.form.payment === 'cod_np') {
        this.form.payment = 'invoice'
      }
    },
  },
  mounted() {
    axios
      .get('https://api.ipify.org?format=json')
      .then(res => {
        if (res.data && res.data.ip) this.clientIp = res.data.ip
      })
      .catch(() => {})
    getUsdRate().then(usd => {
      if (usd && usd.rateBuy && usd.rateSell) {
        this.usdRate = Math.round((usd.rateBuy + usd.rateSell) / 2 * 100) / 100
      }
    })
  },
  methods: {
    formatPhone() {
      var input = this.form.phone
      if (!input || input === '+') return
      var raw = input.replace(/\D/g, '')
      if (!raw) { this.form.phone = '+'; return }

      if (this.isUkraine) {
        // 0... → 380...
        if (raw.startsWith('0')) raw = '38' + raw
        // 3... але не 38 → додаємо 38 тільки якщо вже є 38
        // Обрізаємо до 12 цифр (380XXXXXXXXX)
        if (raw.startsWith('38')) raw = raw.substring(0, 12)
        // Якщо ввели просто 3 або 38 — показуємо +3 або +38
        if (raw.length <= 2 && raw.startsWith('3')) {
          this.form.phone = '+' + raw
          return
        }

        // Форматуємо +38 (0XX) XXX-XX-XX
        var f = '+38'
        if (raw.length > 2) f += ' (0' + raw.substring(3, 5)
        if (raw.length >= 5) f += ') '
        if (raw.length > 5) f += raw.substring(5, 8)
        if (raw.length > 8) f += '-' + raw.substring(8, 10)
        if (raw.length > 10) f += '-' + raw.substring(10, 12)
        this.form.phone = f
      } else {
        this.form.phone = '+' + raw
      }
    },
    // --- Nova Poshta ---
    handleCitySelect(city) {
      this.npSelectedCity = city
      this.npWarehouseQuery = ''
      this.form.branch = ''
    },
    handleWarehouseSelect(warehouse) {
      this.form.branch = warehouse.name
    },
    npCityFetch(query, cb) {
      if (!query || query.length < 2) return cb([])
      this.npCityLoading = true
      searchCities(query).then(cities => {
        this.npCityLoading = false
        cb(cities)
      })
    },
    npWarehouseFetch(query, cb) {
      if (!this.npSelectedCity) return cb([])
      this.npWarehouseLoading = true
      getWarehouses(this.npSelectedCity.ref, query || '').then(warehouses => {
        this.npWarehouseLoading = false
        cb(warehouses)
      })
    },
    resetNovaPoshta() {
      this.npCityQuery = ''
      this.npCities = []
      this.npSelectedCity = null
      this.npWarehouses = []
      this.npWarehouseQuery = ''
    },
    // --- General ---
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
      this.checkoutStep = 1
      this.startTime = Date.now()
    },
    removeProduct(productId) {
      this.$store.dispatch('cart/removeProductFromCart', productId)
    },
    resetForm() {
      this.form.name = ''
      this.form.phone = ''
      this.form.email = ''
      this.form.country = 'UA'
      this.form.delivery = 'pickup'
      this.form.address = ''
      this.form.branch = ''
      this.form.payment = 'invoice'
    },
    generateQR() {
      QRCode.toCanvas(this.$refs.qrCanvas, this.paymentLink, { width: 200 }, (err) => {
        if (err) console.error('QR generation failed:', err)
      })
    },
    openPaymentLink() {
      window.open(this.paymentLink, '_blank')
    },
    copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        this.$notify({
          title: '',
          message: this.$t('checkout.paymentDetails.copied'),
          type: 'success',
          offset: 100,
          duration: 2000,
        })
      })
    },
    closeAfterPayment() {
      this.checkoutVisible = false
      this.checkoutStep = 1
      this.resetForm()
    },
    submitOrder() {
      if (
        !this.form.name ||
        !this.form.phone ||
        !this.form.email
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

      var digits = this.phoneDigitsOnly
      var phoneValid = this.isUkraine
        ? digits.length === 12 && digits.startsWith('380')
        : digits.length >= 9
      if (!phoneValid) {
        this.$notify.error({
          title: this.$t('notifications.errorTitle'),
          message: this.$t('notifications.invalidPhone'),
          offset: 100,
          duration: 4500,
        })
        return
      }

      this.processing = true

      // Якщо курс не підтягнувся — спробувати ще раз
      const sendOrder = () => {
        const rate = this.usdRate
        const orderData = {
          type: 'order',
          name: this.form.name,
          phone: this.form.phone,
          email: this.form.email,
          country: this.form.country,
          delivery: this.form.delivery,
          branch: (this.form.delivery === 'novaposhta' || this.form.delivery === 'ukrposhta')
            ? this.form.branch : '',
          address: this.form.delivery === 'post' ? this.form.address : '',
          payment: this.form.payment,
          ip: this.clientIp,
          honeypot: this.form.website,
          timeTaken: Date.now() - this.startTime,
          total: this.total,
          totalUah: rate ? Math.round(this.total * rate * 100) / 100 : 0,
          usdRate: rate,
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
          console.log('Google Script response:', JSON.stringify(response.data))

          if (response.data && response.data.status === 'success') {
            var ref = response.data.orderNumber || Date.now().toString()
            if (this.isUkraineInvoice) {
              this.orderTotal = this.total
              this.orderReference = ref
              this.checkoutStep = 2
              this.$store.dispatch('cart/clearCart')
              this.$nextTick(() => this.generateQR())
            } else {
              this.$notify({
                title: this.$t('notifications.succesfullOrderTitle'),
                message: this.$t('notifications.succesfullOrder') + ' #' + ref,
                type: 'success',
                offset: 100,
                duration: 6000,
              })
              this.checkoutVisible = false
              this.resetForm()
              this.$store.dispatch('cart/clearCart')
            }
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
      }

      // Якщо курс не підтягнувся — спробувати ще раз перед відправкою
      if (!this.usdRate && this.isUkraine) {
        getUsdRate().then(usd => {
          if (usd && usd.rateBuy) this.usdRate = usd.rateBuy
          sendOrder()
        })
      } else {
        sendOrder()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.custom-icon {
  font-size: 1.5rem;
  background-color: #fff !important;
  color: #333 !important;
  border: 2px solid #e0e0e0 !important;
  border-bottom: 3px solid #00ddc0 !important;
  border-radius: 10px !important;
  padding: 8px 14px !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  &:hover {
    background-color: #eee !important;
    border-color: #ccc !important;
    border-bottom-color: #00ddc0 !important;
  }
  &:focus {
    background-color: #fff !important;
    color: #333 !important;
    border: 2px solid #e0e0e0 !important;
    border-bottom: 3px solid #00ddc0 !important;
  }
  &:active {
    background-color: rgba(0, 221, 192, 0.25) !important;
    color: #333 !important;
    border-color: #00ddc0 !important;
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

.payment-requisites {
  .requisites-section {
    margin: 16px 0;
    h4 {
      margin: 0 0 10px;
      color: #333;
    }
  }
  .requisite-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    padding: 6px 0;
    border-bottom: 1px solid #f0f0f0;
    .requisite-label {
      font-weight: 500;
      color: #666;
      min-width: 100px;
    }
    .iban-value {
      font-family: monospace;
      font-size: 13px;
      word-break: break-all;
    }
    .amount-usd {
      font-size: 12px;
      color: #888;
      margin-left: 4px;
    }
  }
  .qr-section {
    text-align: center;
    margin: 20px 0 10px;
    h4 {
      margin: 0 0 6px;
    }
    p {
      font-size: 13px;
      color: #888;
      margin: 0 0 12px;
    }
    .qr-link {
      display: inline-block;
      cursor: pointer;
      &:hover canvas {
        opacity: 0.85;
      }
    }
    canvas {
      display: inline-block;
    }
    .pay-button {
      margin-top: 12px;
    }
  }
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
