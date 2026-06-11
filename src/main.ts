import Vue from 'vue'

import './plugins/fontawesome'
import App from './App.vue'
import i18n from './i18n'
import router from './router'
import store from './store'
import './plugins/element.js'
import 'normalize.css'
import progressive from './directives/progressive'

Vue.directive('progressive', progressive)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app')
