const mySQL = require("../config/database.js");

exports.insertProductQuery = async (productData) => {
  const connection = await mySQL.getConnection();

  try {
    await connection.beginTransaction();

    const productQuery = `
      INSERT INTO product 
      (product_name, product_description, price, stock_quantity, image_url) 
      VALUES (?, ?, ?, ?, ?)
    `;

    const [productResult] = await connection.query(productQuery, [
      productData.product_name,
      productData.product_description,
      productData.price,
      productData.stock_quantity || 0,
      JSON.stringify(productData.image_urls || []), // Store array as JSON
    ]);

    await connection.commit();
    return { success: true, product_id: productResult.insertId };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

exports.getProductsWithoutDiscount = async () => {
  const connection = await mySQL.getConnection();

  try {
    const query = `
      SELECT * FROM product 
      WHERE is_onSale = 0
    `;

    const [rows] = await connection.query(query);
    return { success: true, products: rows };
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

exports.fetchAllProducts = async () => {
  const connection = await mySQL.getConnection();

  try {
    const query = `
      SELECT * FROM product
      WHERE is_active = 1
    `;

    const [rows] = await connection.query(query);
    return { success: true, products: rows };
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

exports.setProductInactive = async (productId) => {
  const connection = await mySQL.getConnection();

  try {
    await connection.beginTransaction();

    const updateQuery = `
      UPDATE product 
      SET is_active = 0, updated_at = CURRENT_TIMESTAMP 
      WHERE product_id = ?
    `
    const [updateResult] = await connection.query(updateQuery, [productId]);

    if (updateResult.affectedRows === 0) {
      throw new Error("Product not found");
    }

    // Fetch updated product
    const [rows] = await connection.query(
      "SELECT * FROM product WHERE product_id = ?",
      [productId]
    );

    await connection.commit();
    return rows[0];
  } catch (err) {
    await connection.rollback();
    console.error("Transaction failed:", err.message);
    throw err;
  } finally {
    connection.release();
  }
}

exports.updateProduct = async (productId, fields) => {
  const connection = await mySQL.getConnection();

  try {
    await connection.beginTransaction();

    // Prepare update statement
    const updateQuery = `
      UPDATE product
      SET 
        product_name = ?, 
        product_description = ?, 
        price = ?, 
        stock_quantity = ?, 
        updated_at = CURRENT_TIMESTAMP
      WHERE product_id = ?
    `;

    const updateValues = [
      fields.product_name,
      fields.product_description,
      fields.price,
      fields.stock_quantity,
      productId
    ];

    const [updateResult] = await connection.query(updateQuery, updateValues);

    if (updateResult.affectedRows === 0) {
      throw new Error("Product not found");
    }

    // Fetch updated product
    const [rows] = await connection.query(
      "SELECT * FROM product WHERE product_id = ?",
      [productId]
    );

    await connection.commit();
    return rows[0];
  } catch (err) {
    await connection.rollback();
    console.error("Error updating product:", err.message);
    throw err;
  } finally {
    connection.release();
  }
};

exports.getProductInformation = async (product_id) => {
  const connection = await mySQL.getConnection();

  try {
    const query = `
      SELECT 
        p.product_id, 
        p.product_name, 
        p.product_description, 
        p.price, 
        p.image_url, 
        p.is_onSale, 
        d.discount_type, 
        d.discount_value, 
        d.end_date,
        p.stock_quantity
      FROM product AS p
      LEFT JOIN product_discounts AS pd ON p.product_id = pd.product_id
      LEFT JOIN discounts AS d ON d.discount_id = pd.discount_id
      WHERE p.product_id = ?
    `;

    const [rows] = await connection.query(query, [product_id]);
    return { success: true, products: rows };
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

exports.getProductList = async (product_id) => {
  const connection = await mySQL.getConnection();

  try {
    const query = `
      SELECT product_id, image_url, price, product_name
      FROM product
      WHERE is_active = 1
    `;

    const [rows] = await connection.query(query);
    return { success: true, products: rows };
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

exports.restorePrices = async () => {
  const connection = await mySQL.getConnection();
  try {
    await connection.beginTransaction();

    const [expiredDiscounts] = await connection.query(`
      SELECT discount_id FROM discounts 
      WHERE end_date < NOW() AND is_active = 1
    `);

    for (const { discount_id } of expiredDiscounts) {
      // Get affected products and their original prices
      const [priceLogs] = await connection.query(`
        SELECT product_id, original_price FROM product_price_log 
        WHERE discount_id = ?
      `, [discount_id]);

      for (const { product_id, original_price } of priceLogs) {
        await connection.query(`
          UPDATE product
          SET price = ?, is_onSale = 0
          WHERE product_id = ?
        `, [original_price, product_id]);
      }

      // Mark discount inactive
      await connection.query(`
        UPDATE discounts SET is_active = 0 WHERE discount_id = ?
      `, [discount_id]);
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error("Failed to restore prices:", error);
  } finally {
    connection.release();
  }
};