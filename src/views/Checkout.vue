<template>
  <div class="contact">
    <el-row
type="flex" class="row-bg"
justify="center"
>
      <el-col :span="20">
        <h2>{{ $t(`checkout.title`) }}</h2>
        <el-form ref="form"
method="POST" :model="form">
          <el-form-item class="antispam-field">
            <el-input
              v-model="form.website"
              name="website"
              autocomplete="off"
              tabindex="-1"
            />
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="form.name"
              name="name"
              :placeholder="$t(`contact.form.name`)"
              required
            />
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="form.phone"
              name="phone"
              :placeholder="$t(`contact.form.phone`)"
              required
            />
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="form.email"
              name="email"
              :placeholder="$t(`contact.form.email`)"
              required
            />
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="form.country"
              name="country"
              :placeholder="$t(`checkout.form.country`)"
            />
          </el-form-item>

          <el-row v-for="product in products"
type="flex" :key="product.id">
            <el-col :span="9">
              <img
                :src="require(`@/assets/img/${product.images[0]}`)"
                class="image"
              />
            </el-col>
            <el-col :span="15">
              <div class="productListInCart">
                <h2>{{ product.title }}</h2>
                <p>${{ product.price }} x {{ product.quantity }}</p>
                <div v-if="product.totalPrice">
                  <h5>Additional config:</h5>
                  <ul class="product-configurator">
                    <li
v-for="check in product.checkList" :key="check"
>
                      {{ $t('shop.product.products.1.configurator.' + check) }}:
                      + ${{ product.configurator[check] }}
                    </li>
                  </ul>
                  <p>
                    {{ $t('shop.cart.positionTotal') }}:
                    <b>${{ product.totalPrice * product.quantity }}</b>
                  </p>
                </div>
                <div v-else>
                  <p>
                    {{ $t('shop.cart.positionTotal') }}:
                    <b>${{ product.price * product.quantity }}</b>
                  </p>
                </div>
              </div>
            </el-col>
          </el-row>

          <p>
            {{ $t('shop.cart.total') }}: <b>${{ total }}</b>
          </p>
          <el-form-item>
            <el-button
type="primary" @click="submitForm()"
>
              {{ $t('checkout.form.submit') }}
            </el-button>
          </el-form-item>
        </el-form>
        <div v-if="processing"
class="processing-message">
          <div
            v-loading="processing"
            element-loading-text="Sending..."
            customClass="loading"
          />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import axios from 'axios'
import { mapGetters, mapState } from 'vuex'

export default {
  data() {
    return {
      form: {
        name: '',
        phone: '',
        email: '',
        country: '',
        // Поле пастка для ботів
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
    }),
  },
  mounted() {
    this.startTime = Date.now()
    axios
      .get('https://api.ipify.org?format=json')
      .then(res => {
        if (res.data && res.data.ip) this.clientIp = res.data.ip
      })
      .catch(() => {})
  },
  methods: {
    submitForm() {
      if (
        !this.form.name ||
        !this.form.phone ||
        !this.form.email ||
        !this.form.country
      ) {
        this.$notify.error({
          title: this.$t('notifications.errorTitle'),
          message: this.$t('notifications.fillAllFields'),
          offset: 150,
          duration: 4500,
        })
        return
      }

      if (!/^.+@.+\..+$/.test(this.form.email)) {
        this.$notify.error({
          title: this.$t('notifications.errorTitle'),
          message: this.$t('notifications.invalidEmail'),
          offset: 150,
          duration: 4500,
        })
        return
      }

      if (this.form.phone.replace(/[\s\-\+\(\)]/g, '').length < 9) {
        this.$notify.error({
          title: this.$t('notifications.errorTitle'),
          message: this.$t('notifications.invalidPhone'),
          offset: 150,
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
        ip: this.clientIp,
        honeypot: this.form.website, // Якщо заповнено - це бот
        timeTaken: Date.now() - this.startTime, // Час заповнення форми в мс
        // -------------------------------------

        total: this.total,
        products: this.products.map(product => ({
          title: product.title,
          price: product.price,
          quantity: product.quantity,
        })),
      }

      // Адреса вашого Google Apps Script
      // УВАГА: Якщо ви зробили новий деплой, перевірте чи не змінився URL!
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
            this.$store.dispatch('cart/clearCart')
            this.$router.push('/shop')
          } else {
            this.$notify.error({
              title: this.$t('notifications.errorTitle'),
              message:
                (response.data && response.data.message) ||
                'An error occurred while processing your order.',
              offset: 100,
              duration: 4500,
            })
          }
        })
        .catch(error => {
          console.error('Submission error:', error)
          this.processing = false
          this.$notify.error({
            title: this.$t('notifications.errorTitle'),
            message: 'Failed to send the order. Please try again.',
            offset: 100,
            duration: 4500,
          })
        })
    },
  },
}
</script>

<style lang="scss" scoped>
.contact {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;

  h2 {
    font-family: 'Roboto', sans-serif;
    font-weight: 500;
    font-size: 24px;
    color: #333;
    padding-bottom: 12px;
    border-bottom: 2px solid #00ddc0;
    margin-bottom: 20px;
  }
}

::v-deep .el-input__inner {
  border-radius: 4px;
  border: 1px solid #ddd;
  font-family: 'Roboto', sans-serif;
  &:focus {
    border-color: #00ddc0;
  }
}

.el-row {
  padding: 12px 0;
  margin-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
}

.image {
  max-height: 180px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  max-width: 50%;
  border-radius: 6px;
}

.productListInCart {
  h2 {
    font-size: 18px;
    border-bottom: none;
    padding-bottom: 4px;
    margin-bottom: 4px;
  }
  p {
    color: #555;
    font-size: 14px;
  }
}

ul {
  margin-top: 0;
  padding: 0 0 0 15px;
}
li {
  list-style-type: none;
  font-size: 13px;
  color: #888;
  padding: 2px 0;
}
h5 {
  margin-bottom: 5px;
  font-size: 13px;
  color: #888;
  font-weight: 400;
}

> p {
  font-size: 18px;
  font-weight: 500;
  padding-top: 12px;
  border-top: 2px solid #00ddc0;
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
