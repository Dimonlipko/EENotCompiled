<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component({})
export default class HeaderComponent extends Vue {
  activeIndex: string = "1";
  menuIsActive: boolean = false;
  windowWidth: number = 0;
  windowWidthFlag: boolean = true;
  lang: string = localStorage.getItem("preferredLanguage") || "ua"; // Завантажуємо збережену мову або встановлюємо "ua" як стандартну

  menuNav() {
    this.menuIsActive = !this.menuIsActive;
  }

  // Метод для зміни мови та збереження її в localStorage
  switchLang() {
    this.$i18n.locale = this.lang; // Оновлюємо мову додатка
    localStorage.setItem("preferredLanguage", this.lang); // Зберігаємо вибір мови
  }

  getWindowWidth() {
    this.windowWidth = document.documentElement.clientWidth;
    this.windowWidthFlag = this.windowWidth > 960;
  }

  mounted() {
    this.$nextTick(() => {
      window.addEventListener("resize", this.getWindowWidth);
      this.getWindowWidth(); // Ініціалізуємо ширину вікна
    });
  }

  beforeDestroy() {
    window.removeEventListener("resize", this.getWindowWidth);
  }
}
</script>

<template>
  <el-header height="auto">
    <el-row type="flex" justify="space-between">
      <el-col class="header-logo" :span="12">
        <a href="/"><img src="@/assets/img/logo.png" alt="logo" /></a>
      </el-col>
      <el-col class="header-menu" :span="12">
        <el-button plain size="mini" class="mobile-nav" @click="menuNav">
          <i v-if="menuIsActive" class="el-icon-close"></i>
          <i v-else class="el-icon-menu"></i>
        </el-button>
        <el-menu
          id="horizontalMenu"
          :router="true"
          v-if="windowWidthFlag"
          mode="horizontal"
          :default-active="activeIndex"
          :class="{ '': !menuIsActive, isOpen: menuIsActive }"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
        >
          <el-menu-item>
            <router-link to="/">{{ $t("menu.shop") }}</router-link>
          </el-menu-item>
          <el-menu-item>
            <router-link to="/batteries">{{ $t("menu.batteries") }}</router-link>
          </el-menu-item>
          <el-menu-item>
            <router-link to="/service">{{ $t("menu.service") }}</router-link>
          </el-menu-item>
          <el-menu-item>
            <router-link to="/contact">{{ $t("menu.contact") }}</router-link>
          </el-menu-item>
          <el-menu-item>
            <router-link to="/blog">{{ $t("menu.blog") }}</router-link>
          </el-menu-item>
        </el-menu>
        <el-menu
          v-else
          id="verticalMenu"
          mode="vertical"
          :default-active="activeIndex"
          :class="{ '': !menuIsActive, isOpen: menuIsActive }"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
        >
          <el-menu-item>
            <router-link @click.native="menuNav" to="/">{{ $t("menu.shop") }}</router-link>
          </el-menu-item>
          <el-menu-item>
            <router-link @click.native="menuNav" to="/batteries">{{ $t("menu.batteries") }}</router-link>
          </el-menu-item>
          <el-menu-item>
            <router-link @click.native="menuNav" to="/service">{{ $t("menu.service") }}</router-link>
          </el-menu-item>
          <el-menu-item>
            <router-link @click.native="menuNav" to="/contact">{{ $t("menu.contact") }}</router-link>
          </el-menu-item>
          <el-menu-item>
            <router-link @click.native="menuNav" to="/blog">{{ $t("menu.blog") }}</router-link>
          </el-menu-item>
        </el-menu>
        <el-radio-group @change="switchLang" v-model="lang" size="mini">
          <el-radio-button label="ua">Ua</el-radio-button>
          <el-radio-button label="en">En</el-radio-button>
        </el-radio-group>
      </el-col>
    </el-row>
  </el-header>
</template>

<style lang="scss" scoped>
.el-header {
  padding: 0;
  position: relative;
  background-color: #545c64;
}
.header-menu {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}
.el-menu--horizontal.el-menu {
  border: none;

  .el-menu-item {
    transition: none;
    background: transparent;
    a {
      display: block;
      height: 100%;
      font-size: 16px;
      text-decoration: none;
    }
    &.is-active {
      border: none;
    }
  }
}
#verticalMenu {
  display: none;
  position: fixed;
  top: 60px;
  width: 100%;
  height: 100%;
  text-align: center;
  a {
    color: white;
    text-decoration: none;
  }
  &.isOpen {
    display: block;
  }
  .el-menu-item.is-active > a {
    color: rgb(255, 208, 75);
  }
}

.mobile-nav {
  display: none;
  margin: 15px 10px;
  font-size: 14px;
  height: 29px;
  padding: 0 5px;
  @media (max-width: 960px) {
    display: block;
  }
}
.header-logo {
  display: flex;
  img {
    height: 49px;
    margin: 5px 10px;
  }
}
.el-radio-group {
  margin: 15px 10px;
}
.el-menu-item {
  a {
    display: block;
  }
}
</style>
