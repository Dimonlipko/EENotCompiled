<template>
  <div class="contact">
    <el-row type="flex" class="row-bg" justify="center">
      <el-col :span="20">
        <h2>{{ $t(`checkout.title`) }}</h2>
        <el-form method="POST" ref="form" :model="form">
          <el-form-item>
            <el-input
              name="name"
              :placeholder="$t(`contact.form.name`)"
              v-model="form.name"
              required
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-input
              name="phone"
              :placeholder="$t(`contact.form.phone`)"
              v-model="form.phone"
              required
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-input
              name="email"
              :placeholder="$t(`contact.form.email`)"
              v-model="form.email"
              required
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-input
              name="country"
              :placeholder="$t(`checkout.form.country`)"
              v-model="form.country"
            ></el-input>
          </el-form-item>

          <el-row type="flex" v-for="product in products" :key="product.id">
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
                    <li v-for="check in product.checkList" :key="check">
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
            <el-button type="primary" @click="submitForm()">
              {{ $t('checkout.form.submit') }}
            </el-button>
          </el-form-item>
        </el-form>
        <div class="processing-message" v-if="processing">
          <div
            v-loading="processing"
            element-loading-text="Sending..."
            customClass="loading"
          ></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import axios from 'axios'

export default {
  data() {
    return {
      form: {
        name: '',
        phone: '',
        email: '',
        country: '',
      },
      processing: false,
    }
  },
  computed: {
    ...mapState({
      checkoutStatus: (state) => state.cart.checkoutStatus,
    }),
    ...mapGetters('cart', {
      products: 'cartProducts',
      total: 'cartTotalPrice',
    }),
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
          message: this.$t('notifications.fillAllFields'), // Додайте цей ключ до локалізації
          offset: 150,
          duration: 4500,
        })
        return // Не відправляйте форму, якщо є незаповнені поля
      }

      this.processing = true

      const orderData = {
        name: this.form.name,
        phone: this.form.phone,
        email: this.form.email,
        country: this.form.country,
        total: this.total,
        products: this.products.map((product) => ({
          title: product.title,
          price: product.price,
          quantity: product.quantity,
        })),
      }

      axios
        .post('https://proxy1228x-1cd9682d219d.herokuapp.com/proxy', orderData)
        .then((response) => {
          this.processing = false
          if (response.data.status === 'success') {
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
                response.data.message ||
                'An error occurred while processing your order.',
              offset: 100,
              duration: 4500,
            })
          }
        })
        .catch((error) => {
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
.image {
  max-height: 200px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  max-width: 50%;
}
ul {
  margin-top: 0;
  padding: 0 0 0 15px;
}
li {
  list-style-type: none;
}
h5 {
  margin-bottom: 5px;
}
</style>
