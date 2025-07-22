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
      return {
        ...state,
        amounts: {
          ...state.amounts,
          [action.payload]: (state.amounts[action.payload] || 1) + 1,
        },
      }

    case "DECREASE_AMOUNT":
      return {
        ...state,
        amounts: {
          ...state.amounts,
          [action.payload]: Math.max((state.amounts[action.payload] || 1) - 1, 1),
        },
      }
    case "ADD_TO_CART":
      if (state.userRole === 2) return state; // admin cannot add to cart

      const { item, amount } = action.payload;
      const existingItemIndex = state.cart.findIndex(
        (product) => product.productId === item.productId
      );

      // Remove product's amount entry from state.amounts
      const updatedAmounts = { ...state.amounts };
      delete updatedAmounts[item.productId];

      if (existingItemIndex !== -1) {
        // Update existing item quantity
        const updatedCart = [...state.cart];
        const existingItem = updatedCart[existingItemIndex];
        updatedCart[existingItemIndex] = {
          ...existingItem,
          amount: existingItem.amount + amount,
        };
        return { ...state, cart: updatedCart, amounts: updatedAmounts };
      } else {
        // Add new item
        const newItem = { ...item, amount };
        return { ...state, cart: [...state.cart, newItem], amounts: updatedAmounts };
      }

    case "UPDATE_CART":
      return { ...state }
    case "LOAD_CART_FROM_DB":
      return {
        ...state,
        cart: action.payload.cart,
        amounts: action.payload.amounts,
      }
    case "REMOVE_ITEM": {
      const { id: itemId } = action.payload;
      const newCart = state.cart.filter((product) => product.productId !== itemId);
      return { ...state, cart: newCart };
    }
    case "GET_TOTAL_CART":
      return { ...state, totalCartSize: state.cart.length }
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
