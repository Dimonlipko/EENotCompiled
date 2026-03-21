<template>
  <div class="contact">
    <el-row
type="flex" class="row-bg"
justify="center"
>
      <el-col
:xs="{ span: 24 }" :sm="{ span: 12 }"
:lg="{ span: 8 }"
>
        <div class="google-map">
          <iframe
            frameborder="0"
            style="border:0"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3594.6543544209985!2d30.364370687137253!3d50.42611455970844!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d4cbf70ba726d1%3A0x4e0f2772c238edfe!2sElectric%20Engines!5e0!3m2!1sru!2sua!4v1574864388731!5m2!1sru!2sua"
            allowfullscreen=""
          />
        </div>
      </el-col>
      <el-col
:xs="{ span: 24 }" :sm="{ span: 12 }"
:lg="{ span: 8 }"
>
        <h2>{{ $t('contact.h1') }}</h2>
        <div class="icon-message-block">
          <i class="el-icon-message" />
          <h4>{{ $t('contact.h2') }}</h4>
        </div>
        <div class="suggestions">
          <h5>{{ $t('contact.h3') }}</h5>
          <div class="contacts">
            <p>{{ $t('contact.phone') }}: +38 095 487 40 19</p>
            <p>Email: electricenginescar@gmail.com</p>
          </div>
        </div>
        <el-form ref="form"
method="POST" :model="form">
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
              @input="form.phone = form.phone.replace(/[^0-9+\-() ]/g, '')"
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
              v-model="form.message"
              name="message"
              type="textarea"
              :rows="5"
              :placeholder="$t(`contact.form.message`)"
              required
            />
          </el-form-item>
          <el-form-item>
            <el-button
type="primary" @click="submitForm()">
              {{ $t("contact.form.send") }}
            </el-button>
          </el-form-item>
        </el-form>
        <div v-if="processing"
class="processing-message">
          <div
            v-loading="processing"
            element-loading-text="Loading..."
            customClass="loading"
          />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      form: {
        name: '',
        phone: '',
        email: '',
        message: '',
        website: '',
      },
      processing: false,
      startTime: 0,
      clientIp: 'Unknown',
    }
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
        !this.form.message
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

      const contactData = {
        type: 'contact',
        name: this.form.name,
        phone: this.form.phone,
        email: this.form.email,
        message: this.form.message,
        ip: this.clientIp,
        honeypot: this.form.website,
        timeTaken: Date.now() - this.startTime,
      }

      const GOOGLE_SCRIPT_URL =
        'https://script.google.com/macros/s/AKfycbx9CBk8f2X0CZeM7ik-UVpRQ-YXYPOTA3I6mWeD0vmusJnmj0Iq0MNOFyaTybaevqn5/exec'

      axios
        .post(GOOGLE_SCRIPT_URL, JSON.stringify(contactData), {
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
        })
        .then(response => {
          this.processing = false

          if (response.data && response.data.status === 'success') {
            this.$notify({
              title: this.$t('notifications.succesfullContactTitle'),
              message: this.$t('notifications.succesfullContact'),
              type: 'success',
              offset: 100,
              duration: 4500,
            })
            this.form.name = ''
            this.form.phone = ''
            this.form.email = ''
            this.form.message = ''
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
// prettier-ignore
@import url(https://fonts.googleapis.com/css?family=Rubik:300,300i,400,400i,500,500i,700,700i,900,900i&display=swap);
.el-row {
  flex-wrap: wrap;
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}
.el-col {
  border-radius: 4px;
  min-width: 250px;
  padding: 0 20px;
}
.google-map {
  height: 40rem;
  position: relative;
  iframe {
    height: 100%;
    width: 100%;
  }
}
h2 {
  font-family: 'Rubik', sans-serif;
  font-size: 3rem;
  padding-bottom: 1rem !important;
  font-weight: 300;
  line-height: 1.2;
  margin-bottom: 0.5rem;
  margin-top: 0;
}
.icon-message-block {
  margin-bottom: 10px;
  padding-bottom: 1rem !important;
  .el-icon-message {
    display: inline-block;
    vertical-align: middle;
    font-size: 48px;
    padding-right: 1rem;
  }
  h4 {
    display: inline-block;
    vertical-align: middle;
    margin-bottom: 0;
    line-height: 1;
    font-style: italic;
    font-size: 1.5rem;
    margin-top: 0;
    font-weight: 300;
  }
}
.suggestions {
  padding-bottom: 1rem !important;
  h5 {
    font-family: 'Rubik', sans-serif;
    font-size: 1rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
    line-height: 1.2;
    margin-top: 0;
  }
  .contacts {
    color: #767676;
    font-family: 'Rubik', sans-serif;
    font-size: 1rem;
    margin-top: 0;
    margin-bottom: 1rem;
    p {
      margin: 0;
    }
  }
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
