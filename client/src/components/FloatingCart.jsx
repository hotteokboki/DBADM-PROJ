import styled from "styled-components";
import SingleCartItem from "./SingleCartItem";
import Button from "../components/Button";
import { useGlobalContext } from "../context/context";
import { useState, useEffect } from "react";
import axios from "axios";

const FloatingCart = ({ className }) => {
  const { state, dispatch } = useGlobalContext();
  const [availableCurrencies, setAvailableCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(
    state.user?.preferredCurrency || "PHP"
  );
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("Credit Card");
  const [loading, setLoading] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({});
  const [convertedPrices, setConvertedPrices] = useState({});
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  // ✅ FIXED - Better state management for address selection
  const [useNewAddress, setUseNewAddress] = useState(null); // null = not determined yet
  const [addressesLoaded, setAddressesLoaded] = useState(false);

  // ✅ Address form state
  const [addressForm, setAddressForm] = useState({
    phone_number: "",
    street_address: "",
    city: "",
    province: "",
    postal_code: "",
    country: "",
  });

  const paymentModeOptions = [
    { value: "Credit Card", label: "Credit Card" },
    { value: "COD", label: "Cash on Delivery (COD)" },
    { value: "GCash", label: "GCash" },
  ];

  // ✅ UPDATED - Fetch user addresses with better state management
  useEffect(() => {
    const fetchUserAddresses = async () => {
      if (!state.user?.id) {
        console.log("🔍 No user ID available, skipping address fetch");
        setAddressesLoaded(true);
        setUseNewAddress(true); // Default to new address if no user
        return;
      }

      console.log("🔍 Fetching addresses for user:", state.user.id);

      try {
        // In FloatingCart.js - Fix the API endpoint
        const res = await axios.get(
          `${import.meta.env.VITE_WEB_APP_BACKEND_PORT}/api/users/addresses`,
          { withCredentials: true }
        );

        console.log("🔍 Address fetch response:", res.data);

        if (res.data.success) {
          setUserAddresses(res.data.addresses);

          if (res.data.addresses.length > 0) {
            // User has existing addresses - default to using existing
            const defaultAddress =
              res.data.addresses.find((addr) => addr.is_default) ||
              res.data.addresses[0];
            setSelectedAddressId(defaultAddress.address_id);
            setUseNewAddress(false); // ✅ Use existing address by default
            console.log(
              "🔍 Selected existing address:",
              defaultAddress.address_id
            );
          } else {
            // No existing addresses - force new address
            setUseNewAddress(true);
            console.log("🔍 No existing addresses, using new address form");
          }
        } else {
          // API call succeeded but no addresses found
          setUseNewAddress(true);
        }
      } catch (err) {
        console.error("Failed to fetch user addresses:", err);
        // If fetch fails, default to new address
        setUseNewAddress(true);
      } finally {
        setAddressesLoaded(true);
      }
    };

    fetchUserAddresses();
  }, [state.user?.id]);

  // Fetch exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_WEB_APP_BACKEND_PORT
          }/api/checkout/exchange-rates`,
          { withCredentials: true }
        );

        if (res.data.success) {
          setExchangeRates(res.data.rates);
        }
      } catch (err) {
        console.error("Failed to fetch exchange rates:", err);
      }
    };

    fetchExchangeRates();
  }, []);

  // Fetch available currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_WEB_APP_BACKEND_PORT
          }/api/checkout/currencies`,
          { withCredentials: true }
        );

        if (res.data.success) {
          setAvailableCurrencies(res.data.currencies);
        }
      } catch (err) {
        console.error("Failed to fetch currencies:", err);
      }
    };

    fetchCurrencies();
  }, []);

  // Update selected currency when user preference changes
  useEffect(() => {
    setSelectedCurrency(state.user?.preferredCurrency || "PHP");
  }, [state.user?.preferredCurrency]);

  // Convert prices when currency or cart changes
  useEffect(() => {
    if (!exchangeRates || Object.keys(exchangeRates).length === 0) {
      return;
    }

    const convertPrices = () => {
      const converted = {};

      state.cart.forEach((item) => {
        const basePrice = parseFloat(item.productPrice) || 0;
        let actualPrice = basePrice;

        if (item.isOnSale) {
          if (item.discountType === "percentage") {
            actualPrice = basePrice * (1 - item.discountValue / 100);
          } else if (item.discountType === "fixed") {
            actualPrice = basePrice - item.discountValue;
          }
        }

        const baseCurrency = "PHP";
        let convertedPrice = actualPrice;

        if (selectedCurrency !== baseCurrency) {
          const fromRate = exchangeRates[baseCurrency] || 1;
          const toRate = exchangeRates[selectedCurrency] || 1;
          convertedPrice = (actualPrice / fromRate) * toRate;
        }

        converted[item.productId] = {
          originalPrice: basePrice,
          actualPrice: actualPrice,
          convertedPrice: convertedPrice,
          isOnSale: item.isOnSale,
          discountType: item.discountType,
          discountValue: item.discountValue,
        };
      });

      setConvertedPrices(converted);
    };

    convertPrices();
  }, [selectedCurrency, exchangeRates, state.cart]);

  // Handle address form changes
  const handleAddressFormChange = (field, value) => {
    setAddressForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Validate address form
  const validateAddressForm = () => {
    const required = [
      "street_address",
      "city",
      "province",
      "postal_code",
      "country",
    ];
    for (const field of required) {
      if (!addressForm[field].trim()) {
        return `${field
          .replace("_", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase())} is required`;
      }
    }
    return null;
  };

  // ✅ UPDATED - Better checkout validation and handling
  const handleCheckout = async () => {
    try {
      if (!state.user || !state.user.id) {
        alert("Please log in to checkout");
        return;
      }

      if (!state.cart || state.cart.length === 0) {
        alert("Your cart is empty");
        return;
      }

      // ✅ Wait for addresses to load before validating
      if (!addressesLoaded) {
        alert("Please wait for address information to load");
        return;
      }

      // ✅ FIXED - Address validation with better logic
      if (useNewAddress === true) {
        const validationError = validateAddressForm();
        if (validationError) {
          alert(validationError);
          return;
        }
      } else if (useNewAddress === false) {
        // Using existing address
        if (!selectedAddressId) {
          alert("Please select a shipping address");
          return;
        }
      } else {
        // useNewAddress is still null - addresses not loaded yet
        alert("Please wait for address information to load");
        return;
      }

      console.log("🔍 Checkout validation passed:", {
        useNewAddress,
        selectedAddressId,
        addressForm: useNewAddress ? addressForm : null,
      });

      const userId = state.user.id;
      const paymentMode = selectedPaymentMode;
      const currencyCode = selectedCurrency;

      const cartItems = state.cart.map((item) => ({
        productId: item.productId,
        quantity: item.amount,
      }));

      setLoading(true);
      dispatch({ type: "SET_LOADING", payload: true });

      // ✅ Prepare checkout data
      const checkoutData = {
        userId,
        paymentMode,
        currencyCode,
        cartItems,
      };

      if (useNewAddress) {
        checkoutData.newAddress = addressForm;
      } else {
        checkoutData.addressId = selectedAddressId;
      }

      console.log("🔍 Checkout data being sent:", checkoutData);

      const res = await axios.post(
        `${import.meta.env.VITE_WEB_APP_BACKEND_PORT}/api/checkout`,
        checkoutData,
        { withCredentials: true }
      );

      if (res.data.success) {
        alert(`Checkout successful! 
Reference Code: ${res.data.referenceCode}
Order ID: ${res.data.orderId}
Total: ${selectedCurrency} ${res.data.totalAmount}
Currency: ${currencyCode}
Payment Mode: ${paymentMode}
Items: ${res.data.itemCount}`);

        dispatch({ type: "CLEAR_CART" });

        // Reset form after successful checkout
        if (useNewAddress) {
          setAddressForm({
            phone_number: "",
            street_address: "",
            city: "",
            province: "",
            postal_code: "",
            country: "",
          });
        }
        setSelectedPaymentMode("Credit Card");
      } else {
        alert(`Checkout failed: ${res.data.message}`);
      }
    } catch (err) {
      console.error("Checkout error:", err);

      if (err.response && err.response.data && err.response.data.message) {
        alert(`Checkout failed: ${err.response.data.message}`);
      } else if (err.response && err.response.status === 400) {
        alert("Please check your cart items and shipping information");
      } else if (err.response && err.response.status === 500) {
        alert("Server error. Please try again later");
      } else {
        alert("Network error. Please check your connection and try again");
      }
    } finally {
      setLoading(false);
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const calculateTotal = () => {
    if (!state.cart || state.cart.length === 0) {
      return "0.00";
    }

    return state.cart
      .reduce((total, item) => {
        const convertedData = convertedPrices[item.productId];
        if (!convertedData) return total;

        const convertedPrice = convertedData.convertedPrice;
        const quantity = parseInt(item.amount) || 0;

        return total + convertedPrice * quantity;
      }, 0)
      .toFixed(2);
  };

  const getItemPrice = (item) => {
    const convertedData = convertedPrices[item.productId];
    if (!convertedData) {
      return parseFloat(item.productPrice) || 0;
    }
    return convertedData.convertedPrice;
  };

  const getCurrencySymbol = (currencyCode) => {
    const symbols = {
      PHP: "₱",
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
    };
    return symbols[currencyCode] || currencyCode;
  };

  return (
    <FloatingCartWrapper className={className}>
      <header>
        <p>Cart ({state.cart.length} items)</p>
      </header>
      <div className="divider"></div>
      <ul className="cart-items">
        {state.cart.length > 0 ? (
          state.cart.map((cartItem) => {
            const convertedPrice = getItemPrice(cartItem);
            const currencySymbol = getCurrencySymbol(selectedCurrency);

            const enhancedCartItem = {
              ...cartItem,
              displayPrice: convertedPrice,
              displayCurrency: selectedCurrency,
              displayCurrencySymbol: currencySymbol,
              convertedPrice: convertedPrice,
              selectedCurrency: selectedCurrency,
              currencySymbol: currencySymbol,
            };

            return (
              <SingleCartItem key={cartItem.productId} {...enhancedCartItem} />
            );
          })
        ) : (
          <p className="empty">Your cart is empty.</p>
        )}
      </ul>
      {state.cart.length > 0 && (
        <div className="checkout-section">
          {/* Currency Selection */}
          <div className="form-group">
            <label htmlFor="currency-select">Currency:</label>
            <select
              id="currency-select"
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              disabled={loading || state.loading}
            >
              {availableCurrencies.map((currency) => (
                <option
                  key={currency.currency_code}
                  value={currency.currency_code}
                >
                  {currency.currency_code} - {currency.currency_name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Mode Selection */}
          <div className="form-group">
            <label htmlFor="payment-mode-select">Payment Mode:</label>
            <select
              id="payment-mode-select"
              value={selectedPaymentMode}
              onChange={(e) => setSelectedPaymentMode(e.target.value)}
              disabled={loading || state.loading}
            >
              {paymentModeOptions.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ UPDATED - Address Selection with loading state */}
          <div className="form-group">
            <label>Shipping Address:</label>

            {/* Show loading state while addresses are being fetched */}
            {!addressesLoaded && (
              <div className="loading-addresses">
                <p>Loading address information...</p>
              </div>
            )}

            {/* Show address options only after addresses are loaded */}
            {addressesLoaded && (
              <>
                {/* Address Options - only show if user has existing addresses */}
                {userAddresses.length > 0 && (
                  <div className="address-options">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="addressOption"
                        checked={useNewAddress === false}
                        onChange={() => setUseNewAddress(false)}
                        disabled={loading || state.loading}
                      />
                      Use existing address
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="addressOption"
                        checked={useNewAddress === true}
                        onChange={() => setUseNewAddress(true)}
                        disabled={loading || state.loading}
                      />
                      Use new address
                    </label>
                  </div>
                )}

                {/* If no existing addresses, show info message */}
                {userAddresses.length === 0 && (
                  <div className="no-addresses-info">
                    <p
                      style={{
                        fontSize: "1.3rem",
                        color: "hsl(var(--dark-grayish-blue))",
                        marginBottom: "1rem",
                      }}
                    >
                      No saved addresses found. Please enter a new address
                      below.
                    </p>
                  </div>
                )}

                {/* Existing Address Selection */}
                {useNewAddress === false && userAddresses.length > 0 && (
                  <select
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    disabled={loading || state.loading}
                    className="address-select"
                  >
                    <option value="">Select an address</option>
                    {userAddresses.map((address) => (
                      <option
                        key={address.address_id}
                        value={address.address_id}
                      >
                        {address.full_name} - {address.street_address},{" "}
                        {address.city}, {address.province} {address.postal_code}
                        {address.is_default && " (Default)"}
                      </option>
                    ))}
                  </select>
                )}

                {/* New Address Form */}
                {(useNewAddress === true || userAddresses.length === 0) && (
                  <div className="address-form">
                    <div className="form-row">
                      <input
                        type="text"
                        placeholder="Phone Number"
                        value={addressForm.phone_number}
                        onChange={(e) =>
                          handleAddressFormChange(
                            "phone_number",
                            e.target.value
                          )
                        }
                        disabled={loading || state.loading}
                      />
                    </div>
                    <div className="form-row">
                      <input
                        type="text"
                        placeholder="Street Address *"
                        value={addressForm.street_address}
                        onChange={(e) =>
                          handleAddressFormChange(
                            "street_address",
                            e.target.value
                          )
                        }
                        disabled={loading || state.loading}
                        required
                      />
                    </div>
                    <div className="form-row two-columns">
                      <input
                        type="text"
                        placeholder="City *"
                        value={addressForm.city}
                        onChange={(e) =>
                          handleAddressFormChange("city", e.target.value)
                        }
                        disabled={loading || state.loading}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Province *"
                        value={addressForm.province}
                        onChange={(e) =>
                          handleAddressFormChange("province", e.target.value)
                        }
                        disabled={loading || state.loading}
                        required
                      />
                    </div>
                    <div className="form-row two-columns">
                      <input
                        type="text"
                        placeholder="Postal Code *"
                        value={addressForm.postal_code}
                        onChange={(e) =>
                          handleAddressFormChange("postal_code", e.target.value)
                        }
                        disabled={loading || state.loading}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Country *"
                        value={addressForm.country}
                        onChange={(e) =>
                          handleAddressFormChange("country", e.target.value)
                        }
                        disabled={loading || state.loading}
                        required
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="total">
            <span>
              Estimated Total: {getCurrencySymbol(selectedCurrency)}{" "}
              {calculateTotal()}
              {selectedCurrency !== "PHP" && (
                <small className="conversion-note">
                  *Converted from PHP at current rates
                </small>
              )}
            </span>
          </div>

          <Button func={handleCheckout} disabled={loading || state.loading}>
            {loading || state.loading
              ? "Processing..."
              : `Checkout with ${selectedPaymentMode}`}
          </Button>
        </div>
      )}
    </FloatingCartWrapper>
  );
};

const FloatingCartWrapper = styled.div`
  display: none;
  position: absolute;
  border-radius: 1rem;
  background-color: hsl(var(--white));
  top: 6rem;
  right: -1.6rem;
  margin: 0 auto;
  z-index: 1000;
  width: 36rem;
  box-shadow: 0 2rem 5rem -2rem hsl(var(--black) / 0.9);

  &.active {
    display: block;
  }

  header {
    padding: 2.4rem 2.4rem 0 2.4rem;
    margin-bottom: 2.7rem;

    p {
      font-size: 1.6rem;
      font-weight: 700;
    }
  }

  .divider {
    width: 100%;
    height: 0.1rem;
    background-color: hsl(var(--divider));
  }

  .cart-items {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 2.4rem;
    min-height: 18.8rem;
    gap: 2.4rem;

    .empty {
      text-align: center;
      font-size: 1.6rem;
      line-height: 2.6rem;
      font-weight: 700;
      color: hsl(var(--dark-grayish-blue));
    }
  }

  .checkout-section {
    padding: 2.4rem;
    padding-top: 0;

    .form-group {
      margin-bottom: 1.6rem;

      label {
        display: block;
        font-size: 1.4rem;
        font-weight: 600;
        margin-bottom: 0.8rem;
        color: hsl(var(--dark-grayish-blue));
      }

      select,
      textarea,
      input {
        width: 100%;
        padding: 1rem;
        border: 1px solid hsl(var(--divider));
        border-radius: 0.5rem;
        font-size: 1.4rem;
        background-color: hsl(var(--white));
        font-family: inherit;

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        &:focus {
          outline: none;
          border-color: hsl(var(--primary-color));
          box-shadow: 0 0 0 0.3rem hsl(var(--primary-color) / 0.1);
        }
      }

      select {
        cursor: pointer;
      }

      /* ✅ Loading and info states */
      .loading-addresses {
        padding: 1rem;
        text-align: center;
        color: hsl(var(--dark-grayish-blue));
        font-style: italic;
      }

      .no-addresses-info {
        padding: 1rem;
        background-color: hsl(210, 100%, 97%);
        border: 1px solid hsl(210, 100%, 90%);
        border-radius: 0.5rem;
        margin-bottom: 1rem;
      }

      /* Address options styling */
      .address-options {
        display: flex;
        gap: 1.5rem;
        margin-bottom: 1rem;

        .radio-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.3rem;
          font-weight: 400;
          cursor: pointer;

          input[type="radio"] {
            width: auto;
            margin: 0;
          }
        }
      }

      .address-select {
        margin-top: 0.5rem;
      }

      /* Address form styling */
      .address-form {
        margin-top: 1rem;

        .form-row {
          margin-bottom: 1rem;

          &.two-columns {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }

          input {
            margin: 0;
          }
        }
      }
    }

    .total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.6rem;
      font-size: 1.8rem;
      font-weight: 700;

      span {
        color: hsl(var(--primary-color));
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        .conversion-note {
          font-size: 1.2rem;
          font-weight: 400;
          color: hsl(var(--dark-grayish-blue));
          margin-top: 0.4rem;
        }
      }
    }

    button {
      width: 100%;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
`;

export default FloatingCart;
