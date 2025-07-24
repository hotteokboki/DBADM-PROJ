const mySQL = require("../config/database.js");
const { randomUUID } = require('crypto');

// Generate reference code (e.g., REF-2025-001234)
const generateReferenceCode = async (connection) => {
  const currentYear = new Date().getFullYear();
  
  // Get the latest reference number for current year
  const [lastRef] = await connection.query(
    `SELECT reference_code FROM transactions 
     WHERE reference_code LIKE 'REF-${currentYear}-%' 
     ORDER BY transaction_date DESC
     LIMIT 1`
  );
  
  let nextNumber = 1;
  if (lastRef[0]) {
    // Extract number from REF-2025-001234 format
    const lastNumber = parseInt(lastRef[0].reference_code.split('-')[2]);
    nextNumber = lastNumber + 1;
  }
  
  // Pad with zeros to make it 6 digits
  const paddedNumber = nextNumber.toString().padStart(6, '0');
  return `REF-${currentYear}-${paddedNumber}`;
};

// Get currency conversion rate
const getCurrencyConversion = async (connection, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) {
    return 1;
  }
  
  // Get exchange rates for both currencies
  const [rates] = await connection.query(
    `SELECT currency_code, exchange_rate_to_base 
     FROM currency 
     WHERE currency_code IN (?, ?)`,
    [fromCurrency, toCurrency]
  );
  
  if (rates.length !== 2) {
    throw new Error(`Currency conversion not available from ${fromCurrency} to ${toCurrency}`);
  }
  
  const fromRate = rates.find(r => r.currency_code === fromCurrency)?.exchange_rate_to_base;
  const toRate = rates.find(r => r.currency_code === toCurrency)?.exchange_rate_to_base;
  
  if (!fromRate || !toRate) {
    throw new Error(`Currency conversion rates not found`);
  }
  
  // Convert from base currency: (amount / fromRate) * toRate
  return toRate / fromRate;
};

// ✅ UPDATED - Create shipping address record with separate fields
const createShippingAddress = async (connection, userId, addressData) => {
  const addressId = randomUUID();
  
  // ✅ NEW - Get user's full name from users table
  const [userResult] = await connection.query(
    `SELECT first_name, last_name FROM users WHERE user_id = ?`,
    [userId]
  );
  
  if (!userResult[0]) {
    throw new Error('User not found');
  }
  
  const fullName = `${userResult[0].first_name} ${userResult[0].last_name}`.trim();
  
  // ✅ UPDATED - Insert with separate address fields
  await connection.query(
    `INSERT INTO user_addresses (
      address_id, 
      user_id, 
      full_name, 
      phone_number, 
      street_address, 
      city, 
      province, 
      postal_code, 
      country, 
      is_default
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      addressId,
      userId,
      fullName,
      addressData.phone_number || '',
      addressData.street_address.trim(),
      addressData.city.trim(),
      addressData.province.trim(),
      addressData.postal_code.trim(),
      addressData.country.trim(),
      0   // Not default address
    ]
  );
  
  return addressId;
};

// ✅ UPDATED - Updated processCheckout function
exports.processCheckout = async ({ userId, cartItems, addressId, newAddress, paymentMode, currencyCode = 'PHP' }) => {
  const connection = await mySQL.getConnection();
  try {
    await connection.beginTransaction();

    let finalAddressId = addressId;

    // ✅ UPDATED - Handle address logic
    if (newAddress) {
      // Create new address with separate fields
      console.log("🔵 Creating new shipping address with separate fields:", newAddress);
      finalAddressId = await createShippingAddress(connection, userId, newAddress);
      console.log("🔵 Created address with ID:", finalAddressId);
    } else if (addressId) {
      // ✅ NEW - Validate existing address belongs to user
      const [addressCheck] = await connection.query(
        `SELECT address_id FROM user_addresses WHERE address_id = ? AND user_id = ?`,
        [addressId, userId]
      );
      
      if (!addressCheck[0]) {
        throw new Error('Invalid address for this user');
      }
      console.log("🔵 Using existing address ID:", addressId);
    } else {
      throw new Error('No address provided');
    }

    // Validate currency exists
    const [currencyCheck] = await connection.query(
      `SELECT currency_code FROM currency_codes WHERE currency_code = ?`,
      [currencyCode]
    );
    
    if (!currencyCheck[0]) {
      throw new Error('Invalid currency code');
    }

    // Get payment pending status ID
    const [statusResult] = await connection.query(
      `SELECT status_id FROM transaction_statuses WHERE status_name = 'Payment Pending'`
    );

    if (!statusResult[0]) {
      throw new Error('Payment Pending status not found in database');
    }

    const pendingStatusId = statusResult[0].status_id;
    const baseCurrency = 'PHP';

    // Validate stock and get prices
    const validatedItems = [];
    for (const item of cartItems) {
      const [productCheck] = await connection.query(
        `SELECT product_id, price, stock_quantity, is_active, product_name 
         FROM product 
         WHERE product_id = ?`,
        [item.productId]
      );
      
      if (!productCheck[0]) {
        throw new Error(`Product ${item.productId} not found`);
      }
      
      const product = productCheck[0];
      
      if (!product.is_active) {
        throw new Error(`Product "${product.product_name}" is not available`);
      }
      
      if (product.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for "${product.product_name}". Available: ${product.stock_quantity}, Requested: ${item.quantity}`);
      }

      // Check for current sale price
      const [saleCheck] = await connection.query(
        `SELECT pp.discounted_price 
         FROM product_price_log pp
         JOIN discounts d ON pp.discount_id = d.discount_id
         WHERE pp.product_id = ? 
         AND d.is_active = 1 
         AND NOW() BETWEEN d.start_date AND d.end_date
         ORDER BY pp.created_at DESC 
         LIMIT 1`,
        [item.productId]
      );

      let currentPrice = saleCheck[0] ? saleCheck[0].discounted_price : product.price;
      
      // Convert currency if needed
      if (currencyCode !== baseCurrency) {
        const conversionRate = await getCurrencyConversion(connection, baseCurrency, currencyCode);
        currentPrice = currentPrice * conversionRate;
      }
      
      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        priceAtOrder: currentPrice,
        productName: product.product_name
      });
    }

    // Calculate total
    const totalAmount = validatedItems.reduce((total, item) => {
      return total + (parseFloat(item.priceAtOrder) * item.quantity);
    }, 0);

    // Generate IDs
    const transactionId = randomUUID();
    const orderId = randomUUID();
    const referenceCode = await generateReferenceCode(connection);

    // Create transaction
    await connection.query(
      `INSERT INTO transactions (transaction_id, user_id, amount, status_id, payment_mode, currency_code, reference_code)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [transactionId, userId, totalAmount, pendingStatusId, paymentMode, currencyCode, referenceCode]
    );

    // Create order with final address ID
    await connection.query(
      `INSERT INTO orders (order_id, user_id, order_total_amount, transaction_id, address_id, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [orderId, userId, totalAmount, transactionId, finalAddressId]
    );

    // Add order items and update stock
    for (const item of validatedItems) {
      // Insert order item
      await connection.query(
        `INSERT INTO order_items (order_item_id, order_id, product_id, quantity, price_at_order)
         VALUES (?, ?, ?, ?, ?)`,
        [randomUUID(), orderId, item.productId, item.quantity, item.priceAtOrder]
      );


      // Disable product if out of stock
      await connection.query(
        `UPDATE product 
         SET is_active = 0 
         WHERE product_id = ? AND stock_quantity <= 0`,
        [item.productId]
      );
    }

    // Clear user's cart
    await connection.query(
      `DELETE ci FROM cart_items ci 
       JOIN cart c ON ci.cart_id = c.cart_id 
       WHERE c.user_id = ?`,
      [userId]
    );

    await connection.commit();
    
    return { 
      success: true, 
      message: "Checkout completed successfully", 
      orderId, 
      transactionId,
      referenceCode,
      totalAmount: totalAmount.toFixed(2),
      currency: currencyCode,
      itemCount: validatedItems.length,
      addressId: finalAddressId,
      paymentMode: paymentMode,
      isNewAddress: !!newAddress // ✅ NEW - Indicate if a new address was created
    };
    
  } catch (error) {
    await connection.rollback();
    console.error('Checkout processing error:', error.message);
    throw error;
  } finally {
    connection.release();
  }
};