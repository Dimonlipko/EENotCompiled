<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class HeaderComponent extends Vue {
  activeIndex = '1'
  menuIsActive = false
  windowWidth = 0
  windowWidthFlag = true
  lang: string = localStorage.getItem('preferredLanguage') || 'ua'

  menuItems = [
    { path: '/', labelKey: 'menu.shop' },
    { path: '/batteries', labelKey: 'menu.batteries' },
    { path: '/service', labelKey: 'menu.service' },
    { path: '/contact', labelKey: 'menu.contact' },
    { path: '/blog', labelKey: 'menu.blog' },
  ]

  menuNav() {
    this.menuIsActive = !this.menuIsActive
    if (this.menuIsActive) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = scrollbarWidth + 'px'
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }

  switchLang() {
    this.$i18n.locale = this.lang
    localStorage.setItem('preferredLanguage', this.lang)
  }

  getWindowWidth() {
    this.windowWidth = document.documentElement.clientWidth
    this.windowWidthFlag = this.windowWidth > 960
    if (this.windowWidthFlag && this.menuIsActive) {
      this.menuIsActive = false
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }

  mounted() {
    this.$nextTick(() => {
      window.addEventListener('resize', this.getWindowWidth)
      this.getWindowWidth()
    })
  }

  beforeDestroy() {
    window.removeEventListener('resize', this.getWindowWidth)
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
  }
}
</script>

<template>
  <div>
    <el-header height="auto">
      <el-row type="flex" justify="space-between">
        <el-col class="header-logo" :span="12">
          <router-link to="/"><img src="/E-Engines_logo_white.svg" alt="logo" /></router-link>
        </el-col>
        <el-col class="header-menu" :span="12">
          <el-button
            v-if="!windowWidthFlag"
            plain
            size="mini"
            class="mobile-nav"
            :class="{ 'is-sidebar-open': menuIsActive }"
            @click="menuNav"
          >
            <i class="el-icon-menu" />
          </el-button>
          <el-menu
            v-if="windowWidthFlag"
            id="horizontalMenu"
            :router="true"
            mode="horizontal"
            :default-active="activeIndex"
            background-color="#333"
            text-color="#fff"
            active-text-color="#00ddc0"
          >
            <el-menu-item v-for="item in menuItems" :key="item.path">
              <router-link :to="item.path">
                {{ $t(item.labelKey) }}
              </router-link>
            </el-menu-item>
          </el-menu>
          <el-radio-group v-model="lang" @change="switchLang" size="mini">
            <el-radio-button label="ua">
              Ua
            </el-radio-button>
            <el-radio-button label="en">
              En
            </el-radio-button>
          </el-radio-group>
        </el-col>
      </el-row>
    </el-header>

    <!-- Mobile sidebar overlay -->
    <div
      class="sidebar-overlay"
      :class="{ active: menuIsActive }"
      @click="menuNav"
    />

    <!-- Mobile sidebar -->
    <nav class="sidebar"
:class="{ open: menuIsActive }">
      <div class="sidebar-title">
        <img
src="/E-Engines_logo_white.svg" alt="logo" />
      </div>
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="sidebar-link"
        @click.native="menuNav"
      >
        {{ $t(item.labelKey) }}
      </router-link>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
.el-header {
  padding: 0;
  position: relative;
  background-color: #333;
  z-index: 1;
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
    &.is-active a {
      color: #00ddc0;
    }
  }
}

.mobile-nav {
  margin: 15px 10px;
  font-size: 14px;
  height: 29px;
  padding: 0 5px;

  &.is-sidebar-open {
    background-color: #00ddc0 !important;
    border-color: #00ddc0 !important;
    color: #fff !important;
  }
}
.header-logo {
  display: flex;
  max-width: 220px;
  img {
    height: 49px;
    margin: 5px 10px;
    max-width: 100%;
    object-fit: contain;
  }
}
.el-radio-group {
  margin: 15px 10px;
  ::v-deep .el-radio-button__inner {
    padding: 5px 10px;
    font-size: 14px;
    line-height: 17px;
  }
}
.el-menu-item {
  a {
    display: block;
  }
}

/* Sidebar */
.sidebar {
  background-color: #333;
  color: white;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 220px;
  display: flex;
  flex-direction: column;
  padding-top: 20px;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 1000;
  overflow-y: auto;

  &.open {
    transform: translateX(0);
  }
}

.sidebar-title {
  display: block;
  padding: 10px 0 20px;
  width: 100%;
  text-align: center;
  img {
    width: 90%;
    max-width: 200px;
    height: auto;
    margin: 0 auto;
    display: block;
  }
}

.sidebar-link {
  display: block;
  padding: 14px 20px;
  color: #ccc;
  text-decoration: none;
  border-bottom: 1px solid #444;
  font-size: 15px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #444;
  }

  &.router-link-exact-active {
    color: #00ddc0;
    border-left: 3px solid #00ddc0;
  }
}

/* Overlay */
.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;

  &.active {
    display: block;
  }
}
</style>
