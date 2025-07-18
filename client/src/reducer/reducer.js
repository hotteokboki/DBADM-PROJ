import { defaultState } from "./defaultState"; // make sure defaultState is imported

const reducer = (state, action) => {
  switch (action.type) {
    case "SHOW_SIDEBAR":
      return { ...state, showSidebar: true }
    case "HIDE_SIDEBAR":
      return { ...state, showSidebar: false }
    case "SHOW_OVERLAY":
      // Only allow for overlay to show above 768px screen width
      if (state.screenWidth < 769) return state
      return { ...state, showingOverlay: true }
    case "HIDE_OVERLAY":
      return { ...state, showingOverlay: false }
    case "SHOW_CART":
      if (state.userRole === 2) return state // prevent admin from seeing cart
      return { ...state, showingCart: true }
    case "HIDE_CART":
      if (state.userRole === 2) return state // optional: allow hide anyway
      return { ...state, showingCart: false }
    case "INCREASE_AMOUNT":
      const increasedAmount = state.amount + 1
      return { ...state, amount: increasedAmount }
    case "DECREASE_AMOUNT":
      const decreasedAmount = () => {
        if (state.amount <= 0) return 0
        return state.amount - 1
      }
      return { ...state, amount: decreasedAmount() }
    case "ADD_TO_CART":
      if (state.userRole === 2) return state // admin cannot add to cart
      const { item, amount } = action.payload
      const hasItem = state.cart.find((product) => {
        return product.productId === item.productId
      })
      if (hasItem) {
        const updatedItem = { ...hasItem, amount }
        return { ...state, amount: 0, cart: [updatedItem] }
      } else {
        const newItem = { ...item, amount }
        return { ...state, amount: 0, cart: [...state.cart, newItem] }
      }
    case "UPDATE_CART":
      return { ...state }
    case "REMOVE_ITEM":
      // const { id: itemId } = action.payload
      // const newCart = state.cart.filter((product) => {
      //   return product.productId !== itemId
      // })
      return { ...state, cart: [] }
    case "GET_TOTAL_CART":
      const totalCartCount = state.cart.reduce((total, currentItem) => {
        return total + currentItem.amount
      }, 0)
      return { ...state, totalCartSize: totalCartCount }
    case "READ_SCREENWIDTH":
      return { ...state, screenWidth: action.payload }
    case "SET_USER_ROLE":
      return { ...state, userRole: action.payload }
    case "RESET_ALL":
      return {
        ...defaultState,
        screenWidth: state.screenWidth, // optional: preserve this
      };
    case "SHOW_SNACKBAR":
      return {
        ...state,
        snackbar: {
          message: action.payload.message,
          type: action.payload.type,
          visible: true,
        },
      }
    case "HIDE_SNACKBAR":
      return {
        ...state,
        snackbar: {
          ...state.snackbar,
          visible: false,
        },
      }
    default:
      return state
  }
}

export default reducer
