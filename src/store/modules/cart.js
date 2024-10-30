import i18n from '../../i18n'

// initial state
const state = () => ({
  items: [],
  checkoutStatus: null,
})

// getters
const getters = {
  cartProducts: (state, getters, rootState) => {
    return state.items.map(({ id, quantity }) => {
      const product = rootState.products.all.find(product => product.id === id)
      return {
        id: product.id,
        title: product.title,
        price: product.price,
        images: product.images,
        configurator: product.configurator,
        checked: product.checked,
        checkList: product.checkList,
        totalPrice: product.totalPrice,
        quantity,
      }
    })
  },

  cartTotalPrice: (state, getters) => {
    return getters.cartProducts.reduce((total, product) => {
      return (
        total +
        (product.totalPrice ? product.totalPrice : product.price) *
          product.quantity
      )
    }, 0)
  },

  itemsInCart: (state, getters) => {
    return getters.cartProducts.reduce(
      (count, product) => count + product.quantity,
      0
    )
  },
}

// actions
const actions = {
  checkout({ commit, state, dispatch }) {
    commit('setCheckoutStatus', null)
    // Empty cart after successful order
    commit('setCartItems', { items: [] })

    // Simulate a successful checkout process
    commit('setCheckoutStatus', 'successful')

    // Notify the user about the successful checkout
    dispatch('notifySuccess', 'Ваше замовлення успішно оформлено!')
  },

  clearCart({ commit }) {
    commit('clearCart')
  },

  addProductToCart({ state, commit, rootState, dispatch }, product) {
    commit('setCheckoutStatus', null)
    if (product.inventory > 0) {
      const cartItem = state.items.find(item => item.id === product.id)
      if (!cartItem) {
        commit('pushProductToCart', { id: product.id })

        // Notify user about the added product
        const message = i18n.t('notifications.addedToCart', {
          title: product.title,
        })
        dispatch('notifySuccess', message)
      } else {
        commit('incrementItemQuantity', cartItem)
      }
      // Remove 1 item from stock
      commit(
        'products/decrementProductInventory',
        { id: product.id },
        { root: true }
      )
    }
  },

  notifySuccess(_, message) {
    // Access the Vue instance for notifications
    this._vm.$notify({
      title: i18n.t('notifications.succesfullAddedToCart'),
      message: message,
      type: 'success',
      offset: 150,
      duration: 3000,
    })
  },
}

// mutations
const mutations = {
  pushProductToCart(state, { id }) {
    state.items.push({
      id,
      quantity: 1,
    })
  },

  clearCart(state) {
    state.items = []
  },

  incrementItemQuantity(state, { id }) {
    const cartItem = state.items.find(item => item.id === id)
    cartItem.quantity++
  },

  setCartItems(state, { items }) {
    state.items = items
  },

  setCheckoutStatus(state, status) {
    state.checkoutStatus = status
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}
