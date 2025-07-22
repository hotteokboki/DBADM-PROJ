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
  const [loading, setLoading] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({}); // ✅ NEW - Store exchange rates
  const [convertedPrices, setConvertedPrices] = useState({}); // ✅ NEW - Store converted prices

  // ✅ NEW - Fetch exchange rates
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
          console.log("✅ Exchange rates fetched:", res.data.rates);
        }
      } catch (err) {
        console.error("❌ Failed to fetch exchange rates:", err);
      }
    };

    fetchExchangeRates();
  }, []);

  // Fetch available currencies on component mount
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        console.log("🔍 Fetching currencies...");

        const res = await axios.get(
          `${
            import.meta.env.VITE_WEB_APP_BACKEND_PORT
          }/api/checkout/currencies`,
          { withCredentials: true }
        );

        console.log("✅ Response received:", res.data);

        if (res.data.success) {
          setAvailableCurrencies(res.data.currencies);
          console.log("✅ Currencies set:", res.data.currencies);
        } else {
          console.error("❌ API returned success: false", res.data);
        }
      } catch (err) {
        console.error("❌ Failed to fetch currencies:", err);
        console.error("❌ Error details:", err.response?.data);
      }
    };

    fetchCurrencies();
  }, []);

  // Update selected currency when user preference changes
  useEffect(() => {
    setSelectedCurrency(state.user?.preferredCurrency || "PHP");
  }, [state.user?.preferredCurrency]);

  // ✅ NEW - Convert prices when currency or cart changes
  useEffect(() => {
    if (!exchangeRates || Object.keys(exchangeRates).length === 0) {
      return;
    }

    const convertPrices = () => {
      const converted = {};

      state.cart.forEach((item) => {
        const basePrice = parseFloat(item.productPrice) || 0;
        let actualPrice = basePrice;

        // Apply discounts first (in original currency)
        if (item.isOnSale) {
          if (item.discountType === "percentage") {
            actualPrice = basePrice * (1 - item.discountValue / 100);
          } else if (item.discountType === "fixed") {
            actualPrice = basePrice - item.discountValue;
          }
        }

        // Convert to selected currency
        const baseCurrency = "PHP"; // Your base currency
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

  const handleCheckout = async () => {
    console.log("🔵 Checkout button clicked!");

    try {
      // Validation checks
      if (!state.user || !state.user.id) {
        alert("Please log in to checkout");
        return;
      }

      if (!state.cart || state.cart.length === 0) {
        alert("Your cart is empty");
        return;
      }

      const userId = state.user.id;
      const addressId = state.user.defaultAddressId || null;
      const paymentMode = "Credit Card";
      const currencyCode = selectedCurrency;

      // Map cart items to match backend expectations
      const cartItems = state.cart.map((item) => ({
        productId: item.productId,
        quantity: item.amount,
      }));

      console.log("🔵 Prepared cart items:", cartItems);
      console.log("🔵 Selected currency:", currencyCode);

      // Show loading state
      setLoading(true);
      dispatch({ type: "SET_LOADING", payload: true });

      const res = await axios.post(
        `${import.meta.env.VITE_WEB_APP_BACKEND_PORT}/api/checkout`,
        {
          userId,
          addressId,
          paymentMode,
          currencyCode,
          cartItems,
        },
        {
          withCredentials: true,
        }
      );

      if (res.data.success) {
        alert(`Checkout successful! 
Reference Code: ${res.data.referenceCode}
Order ID: ${res.data.orderId}
Total: ${selectedCurrency} ${res.data.totalAmount}
Currency: ${currencyCode}
Items: ${res.data.itemCount}`);

        dispatch({ type: "CLEAR_CART" });
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

  // ✅ UPDATED - Calculate total with converted prices
  const calculateTotal = () => {
    if (!state.cart || state.cart.length === 0) {
      return "0.00";
    }

    return state.cart
      .reduce((total, item) => {
        const convertedData = convertedPrices[item.productId];
        if (!convertedData) {
          return total; // Skip if conversion not ready
        }

        const convertedPrice = convertedData.convertedPrice;
        const quantity = parseInt(item.amount) || 0;

        return total + convertedPrice * quantity;
      }, 0)
      .toFixed(2);
  };

  // ✅ NEW - Get individual item price in selected currency
  const getItemPrice = (item) => {
    const convertedData = convertedPrices[item.productId];
    if (!convertedData) {
      return parseFloat(item.productPrice) || 0; // Fallback to original price
    }
    return convertedData.convertedPrice;
  };

  // ✅ NEW - Get currency symbol
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
            // ✅ FIXED - Create enhanced cart item props but use original component
            const convertedPrice = getItemPrice(cartItem);
            const currencySymbol = getCurrencySymbol(selectedCurrency);

            // Create enhanced item with converted price and currency info
            const enhancedCartItem = {
              ...cartItem,
              // Override price display with converted price
              displayPrice: convertedPrice,
              displayCurrency: selectedCurrency,
              displayCurrencySymbol: currencySymbol,
              // Keep original props for functionality
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
          <div className="currency-selection">
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

          {/* Show warning if no address */}
          {!state.user?.defaultAddressId && (
            <p className="address-warning">
              ⚠️ No shipping address set. You'll need to provide one during
              checkout.
            </p>
          )}

          <Button func={handleCheckout} disabled={loading || state.loading}>
            {loading || state.loading
              ? "Processing..."
              : `Checkout in ${selectedCurrency}`}
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

    .currency-selection {
      margin-bottom: 1.6rem;

      label {
        display: block;
        font-size: 1.4rem;
        font-weight: 600;
        margin-bottom: 0.8rem;
        color: hsl(var(--dark-grayish-blue));
      }

      select {
        width: 100%;
        padding: 1rem;
        border: 1px solid hsl(var(--divider));
        border-radius: 0.5rem;
        font-size: 1.4rem;
        background-color: hsl(var(--white));
        cursor: pointer;

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

    .address-warning {
      background-color: #fff3cd;
      color: #856404;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1.6rem;
      font-size: 1.4rem;
      text-align: center;
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
