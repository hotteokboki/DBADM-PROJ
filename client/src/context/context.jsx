import { useEffect, useContext, createContext, useReducer } from "react"
import reducer from "../reducer/reducer"
import { defaultState } from "../reducer/defaultState"
import {
  SHOW_SIDEBAR,
  HIDE_SIDEBAR,
  SHOW_OVERLAY,
  HIDE_OVERLAY,
  SHOW_CART,
  HIDE_CART,
  READ_SCREENWIDTH,
  INCREASE_AMOUNT,
  DECREASE_AMOUNT,
  REMOVE_ITEM,
  ADD_TO_CART,
  UPDATE_CART,
  GET_TOTAL_CART,
} from "../reducer/actions"
import axios from "axios";

const AppContext = createContext()

const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, defaultState)

  // Inside AppProvider
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_WEB_APP_BACKEND_PORT}/auth/me`, {
          withCredentials: true,
        });
        if (response.data.success) {
          const role = response.data.user.role;
          console.log("SET USER ROLE VAL: ", role);
          dispatch({ type: "SET_USER_ROLE", payload: role });
        }
      } catch (err) {
        console.log("User not logged in or session expired.");
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_WEB_APP_BACKEND_PORT}/api/cart/get-cart-items`, {
          withCredentials: true
        });
        if (res.data.success) {
          dispatch({
            type: "LOAD_CART_FROM_DB",
            payload: {
              cart: res.data.cartItems, // from DB
              amounts: {}, // optional
            },
          });
        }
        console.log("Cart Items: ", res.data);
      } catch (err) {
        console.error("Failed to load cart from DB", err);
      }
    };

    fetchCart();
  }, []);


  const showSidebar = () => {
    dispatch({ type: SHOW_SIDEBAR })
  }

  const hideSidebar = () => {
    dispatch({ type: HIDE_SIDEBAR })
  }

  const showImageOverlay = () => {
    dispatch({ type: SHOW_OVERLAY })
  }

  const hideImageOverlay = () => {
    dispatch({ type: HIDE_OVERLAY })
  }

  const showCart = () => {
    dispatch({ type: SHOW_CART })
  }

  const hideCart = () => {
    dispatch({ type: HIDE_CART })
  }

  const increaseAmount = (id) => {
    dispatch({ type: "INCREASE_AMOUNT", payload: id });
  };

  const decreaseAmount = (id) => {
    dispatch({ type: "DECREASE_AMOUNT", payload: id });
  };

  const addToCart = (amount, item) => {
    if (!amount) return
    dispatch({
      type: ADD_TO_CART,
      payload: {
        item,
        amount,
      },
    })
  }

  const updateCart = () => {
    dispatch({ type: UPDATE_CART })
  }

  const getTotalCartAmount = () => {
    dispatch({ type: GET_TOTAL_CART })
  }

  const removeItem = (id) => {
    dispatch({ type: REMOVE_ITEM, payload: { id } })
  }

  const readScreenWidth = () => {
    dispatch({ type: READ_SCREENWIDTH, payload: window.innerWidth })
  }

  const showSnackbar = (message, type = "success") => {
    dispatch({ type: "SHOW_SNACKBAR", payload: { message, type } })

    setTimeout(() => {
      dispatch({ type: "HIDE_SNACKBAR" })
    }, 3000) // auto-hide after 3 seconds
  }

  useEffect(() => {
    getTotalCartAmount()
  }, [state.amount, state.cart])

  useEffect(() => {
    window.addEventListener("resize", readScreenWidth)
    // Cleanup function to remove eventlistener after reading screenwidth, hide overlay if showing when screen width is below 768
    if (state.screenWidth < 768 && state.showingOverlay) {
      dispatch({ type: HIDE_OVERLAY })
    }
    if (state.screenWidth > 768 && state.showSidebar) {
      dispatch({ type: HIDE_SIDEBAR })
    }

    return () => window.removeEventListener("resize", readScreenWidth)
  }, [state.screenWidth])

  return (
    <AppContext.Provider
      value={{
        state,
        showSidebar,
        hideSidebar,
        showImageOverlay,
        hideImageOverlay,
        showCart,
        hideCart,
        increaseAmount,
        decreaseAmount,
        addToCart,
        updateCart,
        removeItem,
        getTotalCartAmount,
        showSnackbar,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

const useGlobalContext = () => {
  return useContext(AppContext)
}

export { useGlobalContext, AppProvider }
