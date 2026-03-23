<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons'

library.add(faFacebook, faInstagram)

@Component({})
export default class HeaderComponent extends Vue {
  year: number = new Date().getFullYear()
}
</script>

<template>
  <el-footer height="auto">
    <el-row
type="flex" justify="center"
align="middle"
>
      <el-col :span="24" class="footer-content">
        <div class="footer-text">
          © Copyright {{ year }} ElectricEngines - All Rights Reserved
        </div>
        <div class="footer-social">
          <a href="https://www.facebook.com/ElectricEnginesCar" target="_blank">
            <font-awesome-icon :icon="['fab', 'facebook']" size="2x" />
          </a>
          <a href="https://www.instagram.com/electric_engines" target="_blank">
            <font-awesome-icon :icon="['fab', 'instagram']" size="2x" />
          </a>
        </div>
      </el-col>
    </el-row>
  </el-footer>
</template>

<style lang="scss" scoped>
.el-footer {
  flex-shrink: 0;
  background-color: #333;
  color: white;
  padding: 15px 0;
}
.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.footer-text {
  font-size: 14px;
  opacity: 0.8;
}
.footer-social {
  a {
    text-decoration: none;
    color: white;
    margin: 0 8px;
    transition: color 0.2s;
  }
  .fa-facebook:hover { color: rgb(112, 162, 255); }
  .fa-instagram:hover { color: rgb(255, 112, 112); }
}
</style>
