export const defaultState = {
  cart: [],
  amounts: {},
  totalCost: 0,
  totalCartSize: 0,
  showSidebar: false,
  screenWidth: window.innerWidth,
  showingOverlay: false,
  showingCart: false,
  userRole: null,
  snackbar: {
    message: "",
    type: "", // "success", "error", etc.
    visible: false,
  }
}
