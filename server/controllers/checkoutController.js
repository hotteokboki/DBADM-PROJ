const checkoutModel = require("../models/checkoutModel");

exports.checkout = async (req, res) => {
  try {
    const { userId, cartItems, addressId, paymentMode, currencyCode } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required" 
      });
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Cart items are required and cannot be empty" 
      });
    }

    if (!paymentMode) {
      return res.status(400).json({ 
        success: false, 
        message: "Payment method is required" 
      });
    }

    // ✅ NEW - Currency code validation (optional, defaults to PHP if not provided)
    if (currencyCode && typeof currencyCode !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Currency code must be a valid string"
      });
    }

    // Validate cart items structure
    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid cart item at index ${i}. Product ID and valid quantity are required.`
        });
      }
    }

    // Process checkout - addressId can now be null, currencyCode defaults to PHP
    const result = await checkoutModel.processCheckout({ 
      userId, 
      cartItems, 
      addressId: addressId || null,
      paymentMode,
      currencyCode: currencyCode || 'PHP' // ✅ Default to PHP if not provided
    });
    
    return res.status(200).json(result);
    
  } catch (error) {
    console.error("Checkout controller error:", error);
    
    // Handle specific error types
    if (error.message.includes('Insufficient stock') || 
        error.message.includes('not available') ||
        error.message.includes('Invalid address') ||
        error.message.includes('Invalid currency') ||
        error.message.includes('Currency conversion not available')) { // ✅ NEW error type
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    // Generic server error
    return res.status(500).json({ 
      success: false, 
      message: "An error occurred during checkout. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add this to your checkoutController.js

// ✅ NEW - Get exchange rates endpoint
exports.getExchangeRates = async (req, res) => {
  console.log("🔍 Getting exchange rates...");
  
  try {
    const mySQL = require("../config/database.js");
    const connection = await mySQL.getConnection();
    
    try {
      console.log("🔍 Querying currency table for exchange rates...");
      
      const [rates] = await connection.query(
        `SELECT currency_code, exchange_rate_to_base 
         FROM currency 
         ORDER BY currency_code`
      );
      
      console.log("🔍 Exchange rates query result:", rates);
      
      // Convert array to object for easier lookup
      const ratesObject = {};
      rates.forEach(rate => {
        ratesObject[rate.currency_code] = parseFloat(rate.exchange_rate_to_base);
      });
      
      res.status(200).json({
        success: true,
        rates: ratesObject,
        message: `Found ${rates.length} exchange rates`
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Get exchange rates error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch exchange rates",
      error: error.message
    });
  }
};

// ✅ NEW - Helper endpoint to get available currencies
exports.getAvailableCurrencies = async (req, res) => {
  console.log("🔍 Getting available currencies...");
  
  try {
    const mySQL = require("../config/database.js");
    const connection = await mySQL.getConnection();
    
    try {
      console.log("🔍 Querying currency_codes table...");
      
      const [currencies] = await connection.query(
        `SELECT currency_code, currency_name 
         FROM currency_codes 
         ORDER BY currency_name`
      );
      
      console.log("🔍 Query result:", currencies);
      
      res.status(200).json({
        success: true,
        currencies,
        message: `Found ${currencies.length} currencies`
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Get currencies error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch available currencies",
      error: error.message
    });
  }
};