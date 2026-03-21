<template>
  <div id="app">
    <HeaderComponent v-if="$route.name != `404`" />
    <el-main>
      <router-view />
    </el-main>
    <FooterComponent v-if="$route.name != `404`" />
  </div>
</template>

<script>
import FooterComponent from './components/layout/FooterComponent.vue'
import HeaderComponent from './components/layout/HeaderComponent.vue'
import './assets/style/style.scss'

export default {
  name: 'App',
  components: {
    HeaderComponent,
    FooterComponent,
  },
  mounted() {
    const redirectPath = sessionStorage.getItem('originalUrl')
    if (redirectPath && redirectPath !== '/') {
      sessionStorage.removeItem('originalUrl')
      this.$router.replace(redirectPath)
    }
  },
}
</script>

<style lang="scss" scoped>
.el-main {
  flex: 1 0 auto;
}
</style>
