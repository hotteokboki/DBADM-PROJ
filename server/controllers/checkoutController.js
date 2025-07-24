const checkoutModel = require("../models/checkoutModel");

exports.checkout = async (req, res) => {
  try {
    const { userId, cartItems, addressId, newAddress, paymentMode, currencyCode } = req.body;

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

    // ✅ UPDATED - Address validation (either existing or new)
    if (!addressId && !newAddress) {
      return res.status(400).json({
        success: false,
        message: "Either existing address ID or new address information is required"
      });
    }

    // ✅ NEW - Validate new address fields if provided
    if (newAddress) {
      const requiredFields = ['street_address', 'city', 'province', 'postal_code', 'country'];
      for (const field of requiredFields) {
        if (!newAddress[field] || typeof newAddress[field] !== 'string' || !newAddress[field].trim()) {
          return res.status(400).json({
            success: false,
            message: `${field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`
          });
        }
      }
    }

    // Currency code validation (optional, defaults to PHP if not provided)
    if (currencyCode && typeof currencyCode !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Currency code must be a valid string"
      });
    }

    // Payment mode validation
    const validPaymentModes = ['Credit Card', 'COD', 'GCash'];
    if (!validPaymentModes.includes(paymentMode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment mode. Must be one of: Credit Card, COD, GCash"
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

    // ✅ UPDATED - Process checkout with new parameters
    const result = await checkoutModel.processCheckout({ 
      userId, 
      cartItems, 
      addressId: addressId || null,
      newAddress: newAddress || null,
      paymentMode,
      currencyCode: currencyCode || 'PHP'
    });
    
    return res.status(200).json(result);
    
  } catch (error) {
    console.error("Checkout controller error:", error);
    
    // Handle specific error types
    if (error.message.includes('Insufficient stock') || 
        error.message.includes('not available') ||
        error.message.includes('Invalid address') ||
        error.message.includes('Invalid currency') ||
        error.message.includes('Currency conversion not available')) {
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

// Get exchange rates endpoint
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

// Helper endpoint to get available currencies
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

// ✅ FIXED - Update getUserAddresses in checkoutController.js
exports.getUserAddresses = async (req, res) => {
  try {
    // ✅ FIXED - Use session data instead of req.user
    const userId = req.session?.user?.id; // This matches your auth controller
    
    console.log("🔍 Session data:", req.session);
    console.log("🔍 User ID from session:", userId);
    
    if (!userId) {
      console.log("❌ No user ID found in session");
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    const mySQL = require("../config/database.js");
    const connection = await mySQL.getConnection();
    
    try {
      const [addresses] = await connection.query(
        `SELECT address_id, full_name, phone_number, street_address, 
                city, province, postal_code, country, is_default
         FROM user_addresses 
         WHERE user_id = ?
         ORDER BY is_default DESC, created_at DESC`,
        [userId]
      );
      
      console.log(`✅ Found ${addresses.length} addresses for user ${userId}`);
      
      res.status(200).json({
        success: true,
        addresses,
        message: `Found ${addresses.length} addresses`
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Get user addresses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user addresses",
      error: error.message
    });
  }
};