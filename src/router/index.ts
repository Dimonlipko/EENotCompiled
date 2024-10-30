import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

import Batteries from '../views/Batteries.vue'
import Blog from '../views/Blog.vue'
import Checkout from '../views/Checkout.vue'
import Contact from '../views/Contact.vue'
import PageNotFound from '../views/PageNotFound.vue'
import Product from '../views/ProductPage.vue'
import Service from '../views/Service.vue'
import Shop from '../views/Shop.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Shop',
    component: Shop,
  },
  {
    path: '/blog',
    name: 'Blog',
    component: Blog,
  },
  {
    path: '/batteries',
    name: 'Batteries',
    component: Batteries,
  },
  {
    path: '/service',
    name: 'Service',
    component: Service,
  },
  {
    path: '/contact',
    name: 'Contact',
    component: Contact,
  },
  {
    path: '/shop',
    name: 'Shop',
    component: Shop,
  },
  {
    path: '/shop/product/:id',
    name: 'Product',
    component: Product,
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: Checkout,
  },
  {
    path: '*',
    name: '404',
    component: PageNotFound,
  },
]

const router = new VueRouter({
  mode: 'history',
  routes,
})

export default router
